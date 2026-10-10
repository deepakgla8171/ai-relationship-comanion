/**
 * WhatsApp Chat Export Parser
 * Supports Android and iOS formats, 12h/24h timestamps, multiline messages,
 * system messages, Unicode marks (\u200e, \u202f, BOM), and colons in text.
 */

// Common system message keywords or phrases
const SYSTEM_PATTERNS = [
  /Messages and calls are end-to-end encrypted/i,
  /created group/i,
  /added you/i,
  /joined using this group's invite link/i,
  /changed the subject/i,
  /changed this group's icon/i,
  /changed the group description/i,
  /left$/i,
  /removed /i,
  /security code changed/i,
  /disappearing messages/i,
  /<Media omitted>/i,
  /This message was deleted/i,
  /You deleted this message/i
];

/**
 * Regular expressions to detect the beginning of a WhatsApp message.
 * Group 1: Raw timestamp string
 * Group 2: Remainder of line (either "Sender: message" or "System message")
 */
const MESSAGE_REGEXES = [
  // 1. Bracketed iOS format: [12/05/2023, 14:30:15] or [12/5/23, 2:30:15 PM] or [12/05/2023, 14:30]
  /^\[([0-9]{1,4}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{1,4},\s*[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?(?:\s*[AaPp][Mm])?)\]\s*(.*)$/,

  // 2. Standard Android format: 12/05/2023, 14:30 - or 12/5/23, 2:30 PM - or 2023-05-12, 14:30 -
  /^([0-9]{1,4}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{1,4},\s*[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?(?:\s*[AaPp][Mm])?)\s*-\s*(.*)$/,

  // 3. Alternative without comma: 12/05/2023 14:30 -
  /^([0-9]{1,4}[\/\.\-][0-9]{1,2}[\/\.\-][0-9]{1,4}\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?(?:\s*[AaPp][Mm])?)\s*-\s*(.*)$/
];

/**
 * Clean invisible Unicode characters common in WhatsApp exports
 */
const cleanUnicodeMarks = (str) => {
  if (!str) return '';
  return str
    .replace(/^\uFEFF/, '') // Byte order mark
    .replace(/[\u200E\u200F]/g, '') // LTR / RTL marks
    .replace(/\u202F/g, ' ') // Narrow no-break space in French/iOS
    .replace(/\u00A0/g, ' '); // Non-breaking space
};

/**
 * Attempt to parse a date string into a JavaScript Date object
 */
const parseDate = (rawTimestamp) => {
  try {
    const cleaned = cleanUnicodeMarks(rawTimestamp).trim();
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d;
    }

    // Try parsing DD/MM/YYYY or MM/DD/YYYY
    const parts = cleaned.match(/^([0-9]{1,4})[\/\.\-]([0-9]{1,2})[\/\.\-]([0-9]{1,4})[,\s]+([0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?(?:\s*[AaPp][Mm])?)/);
    if (parts) {
      const p1 = parseInt(parts[1], 10);
      const p2 = parseInt(parts[2], 10);
      let p3 = parseInt(parts[3], 10);
      if (p3 < 100) p3 += 2000;

      // Assume DD/MM/YYYY if p1 > 12
      let year, month, day;
      if (p1 > 12) {
        day = p1;
        month = p2 - 1;
        year = p3;
      } else {
        // Fallback standard
        day = p2;
        month = p1 - 1;
        year = p3;
      }

      const timePart = parts[4];
      const parsedTimeDate = new Date(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${timePart}`);
      if (!isNaN(parsedTimeDate.getTime())) {
        return parsedTimeDate;
      }
    }
  } catch {
    // If parse fails, return null
  }
  return null;
};

/**
 * Check if a text is a system notification
 */
const isSystemMessage = (text) => {
  return SYSTEM_PATTERNS.some((pattern) => pattern.test(text));
};

/**
 * Main parse function
 * @param {string} rawContent - The entire raw text from the WhatsApp export file
 * @param {object} options - Optional participant mapping or config
 * @returns {object} Parsed conversation object
 */
const parseWhatsAppChat = (rawContent, options = {}) => {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('Chat content is empty or invalid.');
  }

  const cleanedContent = cleanUnicodeMarks(rawContent);

  if (!cleanedContent.trim()) {
    throw new Error('The uploaded file is empty.');
  }

  const lines = cleanedContent.split(/\r?\n/);

  const messages = [];
  let currentMessage = null;
  const participantCounts = new Map();
  let systemMessageCount = 0;
  let omittedMediaCount = 0;
  let deletedMessageCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line && !currentMessage) continue;

    let matched = false;
    for (const regex of MESSAGE_REGEXES) {
      const match = line.match(regex);
      if (match) {
        matched = true;
        const rawTimestamp = match[1].trim();
        const contentRemainder = match[2].trim();

        // Check if there is a sender separated by a colon
        // e.g. "Alice: Hello there" vs "Messages and calls are end-to-end encrypted..."
        const colonIndex = contentRemainder.indexOf(':');

        let sender = null;
        let messageText = '';
        let isSystem = false;

        if (colonIndex !== -1) {
          const potentialSender = contentRemainder.substring(0, colonIndex).trim();
          // Verify potential sender doesn't match a known system line
          if (!isSystemMessage(potentialSender) && potentialSender.length > 0 && potentialSender.length < 50) {
            sender = potentialSender;
            messageText = contentRemainder.substring(colonIndex + 1).trim();
          }
        }

        if (!sender) {
          // It is a system event
          isSystem = true;
          sender = 'System';
          messageText = contentRemainder;
          systemMessageCount++;
        }

        // Check for media omitted or deleted
        if (messageText.includes('<Media omitted>') || messageText.includes('image omitted') || messageText.includes('audio omitted')) {
          omittedMediaCount++;
        }
        if (messageText.toLowerCase().includes('message was deleted') || messageText.toLowerCase().includes('deleted this message')) {
          deletedMessageCount++;
        }

        if (currentMessage) {
          messages.push(currentMessage);
        }

        currentMessage = {
          rawTimestamp,
          timestamp: parseDate(rawTimestamp),
          sender,
          text: messageText,
          isSystem
        };

        if (!isSystem && sender) {
          participantCounts.set(sender, (participantCounts.get(sender) || 0) + 1);
        }

        break;
      }
    }

    if (!matched) {
      // Multiline message continuation
      if (currentMessage) {
        currentMessage.text += '\n' + line;
      }
    }
  }

  // Push last message
  if (currentMessage) {
    messages.push(currentMessage);
  }

  if (messages.length === 0) {
    throw new Error(
      'No valid WhatsApp messages found. Please ensure the file was exported using WhatsApp "Export chat without media" in standard .txt format.'
    );
  }

  const participants = Array.from(participantCounts.keys());

  // Determine date range
  const validDates = messages.map(m => m.timestamp).filter(d => d instanceof Date && !isNaN(d.getTime()));
  let startDate = null;
  let endDate = null;
  if (validDates.length > 0) {
    startDate = new Date(Math.min(...validDates));
    endDate = new Date(Math.max(...validDates));
  }

  return {
    rawMessageCount: lines.length,
    parsedMessageCount: messages.length,
    participants,
    participantStats: Object.fromEntries(participantCounts),
    dateRange: {
      startDate,
      endDate
    },
    systemMessageCount,
    omittedMediaCount,
    deletedMessageCount,
    messages
  };
};

module.exports = {
  parseWhatsAppChat,
  cleanUnicodeMarks,
  parseDate,
  isSystemMessage
};
