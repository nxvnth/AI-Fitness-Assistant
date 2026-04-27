import { GoogleGenAI } from '@google/genai';
import { ActivePlan, ChatMessage, Goal, storage, UserProfile, WorkoutLog } from './storage';
import { FitnessModule, GOAL_VECTORS, MODULE_LIBRARY, filterModules, Difficulty, EquipmentTier } from '../data/moduleLibrary';

// Use environment variable or prompt user for key later. 
// For demo, this checks for import.meta.env.VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'MOCK_KEY';

const ai = new GoogleGenAI({ apiKey });

export async function generatePlan(
  profile: UserProfile, 
  answers: {q1: string, q2: string, q3: string}
): Promise<ActivePlan | null> {
  if (apiKey === 'MOCK_KEY') {
    // Mock logic for demo purposes when no key is set
    return new Promise((resolve) => setTimeout(() => resolve(generateMockPlan(profile)), 2000));
  }

  const eligibleModules = filterModules(profile.equipment_tier as EquipmentTier, profile.experience_level as Difficulty);
  const goalVector = GOAL_VECTORS[profile.goal];

  const prompt = `
SYSTEM:
You are a certified personal trainer AI. Your job is to create a structured weekly workout plan by selecting from a provided module library. You must return ONLY valid JSON — no prose, no markdown, no explanation outside the JSON structure.

SAFETY RULES (non-negotiable):
- Never assign an advanced module to a beginner user
- Never assign more training days than the user requested
- Always include at least 1 rest day per week
- Never suggest training through pain or injury
- If a user profile suggests extreme calorie restriction, do not create a high-volume plan

USER PROFILE:
${JSON.stringify(profile)}

QUESTIONNAIRE ANSWERS:
${JSON.stringify(answers)}

GOAL VECTOR (target stimulus ratios for this user's goal):
${JSON.stringify(goalVector)}

ELIGIBLE MODULES (pre-filtered by equipment tier and difficulty):
${JSON.stringify(eligibleModules.map(m => ({ id: m.id, name: m.name, duration: m.duration_mins, split: m.split_type })))}

YOUR TASK:
Select modules from the eligible list to fill the user's requested training days (${profile.days_per_week} days). Rest days fill the remaining days. Aim for a weekly stimulus profile that best matches the goal vector given the user's experience level and readiness. A beginner should start conservatively — do not maximise intensity immediately.

Return exactly this JSON structure:
{
  "plan_name": "descriptive name",
  "weekly_schedule": {
    "monday": "module_id",
    "tuesday": "module_id or rest",
    "wednesday": "module_id or rest",
    "thursday": "module_id or rest",
    "friday": "module_id or rest",
    "saturday": "module_id or rest",
    "sunday": "module_id or rest"
  },
  "rationale": "1-2 sentences: why this plan suits this user",
  "progression_note": "1 sentence: when and how to expect progression"
}

VALIDATION: Only use module IDs that exist in the provided eligible modules list.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const data = JSON.parse(response.text || '{}');
    
    // Post-generation validation
    if (validatePlan(data, eligibleModules, profile)) {
      return {
        plan_id: crypto.randomUUID(),
        plan_name: data.plan_name,
        generated_at: new Date().toISOString(),
        weekly_schedule: data.weekly_schedule,
        rationale: data.rationale,
        progression_note: data.progression_note
      };
    }
  } catch (err) {
    console.error("AI Generation Error", err);
  }
  return null;
}

export async function chatWithCoach(userMessage: string): Promise<string> {
  const profile = storage.getProfile();
  const plan = storage.getActivePlan();
  const history = storage.getChatHistory();
  const recentLogs = storage.getLogs().slice(-7);
  const planHistory = storage.getPlanHistory().slice(-1);

  const context = `
You are FitMind Coach — a knowledgeable, encouraging personal trainer AI. You help users track their fitness, answer questions about their plan, and make adjustments when needed.

SAFETY RULES (always enforce):
- Never recommend more than a 500 kcal/day calorie deficit
- Never suggest skipping rest days for more than 2 weeks
- If a user mentions pain, injury, or feeling unwell, always recommend rest and consulting a professional
- Do not diagnose medical conditions
- Always note when something is beyond your scope and recommend a professional

AVAILABLE TOOLS:
You have access to the following functions. Call them when the user's intent is clear by including this exact JSON structure anywhere in your response: <tool_call>{"tool": "tool_name", "args": {...}}</tool_call>

- update_plan(new_weekly_schedule): Replace the current weekly plan with a new schedule
- log_workout(date, module_id, rpe, notes): Log a completed workout
- log_weight(date, weight_kg): Record a weight entry
- update_goal(new_goal): Change the user's primary fitness goal
- generate_new_plan(): Trigger a full plan regeneration

CURRENT USER CONTEXT:
Name: ${profile?.name || 'Unknown'}
Age: ${profile?.age || 'Unknown'} | Gender: ${profile?.gender || 'Unknown'} | Weight: ${profile?.weight_kg || 'Unknown'}kg
Goal: ${profile?.goal || 'Unknown'} | Experience: ${profile?.experience_level || 'Unknown'}
Calorie target: ${profile?.calorie_target || 'Unknown'} kcal/day (maintenance: ${profile?.tdee || 'Unknown'})

CURRENT PLAN: ${plan?.plan_name || 'None'}
${JSON.stringify(plan?.weekly_schedule || {})}
Generated: ${plan?.generated_at || 'Never'} 
Rationale: ${plan?.rationale || 'None'}

THIS WEEK'S LOGS:
${JSON.stringify(recentLogs)}

PLAN HISTORY (last 1 plan):
${JSON.stringify(planHistory)}

When making plan changes, always explain what you're changing and why, then call the appropriate tool. When logging workouts on behalf of the user, confirm the details before calling the tool. Be encouraging but honest.
`;

  if (userMessage.match(/pain|injury|hurt|doctor/i)) {
      // Mechanics check for safety
  }

  if (apiKey === 'MOCK_KEY') {
     return new Promise((resolve) => setTimeout(() => resolve("This is a mock response. You said: " + userMessage), 1000));
  }

  const messages = [
    { role: 'user', parts: [{ text: context }] },
    { role: 'model', parts: [{ text: "Understood. I am ready." }] },
    ...history.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ] as any;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages,
    });
    return response.text || '';
  } catch (err) {
    console.error("Chat Error", err);
    return "I'm having trouble connecting to the server. Please try again later.";
  }
}

export function parseToolCalls(responseText: string) {
  const regex = /<tool_call>(.*?)<\/tool_call>/gs;
  const calls = [];
  let match;
  while ((match = regex.exec(responseText)) !== null) {
    try {
      calls.push(JSON.parse(match[1]));
    } catch(e) {}
  }
  return calls;
}



function validatePlan(plan: any, eligibleModules: FitnessModule[], profile: UserProfile) {
  const validIds = eligibleModules.map(m => m.id).concat(['rest']);
  const days = Object.values(plan.weekly_schedule) as string[];
  const allValid = days.every(d => validIds.includes(d));
  const trainingDays = days.filter(d => d !== 'rest').length;
  const hasRest = days.includes('rest');
  
  if (!allValid) return false;
  if (trainingDays > profile.days_per_week + 1) return false;
  if (!hasRest) return false;
  
  return true;
}

function generateMockPlan(profile: UserProfile): ActivePlan {
  const isGym = profile.equipment_tier === 2;
  const schedule = {
    monday: isGym ? 'full_body_gym_a' : 'full_body_bw_a',
    tuesday: 'rest',
    wednesday: isGym ? 'push_gym_a' : 'full_body_bw_b',
    thursday: 'rest',
    friday: isGym ? 'pull_gym_a' : 'hiit_bw_a',
    saturday: 'mobility_a',
    sunday: 'rest'
  };

  return {
    plan_id: crypto.randomUUID(),
    plan_name: "Foundations Plan",
    generated_at: new Date().toISOString(),
    weekly_schedule: schedule,
    rationale: "This balanced schedule perfectly matches your availability, easing you in while targeting your primary health goals safely.",
    progression_note: "Focus on form for the first two weeks, then consider adding an extra session if feeling recovered."
  };
}
