# GRANDMASTER - Project Documentation

A multi-agent AI-powered project planner that generates complete project briefs through six specialist "chess-piece" agents. The system analyzes user ideas sequentially and produces comprehensive documentation covering strategic overview, competitive landscape, product specifications, infrastructure, QA strategies, and actionable task breakdowns.

## Tech Stack

**Frontend:** React 18.2.0, Vite 5.2.0, react-markdown 9.0.1, CSS Modules
- Fonts: Bodoni Moda (display), Manrope (body)

**Backend (Express Proxy):** Express.js 4.18.2, cors 2.8.5, node-fetch 3.3.2, dotenv 16.4.5

**AI/ML APIs:**
| Provider | Model | Usage |
|----------|-------|-------|
| Google Gemini | 2.0 Flash | Primary AI engine |
| DeepSeek | V4 Flash (via NVIDIA NIM) | Alternative AI engine |

Language: JavaScript (ES6+) with ES Modules

## Directory Structure

```
grandmaster/
├── index.html                        # Entry HTML
├── vite.config.js                    # Vite build config
├── package.json                      # Dependencies
├── .env / .env.example              # Environment variables
├── server.js                         # Express proxy (port 3001)
├── .agents/skills/frontend-design/   # Skills
├── dist/                             # Production build
└── src/
    ├── main.jsx                      # React entry
    ├── App.jsx                       # Main application
    ├── index.css                     # Global styles
    ├── utils/
    │   ├── pieces.js                 # 6 agent configurations
    │   ├── gemini.js                  # Gemini API streaming
    │   ├── deepseek.js                # DeepSeek/NVIDIA streaming
    │   └── history.js                # localStorage management
    └── components/
        ├── Header.jsx, InputScreen.jsx, CrewView.jsx
        ├── PieceCard.jsx, DocView.jsx, HistoryPanel.jsx
```

## Workflow & Pipeline

### Execution Flow
```
User Input → Input Screen → Agent Execution (sequential) → Document Assembly → Output & Storage
```

### Agent Execution Sequence
Agents run **sequentially** with **1.5s delay** between each:

| Piece | Symbol | Role | Focus |
|-------|--------|------|-------|
| King | ♔ | Chief of Staff | Strategic overview, mission, risks, metrics |
| Bishop | ♝ | Research & Strategy | Competitive landscape, market positioning |
| Queen | ♛ | Lead Builder | Product spec, features, architecture |
| Rook | ♜ | Infrastructure | Tech stack, deployment, infra decisions |
| Knight | ♞ | QA & Testing | Risks, edge cases, security, test scenarios |
| Pawn | ♟ | Task Executor | Numbered task breakdown by phase |

### Per-Agent Process
1. Wait 1.5 seconds
2. Set agent as `active`
3. Call `streamAgent()` with config
4. Stream AI response via `onChunk` callback
5. Update agent state to `done`
6. Proceed to next agent

### Data Flow
```
User Input → App.jsx State (phase, idea, states, activeId) 
  → API Streaming (SSE) → UI Updates (PieceCard) 
  → Output Assembly → localStorage (max 20 entries)
```

## Key Modules

### App.jsx States
`phase` ("input"|"running"|"done"), `idea`, `states`, `activeId`, `finalDoc`, `tab`, `history`

**Key Functions:** `startPlanning()`, `runPieces()`, `assembleDoc()`, `saveToHistory()`

### pieces.js Agent Config
Each agent: `id`, `name`, `symbol`, `color`, `prompt`

### API Streaming
**Gemini:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent` (maxTokens: 1200, temp: 0.7)

**DeepSeek:** Proxies via `http://localhost:3001/api/chat` to NVIDIA NIM

### server.js
Port: 3001, CORS: `http://localhost:5173`

### history.js
Functions: `loadHistory()`, `saveHistory(idea, doc)`, `clearHistory()`
Storage: `gm-history`, max 20 entries (FIFO)

### Components
| Component | Purpose |
|-----------|---------|
| `Header.jsx` | Navigation with tabs and history |
| `InputScreen.jsx` | Project idea form |
| `CrewView.jsx` | Grid of 6 agent cards |
| `PieceCard.jsx` | Agent display with streaming |
| `DocView.jsx` | Final markdown document |
| `HistoryPanel.jsx` | Past saved projects sidebar |

## Configuration

### Environment Variables
**Frontend:** `VITE_GEMINI_API_KEY=your_key`
**Backend:** `NVIDIA_API_KEY=your_key`

### Vite / Express
- Vite dev: `http://localhost:5173`
- Express proxy: `http://localhost:3001`

### CSS Theme
```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-card: #1a1a1a;
  --text-primary: #f5f5f5;
  --text-secondary: #a0a0a0;
  --accent-gold: #c9a84c;
  --accent-copper: #b87333;
  --font-display: 'Bodoni Moda', serif;
  --font-body: 'Manrope', sans-serif;
}
```

### Animations
fadeUp, fadeIn, pulse, blink, slideInFromRight, scaleIn, shimmer, breathe

## External Services

| Service | Endpoint | Auth |
|---------|----------|------|
| Google Gemini | `generativelanguage.googleapis.com` | `VITE_GEMINI_API_KEY` |
| NVIDIA NIM | `integrate.api.nvidia.com` | `NVIDIA_API_KEY` |

## Build & Run

```bash
# Install
npm install

# Configure
cp .env.example .env  # Add API keys

# Development
npm run dev           # Frontend at http://localhost:5173
npm run server        # Backend proxy (optional, for DeepSeek)

# Production
npm run build         # Output to dist/
npm run preview       # Preview build
```

## Customization

- **Agents:** Edit `src/utils/pieces.js` (names, prompts, colors)
- **AI Model:** Update `src/utils/gemini.js` or `deepseek.js` (endpoint, model, params)

## Architecture

```
┌─────────────────────────────────────────┐
│            USER INTERFACE               │
│  InputScreen → CrewView → DocView      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         STATE (App.jsx React)           │
│  phase | idea | states | activeId       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       API UTILITIES                     │
│  gemini.js ←→ deepseek.js              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    EXPRESS PROXY (server.js :3001)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         EXTERNAL APIs                   │
│  Google Gemini | NVIDIA NIM            │
└─────────────────────────────────────────┘
```

## State Flow

```
INPUT ──click──→ RUNNING ──complete──→ DONE
User enters   Agents execute     Document shown
idea + click  King→Bishop→      Save to history
Deploy Crew   Queen→Rook→       Copy/view
              Knight→Pawn       markdown
```

*Last updated: 2026-05-14*
