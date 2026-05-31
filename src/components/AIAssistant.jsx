import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertTriangle, Loader2, CheckCircle2, Swords } from 'lucide-react';
import { sendMessage, getDailyMotivation, analyzeProgress, generateExtraQuests } from '../services/aiAssistant';
import { parseAdminCommands, stripCommandBlocks, executeAdminCommands } from '../logic/adminCommands';

export default function AIAssistant({ state, setState }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('system_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(m => typeof m.content === 'string' && ['user','assistant','system'].includes(m.role))) {
          return parsed;
        }
      }
    } catch {
      // ignore corrupt history
    }
    return [
      { role: 'assistant', content: 'The Forge is hot. I do not coddle. I do not comfort. I forge weak men into warriors. Speak only if you are ready to be hammered.', type: 'welcome' },
    ];
  });
  const [pendingCommands, setPendingCommands] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quickAction, setQuickAction] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem('system_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (overrideText) => {
    const text = overrideText || input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    setLoading(true);

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const rawReply = await sendMessage(text, messages, state);
      const commands = parseAdminCommands(rawReply);
      const cleanReply = stripCommandBlocks(rawReply);

      if (commands.length > 0 && setState) {
        // Show confirmation instead of auto-executing
        setPendingCommands({ commands, cleanReply });
        setMessages(prev => [...prev, { role: 'assistant', content: cleanReply || 'The System processed your request.', type: 'pending-commands' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: cleanReply || 'The System processed your request.' }]);
      }
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err.message}`, type: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCommands = () => {
    if (!pendingCommands || !setState) return;
    let cmdReports = [];
    setState(prevState => {
      const result = executeAdminCommands(prevState, pendingCommands.commands);
      cmdReports = result.reports;
      return result.modified ? result.state : prevState;
    });
    if (cmdReports.length > 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cmdReports.map(r => (r.type === 'success' ? `✓ ${r.message}` : `✗ ${r.message}`)).join('\n'),
        type: 'system-report',
      }]);
    }
    setPendingCommands(null);
  };

  const handleCancelCommands = () => {
    setPendingCommands(null);
    setMessages(prev => [...prev, { role: 'assistant', content: 'Command execution cancelled by user.', type: 'system-report' }]);
  };

  const handleQuickAction = async (action) => {
    setQuickAction(action);
    setLoading(true);
    setError(null);

    try {
      let rawReply;
      let userPrompt;
      if (action === 'motivation') {
        rawReply = await getDailyMotivation(state);
        userPrompt = 'Give me my orders for today';
      } else if (action === 'analyze') {
        rawReply = await analyzeProgress(state);
        userPrompt = 'Audit my progress. Be merciless';
      } else if (action === 'accountability') {
        rawReply = await sendMessage('Hold me accountable. Scan my recent performance and call out every weakness. Do not hold back. I need to hear the truth.', messages, state);
        userPrompt = 'Hold me accountable';
      } else if (action === 'forge3') {
        rawReply = await generateExtraQuests(state, null);
        userPrompt = 'Forge 3 new quests for me';
      }

      const commands = parseAdminCommands(rawReply);
      const cleanReply = stripCommandBlocks(rawReply);

      const assistantMsgs = [
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: cleanReply },
      ];

      if (commands.length > 0 && setState) {
        setPendingCommands({ commands, cleanReply });
        assistantMsgs[1].type = 'pending-commands';
      }

      setMessages(prev => [...prev, ...assistantMsgs]);
    } catch (err) {
      setMessages(prev => [...prev,
        { role: 'user', content: action === 'motivation' ? 'Give me my orders' : action === 'analyze' ? 'Audit me' : action === 'forge3' ? 'Forge 3 new quests' : 'Hold me accountable' },
        { role: 'assistant', content: `⚠️ ${err.message}`, type: 'error' },
      ]);
    } finally {
      setLoading(false);
      setQuickAction(null);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: 'The Forge is hot. I do not coddle. I do not comfort. I forge weak men into warriors. Speak only if you are ready to be hammered.', type: 'welcome' },
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg border-2 transition-colors ${
          isOpen
            ? 'bg-red-900/80 border-red-500/50 text-red-400'
            : 'bg-red-950/80 border-red-600/50 text-red-400'
        }`}
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MessageSquare size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-30 w-[calc(100vw-2rem)] sm:w-[400px] max-h-[70vh] sm:max-h-[600px] flex flex-col rounded-xl border border-red-500/30 overflow-hidden"
            style={{
              background: 'rgba(5, 5, 5, 0.98)',
              boxShadow: '0 0 40px rgba(220, 38, 38, 0.15), 0 20px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-red-900/50 bg-red-950/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-900/50 border border-red-500/30 flex items-center justify-center">
                  <Bot size={16} className="text-red-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-red-200 tracking-wider">FORGE-MASTER</div>
                  <div className="text-[10px] text-red-500/50 uppercase tracking-widest">Zero Excuses Mode</div>
                </div>
              </div>
              <button onClick={clearChat} className="text-[10px] text-red-600 hover:text-red-400 uppercase tracking-wider">Clear</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[50vh] sm:max-h-[450px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === 'user' ? 'bg-cyan-800/40' : msg.type === 'error' ? 'bg-red-900/40' : 'bg-cyan-900/40'
                  }`}>
                    {msg.role === 'user' ? <User size={12} className="text-cyan-300" /> : msg.type === 'error' ? <AlertTriangle size={12} className="text-red-400" /> : <Bot size={12} className="text-cyan-400" />}
                  </div>
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap rounded-lg px-3 py-2 max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-cyan-900/30 text-cyan-100'
                      : msg.type === 'error'
                        ? 'bg-red-950/30 text-red-300 border border-red-900/30'
                        : msg.type === 'welcome'
                          ? 'bg-cyan-950/20 text-cyan-400/80 italic'
                          : msg.type === 'system-report'
                          ? 'bg-green-950/20 text-green-300 border border-green-900/30 text-xs'
                          : 'bg-black/40 text-cyan-200 border border-cyan-900/20'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-900/40 flex items-center justify-center">
                    <Loader2 size={12} className="text-red-400 animate-spin" />
                  </div>
                  <div className="text-xs text-red-500/50 italic">The Forge is burning...⬤⬤⬤</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Command Confirmation */}
            {pendingCommands && (
              <div className="px-3 py-2 border-t border-yellow-700/40 bg-yellow-950/20">
                <div className="text-[10px] text-yellow-400 mb-2 font-semibold tracking-wider">⚠️ PENDING SYSTEM COMMANDS</div>
                <div className="text-xs text-yellow-300/80 mb-2 space-y-0.5">
                  {pendingCommands.commands.map((cmd, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      <span>{cmd.type}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmCommands}
                    className="flex-1 bg-yellow-800/30 hover:bg-yellow-700/40 border border-yellow-600/40 text-yellow-300 py-1.5 rounded text-xs font-semibold transition-colors"
                  >
                    Execute
                  </button>
                  <button
                    onClick={handleCancelCommands}
                    className="flex-1 bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-red-400 py-1.5 rounded text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 px-3 py-2 border-t border-red-900/30 overflow-x-auto">
              <button
                onClick={() => handleQuickAction('motivation')}
                disabled={loading || pendingCommands}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-950/40 border border-red-800/30 text-red-400 hover:bg-red-900/30 whitespace-nowrap disabled:opacity-40"
              >
                <Sparkles size={10} /> Orders
              </button>
              <button
                onClick={() => handleQuickAction('analyze')}
                disabled={loading || pendingCommands}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-950/40 border border-red-800/30 text-red-400 hover:bg-red-900/30 whitespace-nowrap disabled:opacity-40"
              >
                <Bot size={10} /> Audit
              </button>
              <button
                onClick={() => handleQuickAction('accountability')}
                disabled={loading || pendingCommands}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-950/40 border border-red-800/30 text-red-400 hover:bg-red-900/30 whitespace-nowrap disabled:opacity-40"
              >
                <AlertTriangle size={10} /> Hold Me Accountable
              </button>
              <button
                onClick={() => handleQuickAction('forge3')}
                disabled={loading || pendingCommands}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-950/40 border border-red-800/30 text-red-400 hover:bg-red-900/30 whitespace-nowrap disabled:opacity-40"
              >
                <Swords size={10} /> Forge 3
              </button>
            </div>

            {/* Input */}
            <div className="p-2 border-t border-red-900/30">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Report your actions. No excuses."
                  disabled={loading || pendingCommands}
                  className="flex-1 bg-red-950/20 border border-red-800/40 rounded-lg px-3 py-2 text-sm text-red-100 focus:outline-none focus:border-red-500/50 placeholder-red-800/50 disabled:opacity-30"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim() || pendingCommands}
                  className="w-9 h-9 rounded-lg bg-red-800/30 hover:bg-red-700/30 border border-red-600/30 text-red-400 flex items-center justify-center disabled:opacity-30"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
