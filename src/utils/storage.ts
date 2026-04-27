import { FitnessModule } from '../data/moduleLibrary';

export type Gender = 'male' | 'female' | 'other';
export type Goal = 'build_strength' | 'lose_weight' | 'body_recomp' | 'good_health';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  goal: Goal;
  equipment_tier: 0 | 1 | 2;
  experience_level: ExperienceLevel;
  days_per_week: number;
  tdee: number;
  calorie_target: number;
  created_at: string;
  onboarding_complete: boolean;
}

export interface ActivePlan {
  plan_id: string;
  plan_name: string;
  generated_at: string;
  weekly_schedule: {
    monday: string | 'rest';
    tuesday: string | 'rest';
    wednesday: string | 'rest';
    thursday: string | 'rest';
    friday: string | 'rest';
    saturday: string | 'rest';
    sunday: string | 'rest';
  };
  rationale: string;
  progression_note: string;
}

export interface WorkoutLog {
  log_id: string;
  date: string;
  module_id: string;
  module_name: string;
  completed: boolean;
  rpe: number;
  notes: string;
  duration_actual_mins: number;
  logged_at: string;
}

export interface PlanHistory {
  plan_id: string;
  plan_name: string;
  started_at: string;
  ended_at: string;
  summary: string;
}

export interface WeightLog {
  date: string;
  weight_kg: number;
}

export interface WaterLog {
  date: string;
  amount_ml: number;
}

export interface ChatMessage {
  role: 'user' | 'model'; // use 'model' to match Gemini SDK types
  content: string;
  timestamp: string;
}

export const KEYS = {
  PROFILE: 'fitm_profile',
  ACTIVE_PLAN: 'fitm_active_plan',
  LOGS: 'fitm_logs',
  PLAN_HISTORY: 'fitm_plan_history',
  WEIGHT_LOG: 'fitm_weight_log',
  WATER_LOG: 'fitm_water_log',
  CHAT_HISTORY: 'fitm_chat_history'
};

function get<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Error parsing localStorage key "${key}":`, e);
    return defaultValue;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Helpers
export const storage = {
  getProfile: () => get<UserProfile | null>(KEYS.PROFILE, null),
  setProfile: (profile: UserProfile) => set(KEYS.PROFILE, profile),
  
  getActivePlan: () => get<ActivePlan | null>(KEYS.ACTIVE_PLAN, null),
  setActivePlan: (plan: ActivePlan) => set(KEYS.ACTIVE_PLAN, plan),
  
  getLogs: () => get<WorkoutLog[]>(KEYS.LOGS, []),
  setLogs: (logs: WorkoutLog[]) => set(KEYS.LOGS, logs),
  addLog: (log: WorkoutLog) => {
    const logs = storage.getLogs();
    logs.push(log);
    storage.setLogs(logs);
  },
  
  getPlanHistory: () => get<PlanHistory[]>(KEYS.PLAN_HISTORY, []),
  addPlanHistory: (history: PlanHistory) => {
    const arr = storage.getPlanHistory();
    arr.push(history);
    set(KEYS.PLAN_HISTORY, arr);
  },
  
  getWeightLogs: () => get<WeightLog[]>(KEYS.WEIGHT_LOG, []),
  addWeightLog: (log: WeightLog) => {
    const logs = storage.getWeightLogs();
    logs.push(log);
    set(KEYS.WEIGHT_LOG, logs);
    
    // Auto update profile current weight
    const profile = storage.getProfile();
    if (profile) {
      profile.weight_kg = log.weight_kg;
      storage.setProfile(profile);
    }
  },
  
  getWaterLogs: () => get<WaterLog[]>(KEYS.WATER_LOG, []),
  addWaterLog: (amount: number, date: string) => {
    const logs = storage.getWaterLogs();
    const existing = logs.find(l => l.date === date);
    if (existing) {
      existing.amount_ml += amount;
    } else {
      logs.push({ date, amount_ml: amount });
    }
    set(KEYS.WATER_LOG, logs);
  },
  
  getChatHistory: () => get<ChatMessage[]>(KEYS.CHAT_HISTORY, []),
  addChatMessage: (msg: ChatMessage) => {
    const current = storage.getChatHistory();
    current.push(msg);
    // Keep only last 20 msg
    if (current.length > 20) {
      current.splice(0, current.length - 20);
    }
    set(KEYS.CHAT_HISTORY, current);
  },
  
  clearAll: () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
};

export const calculateTDEE = (weight: number, height: number, age: number, gender: Gender, days_per_week: number): number => {
  let bmr = 0;
  if (gender === 'male' || gender === 'other') { // Defaulting 'other' to male calculation as a baseline
    bmr = 88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age);
  } else {
    bmr = 447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age);
  }

  let multiplier = 1.2;
  if (days_per_week === 2) multiplier = 1.375;
  else if (days_per_week === 3) multiplier = 1.55;
  else if (days_per_week >= 4 && days_per_week <= 5) multiplier = 1.725;
  else if (days_per_week >= 6) multiplier = 1.9;

  return Math.round(bmr * multiplier);
};

export const calculateCaloricTarget = (tdee: number, goal: Goal, gender: Gender): { target: number, isFloor: boolean } => {
  let target = tdee;
  if (goal === 'lose_weight') target = tdee - 400;
  if (goal === 'body_recomp') target = tdee - 100;
  if (goal === 'build_strength') target = tdee + 200;
  
  const floor = gender === 'female' ? 1300 : 1500;
  if (target < floor) {
    return { target: floor, isFloor: true };
  }
  return { target, isFloor: false };
};
