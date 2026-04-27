import React, { useState } from 'react';
import { ActivePlan, storage, UserProfile, WorkoutLog } from '../../utils/storage';
import { MODULE_LIBRARY } from '../../data/moduleLibrary';
import { Check, Droplets, Scale, HelpCircle } from 'lucide-react';

export default function DashboardTab({ profile, plan }: { profile: UserProfile, plan: ActivePlan }) {
  const [logs, setLogs] = useState(storage.getLogs());
  const [water, setWater] = useState(storage.getWaterLogs());
  const [weightLogs, setWeightLogs] = useState(storage.getWeightLogs());
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [rpe, setRpe] = useState<number>(5);

  const todayStr = new Date().toISOString().split('T')[0];
  const dayOfWeek = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()] as keyof typeof plan.weekly_schedule;
  
  const todayModuleId = plan.weekly_schedule[dayOfWeek];
  const isRest = todayModuleId === 'rest';
  const todayModule = isRest ? null : MODULE_LIBRARY.find(m => m.id === todayModuleId);
  const alreadyLoggedToday = logs.some(l => l.date === todayStr && l.module_id === todayModuleId);

  const waterToday = water.find(w => w.date === todayStr)?.amount_ml || 0;
  const lastWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : profile.weight_kg;

  const handleLogWorkout = () => {
    if (!todayModule) return;
    
    const newLog: WorkoutLog = {
      log_id: crypto.randomUUID(),
      date: todayStr,
      module_id: todayModule.id,
      module_name: todayModule.name,
      completed: checkedIds.length === todayModule.exercises.length,
      rpe,
      notes: '',
      duration_actual_mins: todayModule.duration_mins,
      logged_at: new Date().toISOString()
    };
    
    storage.addLog(newLog);
    setLogs(storage.getLogs());
  };

  const handleAddWater = () => {
    storage.addWaterLog(250, todayStr);
    setWater(storage.getWaterLogs());
  };

  const handleUpdateWeight = () => {
    const w = prompt("Enter today's weight (kg):", lastWeight.toString());
    if (w && !isNaN(parseFloat(w))) {
      storage.addWeightLog({ date: todayStr, weight_kg: parseFloat(w) });
      setWeightLogs(storage.getWeightLogs());
    }
  };

  const currentWeekLogs = logs.filter(l => {
    const pd = new Date(l.date).getTime();
    const now = new Date().getTime();
    return (now - pd) <= 7 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accent1 to-green-300 bg-clip-text text-transparent">
          Good morning, {profile.name.split(' ')[0]}
        </h1>
        <p className="text-slate400 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      {/* TODAY'S WORKOUT */}
      <section className="card-container">
        <h2 className="text-xs font-bold text-slate400 uppercase tracking-widest mb-4">Today's Session</h2>
        
        {alreadyLoggedToday ? (
          <div className="bg-accent1/10 border border-accent1/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-accent1 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,255,135,0.4)]">
              <Check className="text-background" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Session Completed</h3>
            <p className="text-slate400 text-sm">Great job crushing {todayModule?.name || 'your workout'} today!</p>
          </div>
        ) : isRest ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
             <div className="text-4xl mb-4">🧘</div>
             <h3 className="text-xl font-bold text-white mb-2">Rest Day</h3>
             <p className="text-slate400 text-sm">Focus on recovery, hydration, and nutrition today.</p>
          </div>
        ) : todayModule ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">{todayModule.name}</h3>
                <p className="text-accent2 text-sm font-medium">{todayModule.split_type.replace('_',' ').toUpperCase()}</p>
              </div>
              <div className="bg-white/10 px-3 py-1 text-sm font-bold rounded-lg text-slate400">
                {todayModule.duration_mins} min
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {todayModule.exercises.map((ex, i) => {
                const isChecked = checkedIds.includes(i);
                return (
                  <div key={i} 
                    onClick={() => setCheckedIds(prev => isChecked ? prev.filter(id => id !== i) : [...prev, i])}
                    className={`p-3 rounded-xl border flex items-center gap-4 cursor-pointer transition-colors ${isChecked ? 'bg-accent1/5 border-accent1/30' : 'bg-background border-white/5 hover:border-white/20'}`}
                  >
                    <div className={`shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-accent1 border-accent1 text-background' : 'border-slate400 text-transparent'}`}>
                      <Check size={16} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isChecked ? 'text-white' : 'text-slate400'}`}>{ex.name}</h4>
                      <p className="text-xs text-slate400">{ex.sets} sets × {ex.reps}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {checkedIds.length > 0 && (
              <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10 animate-fade-in">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate400 font-medium tracking-wide">How hard was this? (RPE)</span>
                  <span className="font-bold text-accent1">{rpe}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" value={rpe} onChange={(e) => setRpe(parseInt(e.target.value))}
                  className="w-full accent-accent1"
                />
              </div>
            )}

            <button 
              disabled={checkedIds.length === 0}
              onClick={handleLogWorkout}
              className="btn-primary w-full disabled:opacity-50 disabled:bg-slate400"
            >
              Log Workout
            </button>
          </div>
        ) : (
           <p className="text-slate400 text-sm">No workout scheduled.</p>
        )}
      </section>

      {/* QUICK STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-xl font-bold">{currentWeekLogs.length}</div>
          <div className="text-[10px] text-slate400 uppercase tracking-widest font-bold">This Week</div>
        </div>
        
        <div onClick={handleAddWater} className="bg-card border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500/50 transition-colors">
          <div className="text-blue-400 mb-1"><Droplets size={24} /></div>
          <div className="text-xl font-bold">{waterToday / 1000}L</div>
          <div className="text-[10px] text-slate400 uppercase tracking-widest font-bold">Tap +250ml</div>
        </div>
        
        <div onClick={handleUpdateWeight} className="bg-card border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/20 transition-colors">
          <div className="text-slate400 mb-1"><Scale size={24} /></div>
          <div className="text-xl font-bold">{lastWeight}</div>
          <div className="text-[10px] text-slate400 uppercase tracking-widest font-bold">Update Kg</div>
        </div>
      </div>

      {/* CALORIE SUMMARY */}
      <section className="bg-card border border-white/5 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate400 uppercase tracking-widest mb-1">Daily Target</h2>
          <div className="text-2xl font-bold text-white">{profile.calorie_target} <span className="text-sm font-normal text-slate400">kcal</span></div>
          <div className="text-xs text-slate400 mt-1">Maint: {profile.tdee} kcal</div>
        </div>
        <div className="text-4xl opacity-20">🍎</div>
      </section>

    </div>
  );
}
