import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Users, 
  ShieldCheck,
  Loader2,
  X
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { api } from '../services/api';

export const ImportChatPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedPreview, setParsedPreview] = useState(null);

  // Participant Mapping State
  const [participantMapping, setParticipantMapping] = useState({});
  const [aiConsentChecked, setAiConsentChecked] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    setError(null);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError('Invalid file type. Only WhatsApp chat export .txt files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5 MB limit. Please select a smaller export file.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadAndParse = async () => {
    if (!selectedFile) {
      setError('Please choose or drag a .txt WhatsApp export file first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (Object.keys(participantMapping).length > 0) {
        formData.append('participantMapping', JSON.stringify(participantMapping));
      }

      const res = await api.chats.upload(formData);
      if (res.success && res.chat) {
        setParsedPreview(res.chat);
        // Initialize participant mappings
        const initialMap = {};
        res.chat.participants.forEach((p, idx) => {
          initialMap[p] = idx === 0 ? 'Me' : 'Partner';
        });
        setParticipantMapping(initialMap);
      }
    } catch (err) {
      setError(err.message || 'Failed to parse chat export file.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleChat = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.chats.upload({ sample: true });
      if (res.success && res.chat) {
        setParsedPreview(res.chat);
        const initialMap = {};
        res.chat.participants.forEach((p) => {
          initialMap[p] = p === 'Deepak' ? 'Me' : 'Partner';
        });
        setParticipantMapping(initialMap);
      }
    } catch (err) {
      setError(err.message || 'Failed to load synthetic sample chat.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToAnalysis = () => {
    if (!parsedPreview) return;
    navigate(`/analysis?id=${parsedPreview.id}`);
  };

  return (
    <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-100">
          Import WhatsApp Chat <span className="gradient-text">Export</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Upload a <code className="text-indigo-300 font-mono">.txt</code> file generated via WhatsApp's "Export chat without media". We parse timestamps, multiline messages, and participants locally.
        </p>
      </div>

      {error && (
        <Alert type="error" title="Import Error" message={error} onClose={() => setError(null)} />
      )}

      {/* Main Upload Area */}
      {!parsedPreview ? (
        <div className="space-y-6">
          <Card glow className="p-8">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-7 h-7" />
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-emerald-400 text-sm flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop another file to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium text-slate-200 text-sm">
                      Drag and drop your exported <span className="text-indigo-400">.txt</span> file here, or click to browse
                    </p>
                    <p className="text-xs text-slate-500">
                      Standard WhatsApp export format • Max size 5 MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSampleChat}
                loading={loading}
                icon={Sparkles}
              >
                Or Load Synthetic Sample (Priya & Deepak)
              </Button>

              <Button
                variant="primary"
                onClick={handleUploadAndParse}
                disabled={!selectedFile}
                loading={loading}
                icon={ArrowRight}
                className="w-full sm:w-auto"
              >
                Parse & Preview
              </Button>
            </div>
          </Card>

          {/* Guidelines Box */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> WhatsApp Export Instructions:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 ml-1">
              <li>Open WhatsApp on your phone and open the conversation you wish to analyze.</li>
              <li>Tap Chat Info (or three dots menu) → More → <strong>Export Chat</strong>.</li>
              <li>Choose <strong>"Without Media"</strong> to generate a clean <code className="text-indigo-300">.txt</code> file.</li>
              <li>Upload the generated text file above. Media files (photos/audio) are safely omitted.</li>
            </ol>
          </div>
        </div>
      ) : (
        /* Parsed Preview & Participant Mapping View */
        <div className="space-y-6">
          <Alert type="success" title="Parsing Complete!">
            Successfully parsed <strong>{parsedPreview.parsedMessageCount}</strong> messages from{' '}
            <code>{parsedPreview.fileName}</code>.
          </Alert>

          {/* Participant Mapping Card */}
          <Card title="Participant Identification & Role Mapping" icon={Users}>
            <p className="text-xs text-slate-400 mb-4">
              Map the detected participants from the chat export to custom display labels so the companion understands conversational dynamics accurately:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {parsedPreview.participants?.map((participant) => (
                <div key={participant} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-1.5">
                  <span className="text-xs font-semibold text-indigo-300">Raw Name: {participant}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Display As:</span>
                    <select
                      value={participantMapping[participant] || 'Participant'}
                      onChange={(e) =>
                        setParticipantMapping({ ...participantMapping, [participant]: e.target.value })
                      }
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Me">Me (Self)</option>
                      <option value="Partner">Partner</option>
                      <option value="Friend">Friend</option>
                      <option value="Colleague">Colleague</option>
                      <option value={participant}>Keep Original ({participant})</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* First 5 Preview Messages */}
          <Card title="Preview Parsed Messages (First 5)">
            <div className="space-y-3 font-mono text-xs">
              {parsedPreview.previewMessages?.map((msg, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    {msg.rawTimestamp}
                  </span>
                  <div>
                    <span className={`font-semibold mr-2 ${msg.isSystem ? 'text-amber-400' : 'text-indigo-400'}`}>
                      {msg.sender}:
                    </span>
                    <span className="text-slate-300 font-sans">{msg.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Explicit AI Consent Checkbox */}
          <Card className="border-indigo-500/30">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aiConsentChecked}
                onChange={(e) => setAiConsentChecked(e.target.checked)}
                className="mt-1 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <div className="text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-slate-100">
                  Explicit Consent for AI Emotion & Tone Analysis
                </span>
                <p className="text-slate-400 leading-relaxed">
                  I understand that this analysis produces computational pattern estimates based solely on quoted text. The AI assistant does not diagnose mental health conditions and does not impersonate any individual.
                </p>
              </div>
            </label>
          </Card>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setParsedPreview(null);
                setSelectedFile(null);
              }}
            >
              Upload Different File
            </Button>

            <Button
              variant="primary"
              onClick={handleProceedToAnalysis}
              disabled={!aiConsentChecked}
              icon={ArrowRight}
            >
              Proceed to Analysis Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
