import React, { useState, useRef, useEffect } from 'react';
import { storage, ChatMessage } from '../../utils/storage';
import { chatWithCoach, parseToolCalls } from '../../utils/ai';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { MODULE_LIBRARY } from '../../data/moduleLibrary';

export default function AICoachTab({ onPlanChange }: { onPlanChange: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(storage.getChatHistory());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    storage.addChatMessage(userMsg);
    setMessages(storage.getChatHistory());
    setInput('');
    setIsLoading(true);

    const responseText = await chatWithCoach(text);
    
    // Parse tool calls
    const calls = parseToolCalls(responseText);
    let planUpdated = false;

    for (const call of calls) {
      if (call.tool === 'update_plan') {
         const current = storage.getActivePlan();
         if (current) {
            storage.setActivePlan({ ...current, weekly_schedule: call.args.new_weekly_schedule });
            planUpdated = true;
         }
      } else if (call.tool === 'update_goal') {
         const p = storage.getProfile();
         if (p) {
           p.goal = call.args.new_goal;
           // In a real flow, checking calories floor constraints again is needed here
           storage.setProfile(p);
         }
      }
    }

    if (planUpdated) onPlanChange();

    // Remove raw JSON from UI
    const cleanText = responseText.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '').trim();
    
    if (cleanText) {
      const modelMsg: ChatMessage = { role: 'model', content: cleanText, timestamp: new Date().toISOString() };
      storage.addChatMessage(modelMsg);
      setMessages(storage.getChatHistory());
    }

    setIsLoading(false);
  };

  const chips = [
    "Review my plan",
    "Log today's workout",
    "How am I doing?"
  ];

  return (
    <div className="flex flex-col h-full bg-background relative">
      <header className="p-4 border-b border-white/5 bg-card/80 backdrop-blur sticky top-0 z-10 flex gap-3 items-center">
         <div className="w-10 h-10 bg-accent2/20 border border-accent2/50 rounded-full flex justify-center items-center">
           <Bot className="text-accent2" size={20} />
         </div>
         <div>
            <h2 className="font-bold">Coach</h2>
            <p className="text-[10px] text-accent1 uppercase tracking-widest font-bold">Online</p>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-12 text-slate400 p-6 animate-fade-in">
            <Sparkles className="mx-auto mb-4 text-accent2 opacity-50" size={32} />
            <p className="text-sm">I'm your FitMind Coach. Ask me to modify your plan, log workouts, or provide nutrition advice!</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            {m.role === 'model' && (
               <div className="shrink-0 w-8 h-8 rounded-full bg-accent2/20 flex items-center justify-center mr-2 mt-1">
                 <Bot size={16} className="text-accent2" />
               </div>
            )}
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-accent1 text-background rounded-tr-sm' : 'bg-card border border-white/10 text-white rounded-tl-sm shadow-md'}`}>
               {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="shrink-0 w-8 h-8 rounded-full bg-accent2/20 flex items-center justify-center mr-2 mt-1">
                 <Bot size={16} className="text-accent2" />
             </div>
             <div className="bg-card border border-white/10 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-accent2" size={16} />
                <span className="text-xs text-slate400">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-background">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
           {chips.map((c, i) => (
             <button key={i} onClick={() => handleSend(c)} className="shrink-0 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full px-4 py-2 text-xs text-slate400 transition-colors whitespace-nowrap">
               {c}
             </button>
           ))}
        </div>
        <div className="flex gap-2 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Message Coach..."
            className="input-field flex-1 pr-12 bg-card rounded-full"
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 w-10 bg-accent1 rounded-full flex items-center justify-center text-background disabled:opacity-50 transition-transform active:scale-90"
          >
            <Send size={18} className="translate-x-[1px]" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate400/50 mt-3">
          FitMind provides general fitness guidance only.
        </p>
      </div>
    </div>
  );
}
