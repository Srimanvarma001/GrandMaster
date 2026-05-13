# GRANDMASTER - Project Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Workflow & Pipeline](#4-workflow--pipeline)
5. [Key Modules](#5-key-modules)
6. [Configuration](#6-configuration)
7. [External Services](#7-external-services)
8. [Build & Run](#8-build--run)

---

## 1. Project Overview

**GRANDMASTER** is a multi-agent AI-powered project planner that generates complete project briefs through six specialist "chess-piece" agents. The system analyzes user ideas sequentially and produces comprehensive documentation covering:

- Strategic overview and mission
- Competitive landscape and market positioning
- Full product specifications and architecture
- Infrastructure and deployment decisions
- QA/testing strategies and risk analysis
- Actionable task breakdowns

**Purpose:** Automate the project planning/briefing process by leveraging AI agents specialized in different aspects of project development.

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.2.0 | Build tool |
| react-markdown | 9.0.1 | Markdown rendering |
| CSS Modules | - | Component styling |

**Fonts:** Bodoni Moda (display), Manrope (body) - via Google Fonts

### Backend (Express Proxy)
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.18.2 | HTTP server |
| cors | 2.8.5 | Cross-origin resource sharing |
| node-fetch | 3.3.2 | HTTP client |
| dotenv | 16.4.5 | Environment variables |

### AI/ML APIs
| Provider | Model | Usage |
|----------|-------|-------|
| Google Gemini | 2.0 Flash | Primary AI engine |
| DeepSeek | V4 Flash (via NVIDIA NIM) | Alternative AI engine |

### Language
- **JavaScript** (ES6+) with ES Modules (`"type": "module"`)

---

## 3. Directory Structure

```
grandmaster/
├── index.html                      # Entry HTML file
├── vite.config.js                  # Vite build configuration
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Locked dependency versions
├── .env                            # Local environment variables
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── .agents/
│   └── skills/
│       └── frontend-design/
│           ├── SKILL.md            # Frontend design skill
│           └── LICENSE.txt
├── skills-lock.json                # Skill lock file
├── server.js                       # Express proxy server (port 3001)
├── dist/                           # Production build output
│   ├── index.html
│   └── assets/
└── src/
    ├── main.jsx                    # React entry point
    ├── App.jsx                     # Main application logic
    ├── index.css                   # Global styles & CSS variables
    ├── utils/
    │   ├── pieces.js               # Agent configurations (6 chess pieces)
    │   ├── gemini.js               # Google Gemini API streaming
    │   ├── deepseek.js             # NVIDIA NIM/DeepSeek streaming
    │   └── history.js              # localStorage history management
    └── components/
        ├── Header.jsx              # Navigation header
        ├── InputScreen.jsx         # Project idea input form
        ├── CrewView.jsx            # Grid display of 6 agents
        ├── PieceCard.jsx           # Individual agent output card
        ├── DocView.jsx             # Final markdown document viewer
        └── HistoryPanel.jsx        # Past saved ideas sidebar
```

---

## 4. Workflow & Pipeline

### 4.1 High-Level Flow

```
User Input (Idea)
       ↓
┌─────────────────────┐
│   INPUT SCREEN       │
│  - Enter project     │
│  - Click Deploy Crew │
└─────────────────────┘
       ↓
┌─────────────────────┐
│  AGENT EXECUTION     │
│  Sequential run of   │
│  6 chess-piece agents│
└─────────────────────┘
       ↓
┌─────────────────────┐
│  DOCUMENT ASSEMBLY   │
│  Combine all outputs│
│  Format as markdown │
└─────────────────────┘
       ↓
┌─────────────────────┐
│  OUTPUT & STORAGE   │
│  Display + Save to  │
│  localStorage       │
└─────────────────────┘
```

### 4.2 Agent Execution Sequence

Agents execute **sequentially** in this order with **1.5s delay** between each:

```
1. King (♔) → Chief of Staff
2. Bishop (♝) → Research & Strategy
3. Queen (♛) → Lead Builder
4. Rook (♜) → Infrastructure
5. Knight (♞) → QA & Testing
6. Pawn (♟) → Task Executor
```

### 4.3 Per-Agent Process

For each agent in sequence:
1. Wait 1.5 seconds
2. Set agent as `active` state
3. Call `streamAgent()` with agent config
4. Stream AI response in real-time (via `onChunk` callback)
5. Update agent state to `done` when complete
6. Proceed to next agent

### 4.4 Data Flow

```
User Input (idea)
       ↓
  App.jsx State
  - phase: "input" | "running" | "done"
  - idea: string
  - states: { [pieceId]: { status, output } }
  - activeId: current agent ID
       ↓
  API Streaming (gemini.js / deepseek.js)
  - Request: POST with idea + system prompt
  - Response: Server-Sent Events (SSE) stream
       ↓
  UI Updates (PieceCard)
  - onChunk callback receives text chunks
  - Real-time display of streaming text
       ↓
  Output Assembly
  - Combine all 6 outputs into final markdown
  - Add header with idea + timestamp
       ↓
  Persistence (history.js)
  - Save to localStorage (max 20 entries)
```

---

## 5. Key Modules

### 5.1 App.jsx (Main Orchestrator)

**States:**
| State | Type | Description |
|-------|------|-------------|
| `phase` | string | "input" \| "running" \| "done" |
| `idea` | string | User's project idea |
| `states` | object | Agent statuses and outputs |
| `activeId` | string | Currently executing agent |
| `finalDoc` | string | Assembled markdown document |
| `tab` | string | "crew" \| "doc" view toggle |
| `history` | array | Past saved projects |

**Key Functions:**
- `startPlanning()` - Initiates the workflow
- `runPieces()` - Executes agents sequentially
- `assembleDoc()` - Combines outputs into final markdown
- `saveToHistory()` - Persists to localStorage

### 5.2 pieces.js (Agent Configurations)

Six chess-piece agents with unique roles:

| Piece | Symbol | Role | Output Focus |
|-------|--------|------|--------------|
| **King** | ♔ | Chief of Staff | Strategic overview, mission, risks, metrics |
| **Bishop** | ♝ | Research & Strategy | Competitive landscape, market positioning |
| **Queen** | ♛ | Lead Builder | Full product spec, features, architecture |
| **Rook** | ♜ | Infrastructure | Tech stack, deployment, infra decisions |
| **Knight** | ♞ | QA & Testing | Risks, edge cases, security, test scenarios |
| **Pawn** | ♟ | Task Executor | Numbered task breakdown by phase |

Each agent config contains:
- `id`: Unique identifier
- `name`: Display name
- `symbol`: Chess symbol
- `color`: Theme color
- `prompt`: System prompt/instructions

### 5.3 gemini.js (Google Gemini API)

```javascript
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent
Model: gemini-2.0-flash
Max tokens: 1200
Temperature: 0.7
```

**Streaming Implementation:**
- Uses fetch with ReadableStream
- Parses SSE (Server-Sent Events) format
- Calls `onChunk` callback for each text fragment

### 5.4 deepseek.js (NVIDIA NIM / DeepSeek)

```javascript
Proxy Endpoint: http://localhost:3001/api/chat
Model: deepseek-ai/deepseek-v4-flash
Backend: Express server.js
```

Proxies requests through Express to NVIDIA NIM API.

### 5.5 server.js (Express Proxy)

**Configuration:**
- Port: 3001
- CORS: Allows http://localhost:5173 (Vite dev server)

**Endpoint:** `POST /api/chat`
- Forwards to: `https://integrate.api.nvidia.com/v1/chat/completions`
- Uses `NVIDIA_API_KEY` from environment

### 5.6 history.js (localStorage Management)

**Functions:**
| Function | Description |
|----------|-------------|
| `loadHistory()` | Retrieve saved projects from localStorage |
| `saveHistory(idea, doc)` | Add new entry (max 20, FIFO) |
| `clearHistory()` | Remove all saved entries |

**Storage Key:** `gm-history`
**Max Entries:** 20

### 5.7 Components

| Component | Purpose |
|-----------|---------|
| `Header.jsx` | Navigation with tabs and history button |
| `InputScreen.jsx` | Form to enter project idea |
| `CrewView.jsx` | Grid layout of all 6 agent cards |
| `PieceCard.jsx` | Individual agent display with streaming output |
| `DocView.jsx` | Rendered markdown of final document |
| `HistoryPanel.jsx` | Sidebar showing past saved projects |

---

## 6. Configuration

### 6.1 Environment Variables

**Frontend (.env):**
```bash
VITE_GEMINI_API_KEY=your_gemini_key_here
```

**Backend (.env):**
```bash
NVIDIA_API_KEY=your_nvidia_key_here
```

### 6.2 Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
// Dev server: http://localhost:5173
```

### 6.3 Express Server

```javascript
// server.js
const PORT = 3001
const CORS_ORIGIN = 'http://localhost:5173'
```

### 6.4 CSS Theme Variables

```css
:root {
  /* Colors - Dark theme with copper/amber accents */
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-card: #1a1a1a;
  --text-primary: #f5f5f5;
  --text-secondary: #a0a0a0;
  --accent-gold: #c9a84c;
  --accent-copper: #b87333;
  
  /* Fonts */
  --font-display: 'Bodoni Moda', serif;
  --font-body: 'Manrope', sans-serif;
}
```

### 6.5 CSS Animations

| Animation | Purpose |
|-----------|---------|
| fadeUp | Initial load effect |
| fadeIn | Element appearance |
| pulse | Active agent indicator |
| blink | Cursor/loading state |
| slideInFromRight | Panel transitions |
| scaleIn | Modal/card appearance |
| shimmer | Loading skeleton |
| breathe | Subtle continuous animation |

---

## 7. External Services

### 7.1 Google Gemini API

**Purpose:** Primary AI model for agent responses

**Endpoint:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent
```

**Parameters:**
- `key`: API key from `VITE_GEMINI_API_KEY`
- `contents`: Array of message objects
- `generationConfig.maxOutputTokens`: 1200
- `generationConfig.temperature`: 0.7

### 7.2 NVIDIA NIM API (DeepSeek)

**Purpose:** Alternative AI model

**Endpoint:**
```
https://integrate.api.nvidia.com/v1/chat/completions
```

**Authentication:** Bearer token via `NVIDIA_API_KEY`

**Model:** `deepseek-ai/deepseek-v4-flash`

### 7.3 Google Fonts

```
https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,700&family=Manrope:wght@300;400;500;600;700&display=swap
```

---

## 8. Build & Run

### Prerequisites
- Node.js (v18+ recommended)
- API key(s):
  - Google Gemini API key (primary)
  - OR NVIDIA API key (alternative)

### Setup Steps

**1. Install dependencies:**
```bash
npm install
```

**2. Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your API key(s)
```

**3. Start frontend development server:**
```bash
npm run dev
# Opens at http://localhost:5173
```

**4. (Optional) Start backend proxy for DeepSeek:**
```bash
npm run server
# Runs on http://localhost:3001
```

### Production Build

**Build:**
```bash
npm run build
# Output in dist/ folder
```

**Preview production build:**
```bash
npm run preview
```

### Customization

**Modify agents:** Edit `src/utils/pieces.js` to change:
- Agent names, symbols, colors
- System prompts/instructions
- Output focus areas

**Change AI model:** Update `src/utils/gemini.js` or `src/utils/deepseek.js` with new:
- Endpoint URL
- Model name
- Parameters (temperature, max tokens)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ InputScreen  │→ │   CrewView   │→ │      DocView           │ │
│  │              │  │  (6 agents)  │  │  (Final Document)      │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                           │
│                     (App.jsx - React State)                     │
│  phase | idea | states | activeId | finalDoc | tab | history    │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                       API UTILITIES                             │
│  ┌─────────────────────┐      ┌─────────────────────────────┐  │
│  │     gemini.js       │      │        deepseek.js          │  │
│  │ (Google Gemini API) │      │   (NVIDIA NIM Proxy)        │  │
│  └─────────────────────┘      └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND PROXY                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    server.js (Express)                     │  │
│  │                   Port: 3001                               │  │
│  │                  CORS: localhost:5173                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL APIs                              │
│  ┌──────────────────────────┐  ┌─────────────────────────────┐  │
│  │   Google Gemini API      │  │     NVIDIA NIM API         │  │
│  │   (Direct from client)   │  │   (Via Express proxy)      │  │
│  └──────────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Flow Diagram

```
Phase: INPUT                           Phase: RUNNING                          Phase: DONE
┌─────────────────────┐                ┌─────────────────────┐                ┌─────────────────────┐
│                     │                │                     │                │                     │
│  User enters idea   │──click──→     │  Agents execute     │──complete──→   │  Document shown     │
│                     │                │  sequentially        │                │                     │
│  Deploy Crew btn    │                │                     │                │  Save to history    │
│                     │                │  King→Bishop→Queen  │                │                     │
│                     │                │  →Rook→Knight→Pawn  │                │  User can copy/     │
│                     │                │                     │                │  view markdown      │
└─────────────────────┘                └─────────────────────┘                └─────────────────────┘
```

---

*Document generated from project analysis - Last updated: 2026-05-14*
