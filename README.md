# ♔ GRANDMASTER

Multi-agent project planner powered by Google Gemini. Six specialist chess-piece agents analyze your idea in sequence and produce a complete project brief.

## Agents

| Piece | Role | Output |
|-------|------|--------|
| ♔ King | Chief of Staff | Strategic overview, mission, risks, metrics |
| ♝ Bishop | Research & Strategy | Competitive landscape, market positioning |
| ♛ Queen | Lead Builder | Full product spec, features, architecture |
| ♜ Rook | Infrastructure | Tech stack, deployment, infra decisions |
| ♞ Knight | QA & Testing | Risks, edge cases, security, test scenarios |
| ♟ Pawn | Task Executor | Numbered task breakdown by phase |

## Setup

### 1. Clone / download the project

```bash
cd grandmaster
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Gemini API key

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder with your actual key:

```
VITE_GEMINI_API_KEY=AIza...your_key_here
```

Get a key at: https://aistudio.google.com/apikey

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 5. Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
grandmaster/
├── index.html
├── vite.config.js
├── package.json
├── .env.example          ← copy to .env and add your key
├── .gitignore
└── src/
    ├── main.jsx          ← React entry point
    ├── App.jsx           ← Main orchestration logic
    ├── index.css         ← Global styles & CSS variables
    ├── utils/
    │   ├── pieces.js     ← The 6 agent configs (prompts, symbols, colors)
    │   ├── gemini.js     ← Gemini API streaming utility
    │   └── history.js    ← localStorage history management
    └── components/
        ├── Header.jsx / .module.css
        ├── InputScreen.jsx / .module.css
        ├── CrewView.jsx / .module.css
        ├── PieceCard.jsx / .module.css
        ├── DocView.jsx / .module.css
        └── HistoryPanel.jsx / .module.css
```

## Customizing agents

Edit `src/utils/pieces.js` to change any agent's name, role, color, or system prompt.

## Model

Currently uses `gemini-2.0-flash` (fast, cheap, great for this use case). To switch models, edit the `endpoint` in `src/utils/gemini.js`.
