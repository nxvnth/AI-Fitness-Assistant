export interface Exercise {
  name: string;
  sets: number | string;
  reps: string;
  rest_secs: number;
  coaching_note: string;
}

export interface Stimulus {
  strength: number;
  hypertrophy: number;
  cardio: number;
  mobility: number;
}

export interface FitnessModule {
  id: string;
  name: string;
  split_type: 'full_body' | 'upper' | 'lower' | 'push' | 'pull' | 'legs' | 'cardio' | 'mobility' | 'rest';
  equipment_tier: 0 | 1 | 2;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_mins: number;
  goal_affinity: string[];
  stimulus: Stimulus;
  exercises: Exercise[];
}

export const MODULE_LIBRARY: FitnessModule[] = [
  {
    "id": "full_body_bw_a",
    "name": "Full Body Foundations A",
    "split_type": "full_body",
    "equipment_tier": 0,
    "difficulty": "beginner",
    "duration_mins": 30,
    "goal_affinity": ["good_health", "lose_weight", "build_strength"],
    "stimulus": { "strength": 2, "hypertrophy": 2, "cardio": 2, "mobility": 1 },
    "exercises": [
      { "name": "Bodyweight Squat", "sets": 3, "reps": "12-15", "rest_secs": 60, "coaching_note": "Push knees out in line with toes, sit back like into a chair." },
      { "name": "Push-Up", "sets": 3, "reps": "8-12", "rest_secs": 60, "coaching_note": "Hands shoulder-width, body in a straight line from head to heels." },
      { "name": "Glute Bridge", "sets": 3, "reps": "12-15", "rest_secs": 60, "coaching_note": "Squeeze glutes at the top, don't hyperextend the lower back." },
      { "name": "Inverted Row (using table)", "sets": 3, "reps": "8-10", "rest_secs": 60, "coaching_note": "Pull chest to the edge, keep body straight throughout." },
      { "name": "Dead Bug", "sets": 2, "reps": "8 each side", "rest_secs": 45, "coaching_note": "Press lower back into floor the entire time." }
    ]
  },
  {
    "id": "full_body_bw_b",
    "name": "Full Body Foundations B",
    "split_type": "full_body",
    "equipment_tier": 0,
    "difficulty": "beginner",
    "duration_mins": 30,
    "goal_affinity": ["good_health", "lose_weight", "build_strength"],
    "stimulus": { "strength": 2, "hypertrophy": 2, "cardio": 2, "mobility": 1 },
    "exercises": [
      { "name": "Reverse Lunge", "sets": 3, "reps": "10 each leg", "rest_secs": 60, "coaching_note": "Step back, not out — keep front shin vertical." },
      { "name": "Pike Push-Up", "sets": 3, "reps": "8-10", "rest_secs": 60, "coaching_note": "Form an inverted V, lower head toward floor between hands." },
      { "name": "Hip Hinge (RDL motion, no weight)", "sets": 3, "reps": "12", "rest_secs": 60, "coaching_note": "Soft knees, hinge at hips, feel stretch in hamstrings." },
      { "name": "Superman Hold", "sets": 3, "reps": "10 (3 sec hold)", "rest_secs": 45, "coaching_note": "Lift arms and legs simultaneously, squeeze glutes." },
      { "name": "Plank", "sets": 3, "reps": "20-30 secs", "rest_secs": 45, "coaching_note": "Hips level with shoulders — don't let them sag or pike." }
    ]
  },
  {
    "id": "full_body_db_a",
    "name": "Dumbbell Full Body A",
    "split_type": "full_body",
    "equipment_tier": 1,
    "difficulty": "beginner",
    "duration_mins": 40,
    "goal_affinity": ["build_strength", "body_recomp", "good_health"],
    "stimulus": { "strength": 3, "hypertrophy": 3, "cardio": 1, "mobility": 1 },
    "exercises": [
      { "name": "Goblet Squat", "sets": 3, "reps": "10-12", "rest_secs": 75, "coaching_note": "Hold dumbbell at chest, elbows inside knees at bottom." },
      { "name": "Dumbbell Floor Press", "sets": 3, "reps": "10-12", "rest_secs": 75, "coaching_note": "Upper arms rest on floor between reps — controlled movement." },
      { "name": "Dumbbell Romanian Deadlift", "sets": 3, "reps": "10-12", "rest_secs": 75, "coaching_note": "Weights stay close to legs, feel stretch in hamstrings before returning." },
      { "name": "Dumbbell Bent-Over Row", "sets": 3, "reps": "10-12 each arm", "rest_secs": 75, "coaching_note": "Elbow drives back and up, don't rotate torso." },
      { "name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10-12", "rest_secs": 60, "coaching_note": "Press straight up, don't flare elbows excessively." }
    ]
  },
  {
    "id": "upper_gym_a",
    "name": "Upper Body A",
    "split_type": "upper",
    "equipment_tier": 2,
    "difficulty": "beginner",
    "duration_mins": 45,
    "goal_affinity": ["build_strength", "body_recomp"],
    "stimulus": { "strength": 3, "hypertrophy": 4, "cardio": 1, "mobility": 1 },
    "exercises": [
      { "name": "Barbell Bench Press", "sets": 3, "reps": "8-10", "rest_secs": 90, "coaching_note": "Slight arch, bar to lower chest, drive feet into floor." },
      { "name": "Seated Cable Row", "sets": 3, "reps": "10-12", "rest_secs": 75, "coaching_note": "Pull to navel, squeeze shoulder blades together at end." },
      { "name": "Dumbbell Shoulder Press", "sets": 3, "reps": "10-12", "rest_secs": 75, "coaching_note": "Don't lock out elbows fully, keep tension on delts." },
      { "name": "Lat Pulldown", "sets": 3, "reps": "10-12", "rest_secs": 75, "coaching_note": "Pull to upper chest, slight lean back, elbows point down." },
      { "name": "Dumbbell Curl", "sets": 2, "reps": "12-15", "rest_secs": 60, "coaching_note": "Don't swing — if you have to, the weight is too heavy." },
      { "name": "Tricep Pushdown", "sets": 2, "reps": "12-15", "rest_secs": 60, "coaching_note": "Elbows pinned to sides, full extension at bottom." }
    ]
  },
  {
    "id": "lower_gym_a",
    "name": "Lower Body A",
    "split_type": "lower",
    "equipment_tier": 2,
    "difficulty": "beginner",
    "duration_mins": 45,
    "goal_affinity": ["build_strength", "body_recomp"],
    "stimulus": { "strength": 4, "hypertrophy": 3, "cardio": 2, "mobility": 1 },
    "exercises": [
      { "name": "Barbell Back Squat", "sets": 3, "reps": "8-10", "rest_secs": 120, "coaching_note": "Bar on traps, brace core hard, break parallel if mobility allows." },
      { "name": "Romanian Deadlift", "sets": 3, "reps": "10-12", "rest_secs": 90, "coaching_note": "Soft knees, push hips back, bar stays close to legs throughout." },
      { "name": "Leg Press", "sets": 3, "reps": "12-15", "rest_secs": 75, "coaching_note": "Feet shoulder-width, don't lock knees fully at top." },
      { "name": "Leg Curl (machine)", "sets": 3, "reps": "12-15", "rest_secs": 60, "coaching_note": "Controlled on the way down — don't let the weight crash." },
      { "name": "Calf Raise", "sets": 3, "reps": "15-20", "rest_secs": 45, "coaching_note": "Full range — stretch at bottom, squeeze hard at top." }
    ]
  },
  {
    "id": "push_gym_a",
    "name": "Push Day A",
    "split_type": "push",
    "equipment_tier": 2,
    "difficulty": "intermediate",
    "duration_mins": 55,
    "goal_affinity": ["build_strength", "body_recomp"],
    "stimulus": { "strength": 4, "hypertrophy": 4, "cardio": 1, "mobility": 1 },
    "exercises": [
      { "name": "Barbell Bench Press", "sets": 4, "reps": "6-8", "rest_secs": 120, "coaching_note": "Heavier than beginner — focus on leg drive and full tightness." },
      { "name": "Incline Dumbbell Press", "sets": 3, "reps": "8-10", "rest_secs": 90, "coaching_note": "45° incline, dumbbells meet at top without clanging." },
      { "name": "Overhead Press (barbell)", "sets": 3, "reps": "6-8", "rest_secs": 90, "coaching_note": "Bar just in front of face on way up, lock out overhead." },
      { "name": "Cable Lateral Raise", "sets": 3, "reps": "12-15", "rest_secs": 60, "coaching_note": "Lead with elbow, slight forward lean, don't shrug." },
      { "name": "Tricep Overhead Extension", "sets": 3, "reps": "10-12", "rest_secs": 60, "coaching_note": "Elbows stays narrow and pointed forward throughout." }
    ]
  },
  {
    "id": "pull_gym_a",
    "name": "Pull Day A",
    "split_type": "pull",
    "equipment_tier": 2,
    "difficulty": "intermediate",
    "duration_mins": 55,
    "goal_affinity": ["build_strength", "body_recomp"],
    "stimulus": { "strength": 4, "hypertrophy": 4, "cardio": 1, "mobility": 1 },
    "exercises": [
      { "name": "Deadlift", "sets": 4, "reps": "4-6", "rest_secs": 150, "coaching_note": "Brace before you pull. Bar over mid-foot, hips hinge not squat." },
      { "name": "Pull-Up / Assisted Pull-Up", "sets": 3, "reps": "6-8", "rest_secs": 90, "coaching_note": "Full hang at bottom, chin over bar at top." },
      { "name": "Barbell Row", "sets": 3, "reps": "8-10", "rest_secs": 90, "coaching_note": "Hinge to ~45°, pull to lower chest, controlled descent." },
      { "name": "Face Pull", "sets": 3, "reps": "15-20", "rest_secs": 60, "coaching_note": "Pull to forehead level, elbows high and wide." },
      { "name": "Hammer Curl", "sets": 3, "reps": "10-12", "rest_secs": 60, "coaching_note": "Neutral grip targets brachialis — avoid swinging." }
    ]
  },
  {
    "id": "legs_gym_a",
    "name": "Leg Day A",
    "split_type": "legs",
    "equipment_tier": 2,
    "difficulty": "intermediate",
    "duration_mins": 60,
    "goal_affinity": ["build_strength", "body_recomp"],
    "stimulus": { "strength": 5, "hypertrophy": 4, "cardio": 2, "mobility": 1 },
    "exercises": [
      { "name": "Barbell Back Squat", "sets": 4, "reps": "5-6", "rest_secs": 150, "coaching_note": "Working sets now — maintain tightness, depth, and brace throughout." },
      { "name": "Romanian Deadlift", "sets": 3, "reps": "8-10", "rest_secs": 90, "coaching_note": "Feel the stretch — this is a hamstring exercise, not a back exercise." },
      { "name": "Hack Squat or Leg Press", "sets": 3, "reps": "10-12", "rest_secs": 90, "coaching_note": "Quad focus — don't go so heavy that depth suffers." },
      { "name": "Leg Curl", "sets": 3, "reps": "12-15", "rest_secs": 60, "coaching_note": "Slow eccentric — 3 seconds down." },
      { "name": "Seated Calf Raise", "sets": 4, "reps": "15-20", "rest_secs": 45, "coaching_note": "Pause at bottom stretch, explosive on the way up." }
    ]
  },
  {
    "id": "hiit_bw_a",
    "name": "HIIT Conditioning",
    "split_type": "cardio",
    "equipment_tier": 0,
    "difficulty": "intermediate",
    "duration_mins": 25,
    "goal_affinity": ["lose_weight", "body_recomp", "good_health"],
    "stimulus": { "strength": 1, "hypertrophy": 1, "cardio": 5, "mobility": 1 },
    "exercises": [
      { "name": "Burpee", "sets": 4, "reps": "30 secs on / 30 secs off", "rest_secs": 30, "coaching_note": "Modify by stepping instead of jumping if needed." },
      { "name": "Jump Squat", "sets": 4, "reps": "30 secs on / 30 secs off", "rest_secs": 30, "coaching_note": "Land softly — absorb through knees and hips, not just knees." },
      { "name": "Mountain Climber", "sets": 4, "reps": "30 secs on / 30 secs off", "rest_secs": 30, "coaching_note": "Hips stay level, don't let them bounce up and down." },
      { "name": "High Knees", "sets": 4, "reps": "30 secs on / 30 secs off", "rest_secs": 30, "coaching_note": "Drive arms — upper body powers this as much as legs." }
    ]
  },
  {
    "id": "liss_cardio",
    "name": "Low Intensity Steady State",
    "split_type": "cardio",
    "equipment_tier": 0,
    "difficulty": "beginner",
    "duration_mins": 40,
    "goal_affinity": ["lose_weight", "good_health", "body_recomp"],
    "stimulus": { "strength": 0, "hypertrophy": 0, "cardio": 3, "mobility": 1 },
    "exercises": [
      { "name": "Brisk Walk / Light Jog", "sets": 1, "reps": "40 mins continuous", "rest_secs": 0, "coaching_note": "Target pace: you can hold a conversation but it's not comfortable. That's zone 2." }
    ]
  },
  {
    "id": "mobility_a",
    "name": "Mobility & Recovery",
    "split_type": "mobility",
    "equipment_tier": 0,
    "difficulty": "beginner",
    "duration_mins": 25,
    "goal_affinity": ["good_health", "body_recomp", "lose_weight", "build_strength"],
    "stimulus": { "strength": 0, "hypertrophy": 0, "cardio": 1, "mobility": 5 },
    "exercises": [
      { "name": "World's Greatest Stretch", "sets": 2, "reps": "5 each side", "rest_secs": 0, "coaching_note": "Slow and controlled — feel each position, don't rush through." },
      { "name": "Hip 90/90 Stretch", "sets": 2, "reps": "60 secs each side", "rest_secs": 0, "coaching_note": "Sit tall, don't let hip hike up. Use hands for support if needed." },
      { "name": "Thoracic Rotation", "sets": 2, "reps": "10 each side", "rest_secs": 0, "coaching_note": "Elbow leads the rotation, keep lower body still." },
      { "name": "Pigeon Pose", "sets": 2, "reps": "60 secs each side", "rest_secs": 0, "coaching_note": "Breathe into the tightness — don't force range of motion." },
      { "name": "Cat-Cow", "sets": 2, "reps": "10 slow reps", "rest_secs": 0, "coaching_note": "Full spinal wave — exhale as you round, inhale as you arch." }
    ]
  },
  {
    "id": "full_body_gym_a",
    "name": "Full Body Strength A",
    "split_type": "full_body",
    "equipment_tier": 2,
    "difficulty": "beginner",
    "duration_mins": 50,
    "goal_affinity": ["build_strength", "body_recomp"],
    "stimulus": { "strength": 4, "hypertrophy": 3, "cardio": 1, "mobility": 1 },
    "exercises": [
      { "name": "Barbell Back Squat", "sets": 3, "reps": "8-10", "rest_secs": 120, "coaching_note": "Light-moderate weight — learn the pattern before loading heavy." },
      { "name": "Barbell Bench Press", "sets": 3, "reps": "8-10", "rest_secs": 120, "coaching_note": "Control the descent — 2 seconds down, explosive up." },
      { "name": "Barbell Deadlift", "sets": 3, "reps": "6-8", "rest_secs": 120, "coaching_note": "Brace hard before initiating. Bar stays over mid-foot." },
      { "name": "Lat Pulldown", "sets": 3, "reps": "10-12", "rest_secs": 75, "coaching_note": "Initiate with elbows, not biceps." }
    ]
  },
  {
    "id": "push_db_a",
    "name": "Dumbbell Push Day",
    "split_type": "push",
    "equipment_tier": 1,
    "difficulty": "intermediate",
    "duration_mins": 45,
    "goal_affinity": ["build_strength", "body_recomp"],
    "stimulus": { "strength": 3, "hypertrophy": 4, "cardio": 1, "mobility": 1 },
    "exercises": [
      { "name": "Dumbbell Bench Press", "sets": 4, "reps": "8-10", "rest_secs": 90, "coaching_note": "Touch dumbbells at top, wide arc down to chest." },
      { "name": "Dumbbell Overhead Press", "sets": 3, "reps": "8-10", "rest_secs": 90, "coaching_note": "Neutral or pronated grip, press straight up." },
      { "name": "Dumbbell Lateral Raise", "sets": 3, "reps": "12-15", "rest_secs": 60, "coaching_note": "Slight forward lean, lead with elbows." },
      { "name": "Dumbbell Skull Crusher", "sets": 3, "reps": "10-12", "rest_secs": 60, "coaching_note": "Lower to forehead, elbows stay pointed at ceiling." }
    ]
  },
  {
    "id": "pull_db_a",
    "name": "Dumbbell Pull Day",
    "split_type": "pull",
    "equipment_tier": 1,
    "difficulty": "intermediate",
    "duration_mins": 45,
    "goal_affinity": ["build_strength", "body_recomp"],
    "stimulus": { "strength": 3, "hypertrophy": 4, "cardio": 1, "mobility": 1 },
    "exercises": [
      { "name": "Dumbbell Romanian Deadlift", "sets": 4, "reps": "8-10", "rest_secs": 90, "coaching_note": "Dumbbells run down front of legs, push hips back." },
      { "name": "Dumbbell Row (chest supported)", "sets": 3, "reps": "10-12 each arm", "rest_secs": 75, "coaching_note": "Chest on incline bench removes lower back from the equation." },
      { "name": "Dumbbell Rear Delt Fly", "sets": 3, "reps": "12-15", "rest_secs": 60, "coaching_note": "Slight bend in elbow, lead with elbows going wide." },
      { "name": "Dumbbell Curl", "sets": 3, "reps": "10-12", "rest_secs": 60, "coaching_note": "Supinate (rotate palm up) as you curl — maximises bicep contraction." }
    ]
  },
  {
    "id": "legs_db_a",
    "name": "Dumbbell Leg Day",
    "split_type": "legs",
    "equipment_tier": 1,
    "difficulty": "intermediate",
    "duration_mins": 45,
    "goal_affinity": ["build_strength", "body_recomp"],
    "stimulus": { "strength": 3, "hypertrophy": 4, "cardio": 2, "mobility": 1 },
    "exercises": [
      { "name": "Dumbbell Goblet Squat", "sets": 4, "reps": "8-10", "rest_secs": 90, "coaching_note": "Hold heavy dumbbell at chest, sit deep, drive knees out." },
      { "name": "Dumbbell Romanian Deadlift", "sets": 4, "reps": "8-10", "rest_secs": 90, "coaching_note": "Push hips back until you feel hamstring tension, keep back flat." },
      { "name": "Dumbbell Reverse Lunge", "sets": 3, "reps": "10 each leg", "rest_secs": 75, "coaching_note": "Control the descent, drive through front heel to return." },
      { "name": "Dumbbell Sumo Squat", "sets": 3, "reps": "12-15", "rest_secs": 60, "coaching_note": "Wide stance, toes out, dumbbell hanging between legs." },
      { "name": "Single-Leg Calf Raise", "sets": 3, "reps": "15 each leg", "rest_secs": 45, "coaching_note": "Use wall for balance, full range — stretch at bottom." }
    ]
  },
  {
    "id": "rest",
    "name": "Rest Day",
    "split_type": "rest",
    "equipment_tier": 0,
    "difficulty": "beginner",
    "duration_mins": 0,
    "goal_affinity": ["build_strength", "lose_weight", "body_recomp", "good_health"],
    "stimulus": { "strength": 0, "hypertrophy": 0, "cardio": 0, "mobility": 0 },
    "exercises": []
  }
];

export const GOAL_VECTORS: Record<string, Stimulus> = {
  build_strength: { strength: 5, hypertrophy: 3, cardio: 1, mobility: 1 },
  body_recomp:    { strength: 3, hypertrophy: 4, cardio: 3, mobility: 2 },
  lose_weight:    { strength: 2, hypertrophy: 2, cardio: 5, mobility: 1 },
  good_health:    { strength: 2, hypertrophy: 2, cardio: 3, mobility: 3 }
};

export type Goal = 'build_strength' | 'lose_weight' | 'body_recomp' | 'good_health';
export type EquipmentTier = 0 | 1 | 2;
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export function filterModules(
  tier: EquipmentTier,
  difficulty: Difficulty
): FitnessModule[] {
  const difficultyMap = { beginner: 0, intermediate: 1, advanced: 2 };
  return MODULE_LIBRARY.filter(
    m => m.equipment_tier <= tier && 
         difficultyMap[m.difficulty as Difficulty] <= difficultyMap[difficulty] &&
         m.id !== 'rest'
  );
}
