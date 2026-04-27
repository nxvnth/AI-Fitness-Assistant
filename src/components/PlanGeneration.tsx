import React, { useState } from 'react';
import { ActivePlan, UserProfile, storage } from '../utils/storage';
import { generatePlan } from '../utils/ai';
import { MODULE_LIBRARY } from '../data/moduleLibrary';
import { Bot, Check, Loader2, ArrowRight } from 'lucide-react';

export default function PlanGeneration({ profile, onComplete }: { profile: UserProfile, onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<ActivePlan | null>(null);
  const [error, setError] = useState('');

  const handleAnswer = async (qKey: 'q1' | 'q2' | 'q3', answer: string) => {
    const updated = { ...answers, [qKey]: answer };
    setAnswers(updated);
    
    if (qKey === 'q1') setStep(1);
    else if (qKey === 'q2' && profile.equipment_tier === 2) setStep(2);
    else if (qKey === 'q2' || qKey === 'q3') {
      // Start generation
      setStep(3);
      setIsGenerating(true);
      setError('');
      
      const plan = await generatePlan(profile, updated);
      setIsGenerating(false);
      
      if (plan) {
        setGeneratedPlan(plan);
        setStep(4);
      } else {
        setError('Failed to generate a safe plan. Please try again or adjust your goals.');
        setStep(profile.equipment_tier === 2 ? 2 : 1); // Go back to last question
      }
    }
  };

  const confirmPlan = () => {
    if (generatedPlan) {
      storage.setActivePlan(generatedPlan);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 sm:p-12">
      <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
        
        {step < 3 && (
           <div className="space-y-8 animate-fade-in">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-12 h-12 rounded-full bg-accent2/20 flex items-center justify-center border border-accent2/50 backdrop-blur-sm">
                 <Bot className="text-accent2" size={24} />
               </div>
               <div>
                 <h2 className="text-xl font-bold">FitMind Coach</h2>
                 <p className="text-xs text-slate400">Let's fine-tune your program.</p>
               </div>
             </div>

             <ChatBubble text="Have you done structured training before, or would you prefer to build up from scratch?" delay={0} />
             {step === 0 && (
               <div className="space-y-3 pl-8">
                 <AnswerButton text="Build from scratch" onClick={() => handleAnswer('q1', 'Build from scratch')} />
                 <AnswerButton text="I've followed programs before" onClick={() => handleAnswer('q1', 'Followed programs before')} />
               </div>
             )}

             {step > 0 && <UserBubble text={answers.q1} />}

             {step >= 1 && (
               <>
                 <ChatBubble text="How much time can you give to each session?" delay={300} />
                 {step === 1 && (
                   <div className="space-y-3 pl-8">
                     <AnswerButton text="20-30 mins" onClick={() => handleAnswer('q2', '20-30 mins')} />
                     <AnswerButton text="30-45 mins" onClick={() => handleAnswer('q2', '30-45 mins')} />
                     <AnswerButton text="45-60 mins" onClick={() => handleAnswer('q2', '45-60 mins')} />
                     <AnswerButton text="60+ mins" onClick={() => handleAnswer('q2', '60+ mins')} />
                   </div>
                 )}
               </>
             )}

             {step > 1 && <UserBubble text={answers.q2} />}

             {step >= 2 && profile.equipment_tier === 2 && (
               <>
                 <ChatBubble text="Any areas you specifically want to focus on?" delay={300} />
                 {step === 2 && (
                   <div className="space-y-3 pl-8">
                     <AnswerButton text="Upper body" onClick={() => handleAnswer('q3', 'Upper body focus')} />
                     <AnswerButton text="Lower body" onClick={() => handleAnswer('q3', 'Lower body focus')} />
                     <AnswerButton text="Core" onClick={() => handleAnswer('q3', 'Core focus')} />
                     <AnswerButton text="No preference (Balanced)" onClick={() => handleAnswer('q3', 'Balanced / No preference')} />
                   </div>
                 )}
               </>
             )}
             
             {step > 2 && profile.equipment_tier === 2 && <UserBubble text={answers.q3} />}

             {error && <div className="text-red-400 text-sm mt-4 p-4 bg-red-400/10 rounded-xl">{error}</div>}
           </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center space-y-6 flex-1 animate-fade-in">
             <div className="relative">
               <div className="absolute inset-0 bg-accent1/30 rounded-full blur-xl animate-pulse"></div>
               <Loader2 className="animate-spin text-accent1 relative z-10" size={64} />
             </div>
             <p className="text-lg font-bold text-white tracking-wide text-center">
               Building your<br/>personalised plan...
             </p>
          </div>
        )}

        {step === 4 && generatedPlan && (
          <div className="space-y-6 animate-fade-in pb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-accent1 to-green-300 bg-clip-text text-transparent">Your Plan is Ready</h2>
            
            <div className="card-container">
              <h3 className="text-lg font-bold mb-4">{generatedPlan.plan_name}</h3>
              
              <div className="space-y-2 mb-6">
                {Object.entries(generatedPlan.weekly_schedule).map(([day, moduleId]) => {
                  const isRest = moduleId === 'rest';
                  const mod = MODULE_LIBRARY.find(m => m.id === moduleId);
                  return (
                    <div key={day} className={`flex items-center gap-4 p-3 rounded-xl border ${isRest ? 'border-white/5 bg-background shadow-inner' : 'border-white/10 bg-white/5'}`}>
                      <div className="w-10 text-xs font-bold text-slate400 uppercase tracking-widest">{day.substring(0,3)}</div>
                      <div className="flex-1 font-medium">{isRest ? 'Rest' : (mod?.name || moduleId)}</div>
                      {!isRest && <div className="text-xs px-2 py-1 bg-white/10 rounded text-slate400">{(mod?.duration_mins || 0)}m</div>}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="bg-accent2/10 border border-accent2/30 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-accent2 uppercase tracking-widest mb-1">Coach's Note</h4>
                  <p className="text-sm leading-relaxed">{generatedPlan.rationale}</p>
                </div>
                
                <div className="bg-accent1/10 border border-accent1/30 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-accent1 uppercase tracking-widest mb-1">Progression</h4>
                  <p className="text-sm leading-relaxed">{generatedPlan.progression_note}</p>
                </div>
              </div>
            </div>

            <button onClick={confirmPlan} className="btn-primary w-full flex justify-center items-center gap-2 mt-8 py-4 text-lg">
              Start This Plan <Check size={24} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function ChatBubble({ text, delay }: { text: string, delay: number }) {
  const [visible, setVisible] = useState(delay === 0);

  React.useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);

  if (!visible) return null;

  return (
    <div className="bg-card border border-white/10 rounded-2xl rounded-tl-sm p-4 text-white shadow-lg mr-12 animate-fade-in-up">
      {text}
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="bg-accent2 text-white rounded-2xl rounded-tr-sm p-4 shadow-lg ml-12 animate-fade-in-up">
      {text}
    </div>
  );
}

function AnswerButton({ text, onClick }: { text: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="block w-full text-left bg-transparent border border-accent1/50 text-accent1 hover:bg-accent1/10 rounded-xl px-4 py-3 font-medium transition-colors"
    >
      {text}
    </button>
  );
}
