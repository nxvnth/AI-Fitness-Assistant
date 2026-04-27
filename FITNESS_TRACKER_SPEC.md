# FitMind — AI Personal Fitness Tracker
## Full Build Specification v1.0

---

## 0. Project Overview

A web-based personal fitness tracker where an AI agent generates a structured, personalised workout plan from a curated module library, tracks progress, and adapts the plan over time through conversation. The AI is constrained by a structured knowledge base (modules) and outputs validated JSON — making its output renderable as dynamic UI components rather than free text.

**Stack:** React (single file per component), localStorage for persistence, llm API for all AI calls, Tailwind CSS for styling.

**Design Aesthetic:** Dark-mode first. Dense but clean — think fitness app meets developer tool. Deep charcoal backgrounds (`#0f0f0f`, `#1a1a1a`), electric accent (`#00ff87` green or `#6366f1` indigo), sharp typography. Data-forward. Every screen should feel like it's showing you something useful at a glance.

---

## 1. Data Models

All data lives in `localStorage`. Keys and shapes defined here are the contract between every component and the AI agent.

### 1.1 User Profile
```json
// localStorage key: "fitm_profile"
{
  "name": "string",
  "age": "number",
  "gender": "male | female | other",
  "height_cm": "number",
  "weight_kg": "number",
  "goal": "build_strength | lose_weight | body_recomp | good_health",
  "equipment_tier": "0 | 1 | 2",
  "experience_level": "beginner | intermediate | advanced",
  "days_per_week": "number (2-6)",
  "tdee": "number (calculated on setup)",
  "calorie_target": "number (calculated on setup)",
  "created_at": "ISO date string",
  "onboarding_complete": "boolean"
}
```

**TDEE Calculation (Harris-Benedict):**
- Men: `88.36 + (13.4 × weight_kg) + (4.8 × height_cm) - (5.7 × age)`
- Women: `447.6 + (9.2 × weight_kg) + (3.1 × height_cm) - (4.3 × age)`
- Multiply by activity multiplier based on `days_per_week`:
  - 2 days → 1.375, 3 days → 1.55, 4-5 days → 1.725, 6+ days → 1.9
- Calorie target by goal:
  - `lose_weight`: TDEE - 400
  - `body_recomp`: TDEE - 100
  - `build_strength`: TDEE + 200
  - `good_health`: TDEE

**Safety guardrail (hard enforce in code, not just prompt):**
- Calorie target floor: 1500 kcal (men), 1300 kcal (women)
- If calculated target is below floor, clamp to floor AND show a visible warning banner: *"Your calorie target has been set to the minimum safe threshold. Please consult a nutritionist for personalised advice."*

### 1.2 Active Plan
```json
// localStorage key: "fitm_active_plan"
{
  "plan_id": "uuid",
  "plan_name": "string",
  "generated_at": "ISO date string",
  "weekly_schedule": {
    "monday": "module_id | 'rest'",
    "tuesday": "module_id | 'rest'",
    "wednesday": "module_id | 'rest'",
    "thursday": "module_id | 'rest'",
    "friday": "module_id | 'rest'",
    "saturday": "module_id | 'rest'",
    "sunday": "module_id | 'rest'"
  },
  "rationale": "string (1-2 sentences from LLM explaining why this plan suits the user)",
  "progression_note": "string (what to expect and when to level up)"
}
```

### 1.3 Workout Logs
```json
// localStorage key: "fitm_logs"
// Array of:
{
  "log_id": "uuid",
  "date": "YYYY-MM-DD",
  "module_id": "string",
  "module_name": "string",
  "completed": "boolean",
  "rpe": "number (1-10)",
  "notes": "string (optional)",
  "duration_actual_mins": "number",
  "logged_at": "ISO date string"
}
```

### 1.4 Plan History (Compressed)
```json
// localStorage key: "fitm_plan_history"
// Array of:
{
  "plan_id": "uuid",
  "plan_name": "string",
  "started_at": "ISO date string",
  "ended_at": "ISO date string",
  "summary": "string (~100 token paragraph summarising the plan period: avg RPE, completion rate, duration, outcome)"
}
```

### 1.5 Weight Log
```json
// localStorage key: "fitm_weight_log"
// Array of:
{
  "date": "YYYY-MM-DD",
  "weight_kg": "number"
}
```

### 1.6 Water Log
```json
// localStorage key: "fitm_water_log"
// Array of:
{
  "date": "YYYY-MM-DD",
  "amount_ml": "number"
}
```

### 1.7 Chat History
```json
// localStorage key: "fitm_chat_history"
// Array of last 20 messages only (trim older ones):
{
  "role": "user | assistant",
  "content": "string",
  "timestamp": "ISO date string"
}
```

---

## 2. Module Library

### 2.1 Schema
```json
{
  "id": "string (snake_case)",
  "name": "string",
  "split_type": "full_body | upper | lower | push | pull | legs | cardio | mobility | rest",
  "equipment_tier": "0 | 1 | 2",
  "difficulty": "beginner | intermediate | advanced",
  "duration_mins": "number",
  "goal_affinity": ["build_strength | lose_weight | body_recomp | good_health"],
  "stimulus": {
    "strength": "0-5",
    "hypertrophy": "0-5",
    "cardio": "0-5",
    "mobility": "0-5"
  },
  "exercises": [
    {
      "name": "string",
      "sets": "number",
      "reps": "string (e.g. '8-10' or '30 secs')",
      "rest_secs": "number",
      "coaching_note": "string (one sentence, beginner-friendly cue)"
    }
  ]
}
```

**Stimulus scoring rules (ground these in reality, don't guess):**
- `cardio`: based on MET. Low intensity movement (≤3 MET) → 1. Moderate (3-5 MET) → 2. Vigorous (5-7 MET) → 3. High (7-9 MET) → 4. Max effort (>9 MET) → 5.
- `strength`: compound heavy lifts (squat, deadlift, bench, press) → 4-5. Compound moderate → 3. Isolation heavy → 2. Isolation light → 1.
- `hypertrophy`: peaks at moderate load/high volume. Overlaps strength but lower for very heavy (1-3 rep) work. Sessions with sets×reps >24 total → 4-5.
- `mobility`: incidental stretching → 1. Dedicated cooldown → 2. Mixed mobility blocks → 3. Full mobility session → 5.

### 2.2 The Module Library (15 modules)

```json
[
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
      { "name": "Tricep Overhead Extension", "sets": 3, "reps": "10-12", "rest_secs": 60, "coaching_note": "Elbows stay narrow and pointed forward throughout." }
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
]
```

---

## 3. Goal Vectors

Used by the LLM to reason about plan composition. Include in the plan generation prompt.

```json
{
  "build_strength":  { "strength": 5, "hypertrophy": 3, "cardio": 1, "mobility": 1 },
  "body_recomp":     { "strength": 3, "hypertrophy": 4, "cardio": 3, "mobility": 2 },
  "lose_weight":     { "strength": 2, "hypertrophy": 2, "cardio": 5, "mobility": 1 },
  "good_health":     { "strength": 2, "hypertrophy": 2, "cardio": 3, "mobility": 3 }
}
```

---

## 4. Application Screens & Components

### 4.1 Screen Flow
```
App Entry
  └── No profile → Onboarding Flow (multi-step)
  └── Profile exists, no plan → Plan Generation Flow
  └── Profile + Plan exist → Main App (4 tabs)
        ├── Tab 1: Dashboard
        ├── Tab 2: AI Coach (chat)
        ├── Tab 3: Calendar
        └── Tab 4: Profile
```

### 4.2 Onboarding Flow (multi-step, single page with step indicator)

**Step 1 — Personal Info**
- Name (text input)
- Age (number, validate 13-80)
- Gender (segmented control: Male / Female / Other)
- Height in cm (number)
- Weight in kg (number)

**Step 2 — Your Goal**
- Single select cards (large, visual):
  - 🏋️ Build Strength
  - 🔥 Lose Weight
  - ⚖️ Body Recomposition
  - 💚 General Health

**Step 3 — Your Setup**
- Equipment access (single select):
  - No equipment (bodyweight only) → tier 0
  - Home setup (dumbbells/bands) → tier 1
  - Full gym access → tier 2
- Days per week available (slider or segmented: 2 / 3 / 4 / 5 / 6)

**Step 4 — Experience Level**
- Single select cards:
  - 🌱 Never worked out / complete beginner
  - 📈 Some experience, been inconsistent
  - 💪 Currently training, want a better plan
- This maps to: `beginner` / `beginner` (but faster plan) / `intermediate` or `advanced`
- Show a reassuring note: *"This helps us start at the right pace — not too easy, not overwhelming."*

**On completion:**
- Calculate TDEE and calorie_target (apply safety floor)
- Store profile to localStorage
- Show calorie summary card with safety note if floor was applied
- Transition to Plan Generation Flow

### 4.3 Plan Generation Flow

This is a single screen with an AI conversation feel:

1. Show a brief AI "questionnaire" — 2-3 follow-up questions rendered as chat bubbles with tap-to-answer buttons (not a form). Keep it conversational.
   - Q1: "Have you done structured training before, or would you prefer to build up from scratch?"
   - Q2: "How much time can you give to each session?" (options: 20-30 mins / 30-45 mins / 45-60 mins / 60+ mins)
   - Q3 (if gym tier 2): "Any areas you specifically want to focus on?" (optional, multi-select: Upper body / Lower body / Core / No preference)

2. After answers collected: show a loading state with animated pulse — *"Building your personalised plan..."*

3. Call LLM API with plan generation prompt (see Section 5.1). Validate returned JSON.

4. Show the generated plan as a preview:
   - Weekly schedule grid (Mon–Sun, each day shows module name or "Rest")
   - The `rationale` from the LLM
   - The `progression_note`
   - A "Start This Plan" CTA button

5. On confirm: save to `fitm_active_plan`, navigate to Dashboard.

### 4.4 Tab 1 — Dashboard

**Layout:** Vertical scroll, card-based. Dark background. Quick-scan design.

**Components (top to bottom):**

**Header:** "Good morning, {name}" + today's date

**Today's Workout Card (primary card, most prominent)**
- Shows today's module name + split type
- Duration + equipment tier badge
- List of exercises with sets/reps
- Each exercise has a checkbox to mark complete
- RPE slider (1–10) appears after first exercise is checked
- "Log Workout" button (active once at least one exercise checked)
- If rest day: shows a rest day card with a recovery tip

**Weekly Activity Bar Chart**
- 7 bars, Mon–Sun
- Bar height = session duration_mins logged (or 0)
- Color coded by stimulus type: green for strength, blue for cardio, purple for mobility, grey for rest
- Current day highlighted
- Small legend

**Quick Stats Row (3 small cards side by side)**
- 🔥 This week's workouts completed (e.g. "3 / 5")
- 💧 Water today (with + button, increments by 250ml)
- ⚖️ Last logged weight (tap to log new weight)

**Calorie Summary Card**
- Maintenance: {tdee} kcal
- Target: {calorie_target} kcal
- Goal delta (e.g. "-400 kcal deficit")
- Small note: *"Track food in your preferred app — use this as your daily target."*

**Plan Review Prompt (conditional — show if any of these are true):**
- 3 weeks have passed since plan was generated, OR
- Last 3 logged workouts all had RPE ≥ 9
- Show as a banner: *"Ready to level up? Let's review your plan →"* (navigates to AI Coach tab with pre-filled review prompt)

### 4.5 Tab 2 — AI Coach

**Layout:** Full-screen chat interface with input at bottom.

**Context passed to every message (assembled from localStorage, never shown to user):**

```
SYSTEM PROMPT — see Section 5.2
```

**Chat UI:**
- User messages: right-aligned, accent color bubble
- AI messages: left-aligned, dark card with AI avatar icon
- Tool use responses (plan updates, log entries) render as special cards inside the chat — not just text. E.g. "Plan updated ✓" shows the new weekly schedule inline.
- Loading indicator while waiting for API response

**Input area:**
- Text input + send button
- Below input: 3 quick-action chips that change contextually:
  - On first open: "Review my plan", "Log today's workout", "How am I doing?"
  - After a plan review: "Accept new plan", "Keep current plan", "Modify suggestion"

**Safety disclaimer (permanent, small, below input):**
*"FitMind provides general fitness guidance only. Consult a healthcare professional before starting any new exercise program."*

### 4.6 Tab 3 — Calendar

**Layout:** Month view calendar + day detail panel

**Calendar:**
- Standard month grid
- Each day cell is colour-coded:
  - Green dot: workout logged + completed
  - Yellow dot: workout logged, partial (some exercises only)
  - Grey dot: rest day (scheduled)
  - Empty: no log
- Click/tap a day → opens day detail panel below (or slide-up modal on mobile)

**Day Detail Panel:**
- Date header
- Module name (if logged)
- Exercises completed (checklist, read-only)
- RPE logged
- Notes
- Weight logged that day (if any)
- Water logged that day (if any)
- If no log: "No activity logged for this day"

### 4.7 Tab 4 — Profile

- Display all profile fields (read-only with edit button per section)
- Calorie targets with recalculate option
- Weight trend mini chart (last 10 entries)
- "Reset all data" button (with confirmation dialog)
- Plan history list (past plans, tap to see summary)

---

## 5. AI Prompts & Agent Design

### 5.1 Plan Generation Prompt

**Model:** needs to be determined.
**Max tokens:** 1000
**Temperature:** (default)

```
SYSTEM:
You are a certified personal trainer AI. Your job is to create a structured weekly workout plan by selecting from a provided module library. You must return ONLY valid JSON — no prose, no markdown, no explanation outside the JSON structure.

SAFETY RULES (non-negotiable):
- Never assign an advanced module to a beginner user
- Never assign more training days than the user requested
- Always include at least 1 rest day per week
- Never suggest training through pain or injury
- If a user profile suggests extreme calorie restriction, do not create a high-volume plan

USER PROFILE:
{insert profile JSON}

QUESTIONNAIRE ANSWERS:
{insert answers}

GOAL VECTOR (target stimulus ratios for this user's goal):
{insert goal vector}

ELIGIBLE MODULES (pre-filtered by equipment tier and difficulty):
{insert filtered module array as JSON}

YOUR TASK:
Select modules from the eligible list to fill the user's requested training days. Rest days fill the remaining days. Aim for a weekly stimulus profile that best matches the goal vector given the user's experience level and readiness. A beginner should start conservatively — do not maximise intensity immediately.

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
  "rationale": "1-2 sentences: why this plan suits this specific user right now",
  "progression_note": "1 sentence: when and how to expect progression"
}

VALIDATION: Only use module IDs that exist in the provided eligible modules list. Never invent a module ID.
```

**Post-generation validation (in code):**
```javascript
function validatePlan(plan, eligibleModules) {
  const validIds = eligibleModules.map(m => m.id).concat(['rest']);
  const days = Object.values(plan.weekly_schedule);
  const allValid = days.every(d => validIds.includes(d));
  const trainingDays = days.filter(d => d !== 'rest').length;
  const hasRest = days.includes('rest');
  
  if (!allValid) throw new Error('Invalid module ID in plan');
  if (trainingDays > profile.days_per_week + 1) throw new Error('Too many training days');
  if (!hasRest) throw new Error('No rest day in plan');
  
  return true;
}
```
On validation failure: retry the API call once with an appended note about the error. On second failure: fall back to a hardcoded default plan for the user's profile.

### 5.2 Agent System Prompt (AI Coach Tab)

This is assembled fresh on every chat message from current localStorage state.

```
You are FitMind Coach — a knowledgeable, encouraging personal trainer AI. You help users track their fitness, answer questions about their plan, and make adjustments when needed.

SAFETY RULES (always enforce):
- Never recommend more than a 500 kcal/day calorie deficit
- Never suggest skipping rest days for more than 2 weeks
- If a user mentions pain, injury, or feeling unwell, always recommend rest and consulting a professional
- Do not diagnose medical conditions
- Always note when something is beyond your scope and recommend a professional

AVAILABLE TOOLS:
You have access to the following functions. Call them when the user's intent is clear:
- update_plan(new_weekly_schedule): Replace the current weekly plan with a new schedule
- log_workout(date, module_id, rpe, notes): Log a completed workout
- log_weight(date, weight_kg): Record a weight entry
- update_goal(new_goal): Change the user's primary fitness goal
- generate_new_plan(): Trigger a full plan regeneration (use when user wants a complete plan change)

CURRENT USER CONTEXT:
Name: {name}
Age: {age} | Gender: {gender} | Weight: {current_weight}kg
Goal: {goal} | Experience: {experience_level}
Calorie target: {calorie_target} kcal/day (maintenance: {tdee})
Equipment: {equipment_tier_description}

CURRENT PLAN: {plan_name}
{weekly_schedule formatted as readable list}
Generated: {generated_at} | {rationale}

THIS WEEK'S LOGS:
{last 7 days of workout logs, formatted as: "Mon: Pull Day A — RPE 7, completed. Notes: felt strong."}

PLAN HISTORY (last 1 plan):
{plan_history[last].summary}

When making plan changes, always explain what you're changing and why, then call the appropriate tool. When logging workouts on behalf of the user, confirm the details before calling the tool. Be encouraging but honest — don't praise poor consistency, gently redirect instead.
```

### 5.3 Tool Call Implementation

Tools are implemented as JavaScript functions. The agent returns a JSON tool call in its response when needed. Parse it and execute locally, then update localStorage.

```javascript
const AGENT_TOOLS = {
  update_plan: (args) => {
    const current = JSON.parse(localStorage.getItem('fitm_active_plan'));
    const updated = { ...current, weekly_schedule: args.new_weekly_schedule };
    localStorage.setItem('fitm_active_plan', JSON.stringify(updated));
    return { success: true, message: 'Plan updated' };
  },
  
  log_workout: (args) => {
    const logs = JSON.parse(localStorage.getItem('fitm_logs') || '[]');
    const modules = MODULE_LIBRARY;
    const module = modules.find(m => m.id === args.module_id);
    logs.push({
      log_id: crypto.randomUUID(),
      date: args.date,
      module_id: args.module_id,
      module_name: module?.name || args.module_id,
      completed: true,
      rpe: args.rpe,
      notes: args.notes || '',
      duration_actual_mins: module?.duration_mins || 0,
      logged_at: new Date().toISOString()
    });
    localStorage.setItem('fitm_logs', JSON.stringify(logs));
    return { success: true, message: 'Workout logged' };
  },
  
  log_weight: (args) => {
    const log = JSON.parse(localStorage.getItem('fitm_weight_log') || '[]');
    log.push({ date: args.date, weight_kg: args.weight_kg });
    localStorage.setItem('fitm_weight_log', JSON.stringify(log));
    // Also update profile current weight
    const profile = JSON.parse(localStorage.getItem('fitm_profile'));
    profile.weight_kg = args.weight_kg;
    localStorage.setItem('fitm_profile', JSON.stringify(profile));
    return { success: true };
  },
  
  update_goal: (args) => {
    const profile = JSON.parse(localStorage.getItem('fitm_profile'));
    profile.goal = args.new_goal;
    // Recalculate calorie target
    profile.calorie_target = calculateCaloricTarget(profile.tdee, args.new_goal, profile.gender);
    localStorage.setItem('fitm_profile', JSON.stringify(profile));
    return { success: true, message: `Goal updated to ${args.new_goal}` };
  },

  generate_new_plan: () => {
    // Archive current plan
    archiveCurrentPlan();
    // Trigger plan generation UI flow
    return { success: true, action: 'TRIGGER_PLAN_GENERATION' };
  }
};
```

**Tool call format to prompt the model with:**

Include in system prompt:
```
When you need to call a tool, include this JSON anywhere in your response:
<tool_call>{"tool": "tool_name", "args": {...}}</tool_call>

After calling a tool, continue your response naturally as if the action has been completed.
```

Parse tool calls from response:
```javascript
function parseToolCalls(responseText) {
  const regex = /<tool_call>(.*?)<\/tool_call>/gs;
  const calls = [];
  let match;
  while ((match = regex.exec(responseText)) !== null) {
    calls.push(JSON.parse(match[1]));
  }
  return calls;
}
```

---

## 6. Safety Guardrails Summary

These must be **mechanically enforced in code**, not just in prompts:

| Guardrail | Where enforced | Behaviour |
|---|---|---|
| Calorie floor (1300/1500 kcal) | Profile setup + goal update | Clamp + visible warning banner |
| Module difficulty gating | Plan generation (filter before LLM call) | Beginners never see intermediate/advanced modules in eligible list |
| Plan day cap | Post-generation validation | Reject plan if training days > requested + 1 |
| Rest day requirement | Post-generation validation | Reject plan with no rest days |
| Injury/pain detection | Agent system prompt + keyword check | If "pain", "injury", "hurt", "doctor" detected in user message → prepend a safety note to agent response |
| Medical advice scope | Agent system prompt | Hard boundary in prompt, reinforced by disclaimer UI |
| Extreme deficit detection | Agent tool: update_goal | If new calorie target would fall below floor, refuse and explain |

---

## 7. Build Order (10 Hours)

### Today (~4 hours)
1. **Hour 1:** Project scaffold. React app, routing (4 tabs), localStorage utility functions, module library as a constant, TypeScript types / prop shapes.
2. **Hour 2:** Onboarding flow — all 4 steps, form validation, TDEE calculation with safety floor, store to localStorage.
3. **Hour 3:** Plan Generation flow — questionnaire chat UI, LLM API call with plan generation prompt, validation, preview screen.
4. **Hour 4:** Dashboard — today's workout card with exercise checklist + RPE, basic weekly bar chart.

### Tomorrow (~6-7 hours)
5. **Hour 5:** Workout logging — full log flow from dashboard, water intake counter, weight log entry.
6. **Hour 6:** AI Coach tab — chat UI, system prompt assembly from localStorage, tool call parsing and execution, tool result cards.
7. **Hour 7:** Calendar tab — month view, colour-coded days, day detail panel.
8. **Hour 8:** Profile tab — display, edit, weight trend chart, plan history.
9. **Hour 9:** Safety guardrails pass — enforce all items in Section 6, test edge cases.
10. **Hour 10:** Polish — loading states, error states, mobile responsiveness, empty states for first-time users.

---

## 8. Key Engineering Decisions

| Decision | Choice | Reason |
|---|---|---|
| Persistence | localStorage only | Zero backend, demo-ready, full state accessible to agent |
| Module selection | LLM reasons over filtered library | Constrains output to valid IDs while leveraging LLM reasoning |
| Tool calls | XML tags in response, parsed client-side | Simple, no function calling API needed, works with any model |
| Context window | Layered (static + current state + compressed history) | Prevents context rot without losing relevant state |
| Plan versioning | Archive on replace, summary stored | Calendar integrity preserved, agent has prior context |
| Calorie tracking | Display target only, no food logging | Keeps scope tight, avoids building a second app |
| Readiness | 3-level enum (beginner/intermediate/advanced) | Practical gating, avoids false precision of float system |

---

## 9. Out of Scope (explicitly, for this build)

- User authentication (use localStorage, name as identifier)
- Push notifications (mention in demo as future feature)
- Body fat % input and advanced metrics
- Food/calorie intake logging
- Steps tracking (requires device APIs)
- Noob vs Pro mode toggle (implicit in experience level selection)
- Social features
- Exercise video/image demonstrations
- Progressive overload auto-tracking (RPE trends inform agent suggestions only)
