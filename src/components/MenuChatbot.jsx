import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, Utensils, Sparkles } from 'lucide-react';

export default function MenuChatbot({ menu = [], restaurantName = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: `Hi! I'm your AI Menu Assistant for ${restaurantName}. What would you like to eat today?`, dishes: [] }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      processQuery(userMessage);
    }, 1000);
  };

  const getLevenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const processQuery = (query) => {
    const stopWords = ['only', 'show', 'items', 'item', 'with', 'for', 'want', 'please', 'can', 'you', 'give', 'me', 'the', 'what', 'are'];
    const qRaw = query.toLowerCase().trim();
    
    // Remove stop words to find significant keywords
    const qWords = qRaw.split(/\s+/).filter(w => w.length > 1);
    const significantWords = qWords.filter(w => !stopWords.includes(w));
    
    // If we removed everything, fall back to the raw query
    const searchWords = significantWords.length > 0 ? significantWords : qWords;
    
    const results = menu.filter(dish => {
      const targetFields = [
        dish.name.toLowerCase(),
        dish.category.toLowerCase(),
        ...(dish.description ? [dish.description.toLowerCase()] : [])
      ];

      // 1. Check if ANY significant keyword matches exactly or partially
      const hasDirectMatch = searchWords.some(sWord => 
        targetFields.some(field => field.includes(sWord))
      );
      if (hasDirectMatch) return true;

      // 2. Fuzzy match significant words (Levenstein Distance)
      return searchWords.some(sWord => {
        return targetFields.some(field => {
          const fieldWords = field.split(/\s+/);
          return fieldWords.some(fWord => {
            const distance = getLevenshteinDistance(sWord, fWord);
            const threshold = sWord.length > 5 ? 2 : 1;
            return distance <= threshold;
          });
        });
      });
    });

    let responseText = "";
    if (results.length > 0) {
      responseText = `I found ${results.length} dish(es) that seem to match your request. Here they are:`;
    } else {
      responseText = `Please Visit the Menu For Clarification`;
    }

    setMessages(prev => [...prev, { 
      type: 'bot', 
      text: responseText, 
      dishes: results.slice(0, 5) 
    }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] glass-panel rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary-600/20 to-accent-600/20 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                  <Sparkles className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none">LinkRas AI</h3>
                  <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.type === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    
                    {msg.dishes && msg.dishes.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {msg.dishes.map(dish => (
                          <div key={dish.id} className="p-3 bg-black/30 rounded-xl border border-white/5 flex justify-between items-center group">
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-bold text-white truncate">{dish.name}</h4>
                              <p className="text-[10px] text-gray-500 truncate">{dish.category}</p>
                            </div>
                            <span className="text-emerald-400 font-bold text-xs pl-2">₹{dish.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 flex gap-1">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setInputValue("Only show ")}
                className="whitespace-nowrap px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                Only show .......
              </button>
              <button 
                onClick={() => setInputValue("Item with ")}
                className="whitespace-nowrap px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                Item with ......
              </button>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-black/20">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about a dish..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary-500 transition-all"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1.5 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-transform active:scale-95 shadow-lg shadow-primary-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button with Generated AI Icon */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* We use the generated icon here */}
        <img 
          src="/ai-assistant-icon.png" 
          alt="AI Assistant" 
          className="w-10 h-10 object-contain drop-shadow-md brightness-110"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} 
        />
        <MessageSquare className="w-8 h-8 text-white hidden" />
        
        {/* Glow effect */}
        <div className="absolute -inset-2 bg-primary-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.button>
    </div>
  );
}
