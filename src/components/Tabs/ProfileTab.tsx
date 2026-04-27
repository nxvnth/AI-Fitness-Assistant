import React from 'react';
import { UserProfile, storage } from '../../utils/storage';
import { LogOut, Trash2 } from 'lucide-react';

export default function ProfileTab({ profile, onReset }: { profile: UserProfile, onReset: () => void }) {
  const handleReset = () => {
    if (confirm("Are you sure you want to delete all data? This cannot be undone.")) {
      onReset();
    }
  };

  const planHistory = storage.getPlanHistory();
  const weightLogs = storage.getWeightLogs();

  return (
    <div className="p-6 space-y-6">
      <header className="mb-8 font-bold text-2xl">Profile</header>

      <div className="card-container">
        <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-4">Personal Details</h3>
        <div className="grid grid-cols-2 gap-y-4 text-sm">
          <div><span className="text-slate400 block text-xs uppercase">Name</span> {profile.name}</div>
          <div><span className="text-slate400 block text-xs uppercase">Age</span> {profile.age}</div>
          <div><span className="text-slate400 block text-xs uppercase">Height</span> {profile.height_cm} cm</div>
          <div><span className="text-slate400 block text-xs uppercase">Weight</span> {profile.weight_kg} kg</div>
        </div>
      </div>

      <div className="card-container">
        <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-4">Training Setup</h3>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate400 uppercase text-xs">Primary Goal</span>
            <span className="font-bold text-accent1">{profile.goal.replace('_',' ').toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate400 uppercase text-xs">Experience</span>
            <span className="capitalize">{profile.experience_level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate400 uppercase text-xs">Commitment</span>
            <span>{profile.days_per_week} days/week</span>
          </div>
        </div>
      </div>

      {weightLogs.length > 0 && (
        <div className="card-container">
          <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-4">Weight Trend</h3>
          <div className="flex gap-2 h-24 items-end">
            {/* Simple sparkline / bar chart for last 10 entries */}
            {weightLogs.slice(-10).map((w, i, arr) => {
               const min = Math.min(...arr.map(a => a.weight_kg)) - 2;
               const max = Math.max(...arr.map(a => a.weight_kg)) + 2;
               const pt = ((w.weight_kg - min) / (max - min)) * 100;
               return (
                 <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                   <div className="absolute -top-6 text-[10px] bg-white text-black px-1 rounded opacity-0 group-hover:opacity-100">{w.weight_kg}</div>
                   <div className="w-full bg-accent2/50 rounded-t-sm" style={{ height: `${pt}%` }}></div>
                 </div>
               )
            })}
          </div>
        </div>
      )}

      {planHistory.length > 0 && (
        <div className="card-container">
          <h3 className="text-lg font-bold mb-4 border-b border-white/5 pb-4">Plan History</h3>
          <div className="space-y-4">
             {planHistory.map((h, i) => (
                <div key={i} className="bg-background border border-white/5 p-4 rounded-xl">
                  <div className="flex justify-between font-bold mb-2">
                    <span className="text-sm">{h.plan_name}</span>
                    <span className="text-xs text-slate400">{new Date(h.started_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate400">{h.summary}</p>
                </div>
             ))}
          </div>
        </div>
      )}

      <button onClick={handleReset} className="w-full py-4 text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold mt-8">
        <Trash2 size={20} /> Wipe Data & Start Over
      </button>

    </div>
  );
}
