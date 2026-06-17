import React from 'react';
import { Send, HelpCircle, Bot, User } from 'lucide-react';

export interface Message {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

interface AICoachChatFeedProps {
  messages: Message[];
  isTyping: boolean;
  inputVal: string;
  setInputVal: (val: string) => void;
  handleSendMessage: (text: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const AICoachChatFeed: React.FC<AICoachChatFeedProps> = ({
  messages,
  isTyping,
  inputVal,
  setInputVal,
  handleSendMessage,
  messagesEndRef
}) => {
  const smartPrompts = [
    { text: '💡 How do I lower my electricity bill?', category: 'energy' },
    { text: '🥗 Suggest a low-carbon lunch recipe', category: 'food' },
    { text: '🚗 Tips for carbon-efficient commutes', category: 'travel' },
    { text: '🛍️ How to avoid greenwashed products?', category: 'shopping' }
  ];

  return (
    <>
      {/* Message Feed Area */}
      <div role="log" aria-live="polite" className="flex-grow overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isCoach = msg.sender === 'coach';
          return (
            <div
              key={msg.id}
              aria-label={isCoach ? "Coach replied" : "You sent"}
              className={`flex items-start gap-3.5 ${!isCoach ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar indicator */}
              <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-white/5 ${
                isCoach ? 'bg-slate-900 text-eco-400' : 'bg-slate-800 text-cyan-400'
              }`}>
                {isCoach ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Chat bubble text */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                isCoach
                  ? 'bg-slate-900/50 border border-white/5 text-slate-200'
                  : 'bg-gradient-to-tr from-cyan-950/40 to-indigo-950/40 border border-cyan-500/10 text-white'
              }`}>
                {msg.text}
                <span className="block text-[9px] text-slate-500 mt-2 text-right font-medium">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing Loader bubble */}
        {isTyping && (
          <div className="flex items-start gap-3.5">
            <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center border border-white/5 bg-slate-900 text-eco-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-eco-400 typing-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-eco-400 typing-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-eco-400 typing-dot" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts footer */}
      {messages.length === 1 && (
        <div className="px-6 pb-2.5">
          <div className="flex items-center gap-1 mb-2 text-[10px] text-slate-400 font-bold uppercase select-none">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Try clicking common coaching questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartPrompts.map((prompt) => (
              <button
                key={prompt.text}
                type="button"
                onClick={() => handleSendMessage(prompt.text)}
                className="text-[11px] font-bold text-slate-300 bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-slate-700/50 px-3.5 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputVal);
        }}
        className="p-5 border-t border-slate-800/80 bg-slate-900/20 flex gap-3"
      >
        <label htmlFor="chat-input" className="sr-only">Ask your climate coach</label>
        <input
          id="chat-input"
          type="text"
          placeholder="Ask anything about carbon footprints, recipes, energy..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="glass-input flex-grow text-xs py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          aria-label="Send message"
          className="glass-btn-primary p-3 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </>
  );
};
export default AICoachChatFeed;
