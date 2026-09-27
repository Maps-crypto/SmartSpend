import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatModal: React.FC = () => {
  const { cart, budget, getTotalTrueCost } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your SmartSpend AI Grocery Advisor powered by Gemini. Ask me for South African supermarket price comparisons across Checkers, Woolworths, and Pick n Pay, budget recipes, or money-saving tips!"
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Call server-side API or fallback to intelligent SA grocery assistant logic
      const totalSpent = getTotalTrueCost();
      const remaining = budget - totalSpent;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: {
            cartItemsCount: cart.length,
            totalSpent,
            budget,
            remaining,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        // Fallback smart SA response if endpoint not responding
        let reply = "Here is a smart tip for South African grocery shopping: Checkers Xtra Savings and Pick n Pay Smart Shopper cards can save you up to 20% on essentials like milk, rice, and maize meal.";
        if (userMsg.toLowerCase().includes('budget') || userMsg.toLowerCase().includes('save')) {
          reply = `Your current cart total is R${totalSpent.toFixed(2)}${budget > 0 ? ` out of your R${budget.toFixed(0)} budget` : ''}. To save more, consider buying house brands (Checkers Housebrand or Pick n Pay No Name) which are up to 30% cheaper than premium brands.`;
        } else if (userMsg.toLowerCase().includes('woolworths') || userMsg.toLowerCase().includes('checkers')) {
          reply = "Checkers is generally more cost-effective for bulk pantry items and fresh produce specials, whereas Woolworths excels in premium ready-meals and organic selections.";
        }
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "To stay under budget in South Africa, compare unit prices per kilogram or litre, buy seasonal vegetables, and make use of loyalty cards!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group"
        aria-label="Open AI Chat Assistant"
        title="Ask SmartSpend AI Advisor"
      >
        <Sparkles className="w-6 h-6 text-amber-300 animate-pulse absolute -top-1 -right-1" />
        <Bot className="w-7 h-7" />
      </button>

      {/* Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full z-10 border-l border-gray-100">
            {/* Header */}
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Bot className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-1.5">
                    SmartSpend AI Advisor
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <p className="text-[11px] text-emerald-200">Powered by Gemini • SA Grocery Expert</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggested Prompts */}
            <div className="p-3 bg-emerald-50/80 border-b border-emerald-100 flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  setInput("How can I save R100 on my weekly groceries?");
                }}
                className="shrink-0 px-3 py-1.5 bg-white text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 hover:bg-emerald-100 shadow-2xs"
              >
                💡 Save R100 this week
              </button>
              <button
                onClick={() => {
                  setInput("Checkers vs Woolworths price comparison");
                }}
                className="shrink-0 px-3 py-1.5 bg-white text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 hover:bg-emerald-100 shadow-2xs"
              >
                🛒 Checkers vs Woolworths
              </button>
              <button
                onClick={() => {
                  setInput("Budget meal plan for 4 people");
                }}
                className="shrink-0 px-3 py-1.5 bg-white text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 hover:bg-emerald-100 shadow-2xs"
              >
                🍳 Budget family meal plan
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      m.role === 'user'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-teal-700 text-white shadow-sm'
                    }`}
                  >
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-300" />}
                  </div>

                  <div
                    className={`max-w-[78%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-emerald-700 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-gray-800 rounded-tl-xs shadow-sm border border-gray-100'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>AI Advisor is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about prices, recipes, or savings..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-2xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none border border-transparent focus:border-gray-200"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl shadow-sm disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
