import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { sendMessage, hasApiKey, getDailyMotivation, analyzeProgress } from '../services/aiAssistant';

export default function AIAssistant({ state }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('system_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: 'The System is online. Ask about your quests, request motivation, or submit a custom quest for evaluation.', type: 'welcome' },
    ];
  });
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
      if (!hasApiKey()) {
        throw new Error('OpenRouter API key not configured. Go to Settings → AI Assistant to add your key.');
      }

      const reply = await sendMessage(text, messages, state);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err.message}`, type: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    setQuickAction(action);
    setLoading(true);
    setError(null);

    try {
      let reply;
      if (action === 'motivation') {
        reply = await getDailyMotivation(state);
      } else if (action === 'analyze') {
        reply = await analyzeProgress(state);
      }
      setMessages(prev => [...prev,
        { role: 'user', content: action === 'motivation' ? 'Give me motivation for today' : 'Analyze my progress' },
        { role: 'assistant', content: reply },
      ]);
    } catch (err) {
      setMessages(prev => [...prev,
        { role: 'user', content: action === 'motivation' ? 'Give me motivation' : 'Analyze progress' },
        { role: 'assistant', content: `⚠️ ${err.message}`, type: 'error' },
      ]);
    } finally {
      setLoading(false);
      setQuickAction(null);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: 'Chat cleared. The System is ready.', type: 'welcome' },
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
            : 'bg-cyan-900/80 border-cyan-500/50 text-cyan-400'
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
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-30 w-[calc(100vw-2rem)] sm:w-[400px] max-h-[70vh] sm:max-h-[600px] flex flex-col rounded-xl border border-cyan-500/30 overflow-hidden"
            style={{
              background: 'rgba(5, 5, 5, 0.98)',
              boxShadow: '0 0 40px rgba(0, 212, 255, 0.15), 0 20px 60px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-cyan-900/50 bg-cyan-950/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-900/50 border border-cyan-500/30 flex items-center justify-center">
                  <Bot size={16} className="text-cyan-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-cyan-200">SYSTEM ASSISTANT</div>
                  <div className="text-[10px] text-cyan-500/50">{hasApiKey() ? 'Online' : 'API key missing'}</div>
                </div>
              </div>
              <button onClick={clearChat} className="text-[10px] text-cyan-600 hover:text-cyan-400 uppercase tracking-wider">Clear</button>
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
                          : 'bg-black/40 text-cyan-200 border border-cyan-900/20'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-900/40 flex items-center justify-center">
                    <Loader2 size={12} className="text-cyan-400 animate-spin" />
                  </div>
                  <div className="text-xs text-cyan-500/50 italic">The System is processing...⬤⬤⬤</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 px-3 py-2 border-t border-cyan-900/30 overflow-x-auto">
              <button
                onClick={() => handleQuickAction('motivation')}
                disabled={loading}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 hover:bg-cyan-900/30 whitespace-nowrap disabled:opacity-40"
              >
                <Sparkles size={10} /> Motivation
              </button>
              <button
                onClick={() => handleQuickAction('analyze')}
                disabled={loading}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 hover:bg-cyan-900/30 whitespace-nowrap disabled:opacity-40"
              >
                <Bot size={10} /> Analyze Progress
              </button>
            </div>

            {/* Input */}
            <div className="p-2 border-t border-cyan-900/30">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={hasApiKey() ? 'Ask the System...' : 'Set API key in Settings first'}
                  disabled={loading || !hasApiKey()}
                  className="flex-1 bg-cyan-950/30 border border-cyan-800/40 rounded-lg px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500/50 placeholder-cyan-700/50 disabled:opacity-30"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim() || !hasApiKey()}
                  className="w-9 h-9 rounded-lg bg-cyan-800/30 hover:bg-cyan-700/30 border border-cyan-600/30 text-cyan-400 flex items-center justify-center disabled:opacity-30"
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
