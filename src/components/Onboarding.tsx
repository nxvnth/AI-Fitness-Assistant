import React, { useState } from 'react';
import { calculateTDEE, calculateCaloricTarget, Gender, storage, UserProfile, Goal, ExperienceLevel } from '../utils/storage';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [equipment, setEquipment] = useState<0 | 1 | 2 | null>(null);
  const [days, setDays] = useState(3);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);

  const [warningMessage, setWarningMessage] = useState('');

  const completeOnboarding = () => {
    if (!name || !age || !height || !weight || !goal || equipment === null || !experience) return;

    const tdee = calculateTDEE(weight, height, age, gender, days);
    const { target, isFloor } = calculateCaloricTarget(tdee, goal, gender);

    const profile: UserProfile = {
      name,
      age,
      gender,
      height_cm: height,
      weight_kg: weight,
      goal,
      equipment_tier: equipment,
      experience_level: experience,
      days_per_week: days,
      tdee,
      calorie_target: target,
      created_at: new Date().toISOString(),
      onboarding_complete: true
    };

    storage.setProfile(profile);

    if (isFloor) {
      setWarningMessage("Your calorie target has been set to the minimum safe threshold. Please consult a nutritionist for personalised advice.");
      // Auto complete after short delay to show message
      setTimeout(() => onComplete(), 3000);
    } else {
      onComplete();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-accent1 to-green-300 bg-clip-text text-transparent">Let's get to know you.</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate400 mb-1">First Name</label>
          <input type="text" className="input-field w-full" placeholder="John" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate400 mb-1">Age</label>
            <input type="number" min="13" max="80" className="input-field w-full" placeholder="25" value={age} onChange={e => setAge(parseInt(e.target.value) || '')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate400 mb-1">Gender</label>
            <select className="input-field w-full" value={gender} onChange={e => setGender(e.target.value as Gender)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate400 mb-1">Height (cm)</label>
            <input type="number" className="input-field w-full" placeholder="175" value={height} onChange={e => setHeight(parseInt(e.target.value) || '')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate400 mb-1">Weight (kg)</label>
            <input type="number" className="input-field w-full" placeholder="70" value={weight} onChange={e => setWeight(parseInt(e.target.value) || '')} />
          </div>
        </div>
      </div>
      <button 
        disabled={!name || !age || !height || !weight}
        onClick={() => setStep(2)}
        className="btn-primary w-full flex justify-center items-center gap-2 mt-8 disabled:opacity-50"
      >
        Continue <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-white">What's your primary goal?</h2>
      <div className="grid grid-cols-1 gap-4">
        <GoalCard icon="🏋️" title="Build Strength" desc="Get stronger and build muscle" selected={goal === 'build_strength'} onClick={() => setGoal('build_strength')} />
        <GoalCard icon="🔥" title="Lose Weight" desc="Burn fat and lean out" selected={goal === 'lose_weight'} onClick={() => setGoal('lose_weight')} />
        <GoalCard icon="⚖️" title="Body Recomposition" desc="Lose fat and build muscle simultaneously" selected={goal === 'body_recomp'} onClick={() => setGoal('body_recomp')} />
        <GoalCard icon="💚" title="General Health" desc="Improve fitness and feel better" selected={goal === 'good_health'} onClick={() => setGoal('good_health')} />
      </div>
      <button 
        disabled={!goal}
        onClick={() => setStep(3)}
        className="btn-primary w-full flex justify-center items-center gap-2 mt-8 disabled:opacity-50"
      >
        Continue <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-white">Your Training Setup</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate400 mb-3">Equipment Access</label>
          <div className="space-y-3">
            <RadioSelection 
              label="No equipment (bodyweight only)" 
              selected={equipment === 0} 
              onClick={() => setEquipment(0)} 
            />
            <RadioSelection 
              label="Home setup (dumbbells/bands)" 
              selected={equipment === 1} 
              onClick={() => setEquipment(1)} 
            />
            <RadioSelection 
              label="Full gym access" 
              selected={equipment === 2} 
              onClick={() => setEquipment(2)} 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate400 mb-3">Training Days Per Week: {days}</label>
          <input 
            type="range" min="2" max="6" value={days} onChange={e => setDays(parseInt(e.target.value))}
            className="w-full accent-accent1"
          />
          <div className="flex justify-between text-xs text-slate400 px-1 mt-1">
            <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
          </div>
        </div>
      </div>
      
      <button 
        disabled={equipment === null}
        onClick={() => setStep(4)}
        className="btn-primary w-full flex justify-center items-center gap-2 mt-8 disabled:opacity-50"
      >
        Continue <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-white">Experience Level</h2>
      <div className="space-y-4">
        <GoalCard 
          icon="🌱" title="Complete Beginner" desc="Never worked out consistently" 
          selected={experience === 'beginner'} onClick={() => setExperience('beginner')} 
        />
        <GoalCard 
          icon="📈" title="Some Experience" desc="Been inconsistent recently" 
          selected={experience === 'intermediate'} onClick={() => setExperience('intermediate')} 
        />
        <GoalCard 
          icon="💪" title="Consistent Trainee" desc="Currently training, want a better plan" 
          selected={experience === 'advanced'} onClick={() => setExperience('advanced')} 
        />
      </div>

      <p className="text-sm text-slate400 text-center italic">
        "This helps us start at the right pace — not too easy, not overwhelming."
      </p>

      {warningMessage && (
        <div className="bg-orange-500/20 border border-orange-500/50 p-4 rounded-xl flex items-start gap-3 mt-4">
          <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-orange-200">{warningMessage}</p>
        </div>
      )}

      <button 
        disabled={!experience || !!warningMessage}
        onClick={completeOnboarding}
        className="btn-primary w-full flex justify-center items-center gap-2 mt-8 disabled:opacity-50"
      >
        Finish Setup <ArrowRight size={20} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-accent1/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-accent2/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-md w-full mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-accent1' : (i < step ? 'w-4 bg-accent1/50' : 'w-4 bg-white/10')}`}></div>
            ))}
          </div>
          <span className="text-xs font-bold text-slate400 tracking-widest uppercase">Step {step} of 4</span>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
}

function GoalCard({ icon, title, desc, selected, onClick }: { icon: string, title: string, desc: string, selected: boolean, onClick: () => void }) {
  return (
    <div 
      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 items-center ${selected ? 'bg-accent1/10 border-accent1' : 'bg-card border-transparent hover:border-white/10'}`}
      onClick={onClick}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-slate400">{desc}</p>
      </div>
    </div>
  );
}

function RadioSelection({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {
  return (
    <div 
      className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${selected ? 'bg-accent1/10 border-accent1 text-white' : 'bg-card border-transparent text-slate400 hover:text-white hover:border-white/10'}`}
      onClick={onClick}
    >
      <span className="font-medium">{label}</span>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-accent1' : 'border-slate400'}`}>
        {selected && <div className="w-2.5 h-2.5 bg-accent1 rounded-full"></div>}
      </div>
    </div>
  );
}
