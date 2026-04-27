# ⚡ FitMind AI \u2014 Personal Fitness Tracker

FitMind is an intelligent, locally-persistent web application designed to act as your personalized fitness coach. Built with React and TypeScript, it leverages the **Google Gemini API** to generate structured, adaptive workout plans and provide conversational coaching experiences directly in your browser.

## \u2728 Features

- **\ud83e\udd16 AI-Powered Plan Generation:** Complete a comprehensive onboarding flow that determines your Maintenance Calories (TDEE), Target Calories, Equipment Tier, and Experience. FitMind queries Gemini to dynamically stitch together an optimal weekly schedule from a predefined library of 15+ fitness modules.
- **\ud83d\udcac Conversational AI Coach:** Chat with your AI trainer directly in the app. Using structured tool calls, the AI can securely update your plan, log workouts on your behalf, and provide nutritional guidance within strict safety guardrails (e.g., preventing extreme caloric deficits or dangerous exercises).
- **\ud83d\udd12 Fully Local, Zero Database Backend:** Your data stays with you. User profiles, workout logs, chat histories, and active plans are mapped to strict JSON schemas and persisted securely in your browser's `localStorage`.
- **\ud83c\udfa8 Premium Dark-Mode Aesthetics:** A glassmorphic, fluid UI with a Charcoal Base (`#0f0f0f`), Electric Green (`#00ff87`), and Deep Indigo (`#6366f1`) color palette built completely with Tailwind CSS.

## \ud83d\udee0\ufe0f Tech Stack

- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **AI Integration:** `@google/genai` (Gemini SDK)
- **Data Layer:** Client-side `localStorage` wrapper

## \ud83d\ude80 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) installed.

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Configure Gemini AI API
To run the live AI models, you must provide your Google Gemini API key. 
Create a `.env` file in the root directory and add:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If you do not provide an API key, the app will gracefully fallback to a MOCK_KEY mode, allowing you to test the UI flow and generate a placeholder template plan).*

### 3. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

## \u2696\ufe0f Intelligent Guardrails
FitMind enforces mechanical safeguards before passing information to the LLM:
- **Calorie Floor:** Hardcoded minimum thresholds (1300kcal for women, 1500kcal for men) completely prevent the AI from generating dangerous weight loss macros.
- **Module Library Routing:** Beginners are securely sandboxed. Advanced modules and heavier equipment tiers are stripped from the 'Eligible Library' array before Gemini ever attempts to craft a plan, eliminating hallucinated injuries.

## \ud83d\udcc1 File Structure Highlights

- `src/components/Tabs/` - The core tab logic (`DashboardTab`, `AICoachTab`, `CalendarTab`, `ProfileTab`).
- `src/data/moduleLibrary.ts` - The localized fitness regimen objects and the `filterModules` engine mapping AI goal vectors to raw data.
- `src/utils/ai.ts` - The isolated Gemini SDK environment handling structured prompts and recursive regex tool calls.
- `src/utils/storage.ts` - Centralized wrapper for strict data schema interactions.
