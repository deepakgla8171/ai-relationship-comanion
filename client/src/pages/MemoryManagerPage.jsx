import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  AlertTriangle,
  Loader2,
  Tag
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Alert } from '../components/Alert';
import { api } from '../services/api';

export const MemoryManagerPage = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for adding/editing
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [memoryContent, setMemoryContent] = useState('');
  const [memoryCategory, setMemoryCategory] = useState('preference');
  const [saving, setSaving] = useState(false);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await api.memories.getAll();
      setMemories(res.memories || []);
    } catch (err) {
      setError(err.message || 'Failed to load memories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMemory(null);
    setMemoryContent('');
    setMemoryCategory('preference');
    setModalOpen(true);
  };

  const handleOpenEditModal = (mem) => {
    setEditingMemory(mem);
    setMemoryContent(mem.content);
    setMemoryCategory(mem.category || 'preference');
    setModalOpen(true);
  };

  const handleSaveMemory = async (e) => {
    e.preventDefault();
    if (!memoryContent.trim()) return;

    if (memoryContent.length > 250) {
      setError('Memory content exceeds maximum limit of 250 characters.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingMemory) {
        const id = editingMemory._id || editingMemory.id;
        const res = await api.memories.update(id, {
          content: memoryContent.trim(),
          category: memoryCategory
        });
        if (res.success && res.memory) {
          setMemories(memories.map((m) => ((m._id || m.id) === id ? res.memory : m)));
          setModalOpen(false);
        }
      } else {
        const res = await api.memories.create({
          content: memoryContent.trim(),
          category: memoryCategory,
          isApproved: true
        });
        if (res.success && res.memory) {
          setMemories([res.memory, ...memories]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save memory.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('Delete this memory? The companion will no longer reference it.')) return;

    try {
      await api.memories.delete(id);
      setMemories(memories.filter((m) => (m._id || m.id) !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleToggleApproval = async (mem) => {
    const id = mem._id || mem.id;
    try {
      const res = await api.memories.update(id, { isApproved: !mem.isApproved });
      if (res.success && res.memory) {
        setMemories(memories.map((m) => ((m._id || m.id) === id ? res.memory : m)));
      }
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL conversational memories? This cannot be undone.')) {
      return;
    }

    try {
      await api.memories.clearAll();
      setMemories([]);
    } catch (err) {
      alert(`Clear failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-indigo-400" />
            <span>Companion <span className="gradient-text">Memory Manager</span></span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            You hold 100% control over what the companion remembers. Review, modify, or erase preferences anytime.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {memories.length > 0 && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleClearAll}
              icon={Trash2}
            >
              Clear All
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            onClick={handleOpenAddModal}
            icon={Plus}
          >
            Add Memory
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Memory Notice" message={error} onClose={() => setError(null)} />
      )}

      {/* Strict Privacy Guarantee Box */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <span className="font-semibold text-slate-200">User-Controlled Memory Policy:</span>
          <p>
            Unlike raw chat logs, companion memories only contain explicitly user-approved preferences, communication nuances, or boundaries. We never store personal identification numbers or passwords.
          </p>
        </div>
      </div>

      {/* Memory Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : memories.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-200 text-base">No Memories Saved Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add your first communication preference, preferred tone, or boundaries so the AI companion tailors its replies.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenAddModal} icon={Plus}>
            Add First Memory
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => {
            const id = mem._id || mem.id;
            return (
              <Card key={id} className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {mem.category || 'preference'}
                    </span>
                    <button
                      onClick={() => handleToggleApproval(mem)}
                      className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                        mem.isApproved
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                      title="Toggle active status"
                    >
                      {mem.isApproved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-400" /> Paused
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-sans">
                    "{mem.content}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] text-slate-500">
                    Source: {mem.source === 'conversation_approved' ? 'Chat Approved' : 'Manual'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(mem)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Edit memory"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMemory(id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Memory Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMemory ? 'Edit Companion Memory' : 'Create New Companion Memory'}
        subtitle="Memories guide the AI companion's tone, language, and response style."
      >
        <form onSubmit={handleSaveMemory} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Memory Category</label>
            <select
              value={memoryCategory}
              onChange={(e) => setMemoryCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="preference">Communication Preference</option>
              <option value="language">Language & Phrasing</option>
              <option value="tone">Tone Preference</option>
              <option value="topic">Topic of Importance</option>
              <option value="boundary">Personal Boundary</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">Memory Content</label>
              <span className={`text-[11px] ${memoryContent.length > 250 ? 'text-rose-400' : 'text-slate-500'}`}>
                {memoryContent.length} / 250 characters
              </span>
            </div>
            <textarea
              rows={3}
              value={memoryContent}
              onChange={(e) => setMemoryContent(e.target.value)}
              maxLength={250}
              placeholder="e.g. Prefers gentle reassurance when feeling overwhelmed by work meetings..."
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={saving}
              disabled={!memoryContent.trim() || memoryContent.length > 250}
            >
              {editingMemory ? 'Update Memory' : 'Save Memory'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
