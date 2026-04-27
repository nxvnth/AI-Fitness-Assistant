import React, { useState } from 'react';
import { storage } from '../../utils/storage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  
  const logs = storage.getLogs();
  const water = storage.getWaterLogs();
  const weight = storage.getWeightLogs();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectedLog = logs.find(l => l.date === selectedDate);
  const selectedWater = water.find(w => w.date === selectedDate);
  const selectedWeight = weight.find(w => w.date === selectedDate);

  const getDayDot = (dateStr: string) => {
    // We don't have absolute 'scheduled rest day' history easily queryable without 
    // re-evaluating the plan generation week-by-week.
    // For now: green if completed, yellow if partial.
    const log = logs.find(l => l.date === dateStr);
    if (!log) return null;
    return log.completed ? 'bg-green-500' : 'bg-yellow-500';
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <header className="flex justify-between items-center bg-card p-4 rounded-2xl border border-white/5">
        <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="font-bold text-lg">{monthName}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-full"><ChevronRight size={20} /></button>
      </header>

      <div className="bg-card rounded-2xl p-4 border border-white/5">
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate400 mb-2">
          {['S','M','T','W','T','F','S'].map((d,i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
            const dotClass = getDayDot(dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            
            return (
              <div 
                key={i} 
                onClick={() => setSelectedDate(dateStr)}
                className={`relative aspect-square flex items-center justify-center rounded-xl cursor-pointer text-sm transition-all ${isSelected ? 'bg-accent1 text-background font-bold' : isToday ? 'border border-accent1/50 text-accent1' : 'hover:bg-white/5'}`}
              >
                {i + 1}
                {dotClass && (
                  <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-background' : dotClass}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-card rounded-2xl p-5 border border-white/5 flex-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent2"></div>
          
          <h3 className="text-sm font-bold text-slate400 uppercase tracking-widest mb-4">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>

          {selectedLog ? (
            <div className="space-y-4">
               <div>
                 <h4 className="font-bold text-lg text-white">{selectedLog.module_name}</h4>
                 <div className="flex gap-2 mt-2">
                   <span className="px-2 py-1 bg-white/5 rounded text-xs text-slate400">RPE: {selectedLog.rpe}/10</span>
                   <span className="px-2 py-1 bg-white/5 rounded text-xs text-slate400">{selectedLog.duration_actual_mins}m</span>
                   <span className={`px-2 py-1 rounded text-xs ${selectedLog.completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                     {selectedLog.completed ? 'Fully Completed' : 'Partially Completed'}
                   </span>
                 </div>
               </div>
            </div>
          ) : (
            <p className="text-slate400 text-sm mb-4">No workout session logged.</p>
          )}

          <div className="flex gap-4 mt-6 pt-6 border-t border-white/5">
             <div className="flex-1 bg-background rounded-xl p-3 border border-white/5 text-center">
               <div className="text-xs text-slate400 uppercase font-bold mb-1">Water</div>
               <div className="font-medium text-blue-400">{selectedWater ? selectedWater.amount_ml / 1000 : 0} L</div>
             </div>
             <div className="flex-1 bg-background rounded-xl p-3 border border-white/5 text-center">
               <div className="text-xs text-slate400 uppercase font-bold mb-1">Weight</div>
               <div className="font-medium text-white">{selectedWeight ? selectedWeight.weight_kg + 'kg' : '--'}</div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
