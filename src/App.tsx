import React, { useEffect, useState } from 'react';
import { storage } from './utils/storage';
import Onboarding from './components/Onboarding';
import PlanGeneration from './components/PlanGeneration';
import DashboardTab from './components/Tabs/DashboardTab';
import AICoachTab from './components/Tabs/AICoachTab';
import CalendarTab from './components/Tabs/CalendarTab';
import ProfileTab from './components/Tabs/ProfileTab';
import { Activity, MessageSquare, Calendar as CalendarIcon, User } from 'lucide-react';

function App() {
  const [profile, setProfile] = useState(storage.getProfile());
  const [activePlan, setActivePlan] = useState(storage.getActivePlan());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'coach' | 'calendar' | 'profile'>('dashboard');

  // Listen for storage changes in the same window (custom event trigger if needed) or just props drill
  useEffect(() => {
    // Check initial state
  }, []);

  const handleProfileComplete = () => {
    setProfile(storage.getProfile());
  };

  const handlePlanComplete = () => {
    setActivePlan(storage.getActivePlan());
  };

  const resetAllData = () => {
    storage.clearAll();
    setProfile(null);
    setActivePlan(null);
  };

  if (!profile || !profile.onboarding_complete) {
    return <Onboarding onComplete={handleProfileComplete} />;
  }

  if (!activePlan) {
    return <PlanGeneration profile={profile} onComplete={handlePlanComplete} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-gray-100 font-sans">
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-md mx-auto h-full relative">
          {activeTab === 'dashboard' && <DashboardTab profile={profile} plan={activePlan} />}
          {activeTab === 'coach' && <AICoachTab onPlanChange={handlePlanComplete} />}
          {activeTab === 'calendar' && <CalendarTab />}
          {activeTab === 'profile' && <ProfileTab profile={profile} onReset={resetAllData} />}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-white/5 py-3 px-6 sm:px-12 flex justify-between items-center max-w-md mx-auto w-full z-50 rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
        <NavButton 
          icon={<Activity size={24} />} 
          label="Today" 
          isActive={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <NavButton 
          icon={<MessageSquare size={24} />} 
          label="Coach" 
          isActive={activeTab === 'coach'} 
          onClick={() => setActiveTab('coach')} 
        />
        <NavButton 
          icon={<CalendarIcon size={24} />} 
          label="Calendar" 
          isActive={activeTab === 'calendar'} 
          onClick={() => setActiveTab('calendar')} 
        />
        <NavButton 
          icon={<User size={24} />} 
          label="Profile" 
          isActive={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
        />
      </div>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 transition-colors ${isActive ? 'text-accent1' : 'text-slate400 hover:text-white'}`}
    >
      {icon}
      <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
    </button>
  );
}

export default App;
