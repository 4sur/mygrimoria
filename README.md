<div align="center">
  <h1>MyGrimoria</h1>
  <p>A mystical oracle application for I Ching, Tarot, and Runes readings</p>
</div>

---

## About

MyGrimoria is a web application that provides mystical divination experiences through three ancient oracle systems:

- **I Ching (Yi Jing)** — The Book of Changes, using hexagrams
- **Tarot** — The classic 78-card deck with three-card spreads
- **Runes** — The ancient Futhark alphabet oracle

The app features user authentication, personal sanctum (spellbook), and AI-powered interpretations.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript |
| Styling | TailwindCSS 4 |
| Animation | Motion (Framer Motion) |
| Routing | React Router DOM 7 |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL + Auth) |
| AI | DeepSeek API |
| Build | Vite 6 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.13+
- Supabase account
- DeepSeek API key

### Installation

```bash
# Clone the repository
git clone https://github.com/4sur/mygrimoria.git
cd mygrimoria

# Frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

### Environment Variables

Create `.env` file in root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Running the App

```bash
# Frontend (port 3000)
npm run dev

# Backend (port 8000)
cd backend
python main.py
# or
uvicorn main:app --reload --port 8000
```

---

## Project Structure

```
mygrimoria/
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   │   ├── Auth/            # Authentication components
│   │   └── Layout/          # Layout (Header, Footer)
│   ├── pages/               # Route pages
│   │   ├── Home/            # Landing page
│   │   ├── Blog/            # WordPress blog integration
│   │   ├── Iching/          # Hexagram oracle
│   │   ├── Tarot/           # Tarot card oracle
│   │   ├── Runes/           # Rune oracle
│   │   ├── Oracle/          # Intention setting
│   │   ├── Sanctum/           # User's personal spellbook
│   │   ├── Sanctum/         # User profile/settings
│   │   └── Login/           # Authentication
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React context providers
│   ├── services/            # API services
│   ├── lib/                 # Utilities (Supabase client)
│   ├── constants/           # Oracle data (tarot, runes, iching)
│   └── types/               # TypeScript definitions
├── backend/                 # FastAPI backend
│   ├── main.py              # API entry point
│   ├── auth.py              # Authentication logic
│   ├── models.py            # Database models
│   ├── database.py          # DB connection
│   ├── constants/           # Backend data
│   └── alembic/             # Database migrations
├── stitch/                  # Design prototypes (HTML/CSS)
└── AGENTS.md               # Developer guidelines
```

---

## Features

- **Oracle Readings**: Get divinations from I Ching, Tarot, or Runes
- **AI Interpretation**: Receive AI-powered explanations via DeepSeek
- **User Accounts**: Sign up and login with Supabase Auth
- **Sanctum**: Save and revisit your readings
- **Sanctum**: Manage your profile and settings
- **Blog**: Read mystical content via WordPress integration

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript type check |
| `npm run clean` | Remove dist folder |

---

## Project Audit (SDD Analysis)

### 🔍 Socratic Analysis - Hidden Assumptions & Gaps

| Assumption | Risk Level | Notes |
|------------|------------|-------|
| Users have reliable internet | Medium | AI interpretations fail gracefully, but no offline mode |
| Supabase always available | High | No fallback if Supabase is down |
| DeepSeek API always available | Medium | Fallback messages exist, but limited |
| Dark mode is desired | Low | Implemented via CSS variables, no toggle UI |

### 📋 Spec Review - Functional Requirements

| Feature | Status | Notes |
|---------|--------|-------|
| I Ching hexagram casting | ✅ Complete | 6-line casting with changing lines |
| I Ching AI interpretation | ✅ Complete | DeepSeek integration |
| I Ching chat with Master | ✅ Complete | Session-based chat |
| I Ching history/save | ✅ Complete | Via /api/history |
| Tarot 3-card spread | ✅ Complete | Past/Present/Future |
| Tarot AI interpretation | ✅ Complete | DeepSeek integration |
| Tarot chat | ✅ Complete | Session-based |
| Tarot history/save | ✅ Complete | Via /api/history |
| Runes 3-rune spread | ✅ Complete | Urd/Verdandi/Skuld |
| Runes AI interpretation | ✅ Complete | DeepSeek integration |
| Runes chat | ✅ Complete | Session-based |
| Runes history/save | ✅ Complete | Via /api/history |
| User authentication | ✅ Complete | Supabase Auth |
| User profile (Sanctum) | ✅ Complete | /api/me endpoint |
| Blog integration | ✅ Partial | wpService exists but not fully connected |
| Sanctum (saved readings) | ⚠️ Partial | Data saved but no dedicated UI |

### 🎨 Design Review - Technical Architecture

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend React 19 + Vite | ✅ Good | Modern stack, fast HMR |
| TailwindCSS 4 | ✅ Good | CSS var-based theming |
| Motion animations | ✅ Good | Smooth transitions |
| TypeScript | ✅ Good | Proper typing, some `any` remains |
| FastAPI backend | ✅ Good | Clean REST structure |
| SQLAlchemy async | ✅ Good | Modern async patterns |
| Auth flow | ✅ Good | Supabase JWT + sync_user_profile |
| API error handling | ✅ Good | Fallback messages on errors |

### 💻 Dev Review - Code Quality

| Area | Status | Notes |
|------|--------|-------|
| Code duplication | ⚠️ Medium | Tarot/Runes/Iching pages share ~70% identical logic |
| Hook separation | ✅ Good | useOracle, useOracleSession well abstracted |
| Component organization | ✅ Good | Clear directory structure |
| State management | ⚠️ Medium | Local state heavy, no global store |
| API services | ✅ Good | Clean separation in api.ts |
| Environment config | ⚠️ Low | Some hardcoded values (DeepSeek URL) |

### 📊 Data/Analytics Review - Instrumentation

| Area | Status | Notes |
|------|--------|-------|
| Event tracking | ❌ Missing | No analytics events defined |
| User journey tracking | ❌ Missing | No Funnel/Retention tracking |
| Error reporting | ❌ Missing | Only console.error, no Sentry/etc |
| Performance monitoring | ❌ Missing | No Core Web Vitals tracking |

---

## 🚧 Known Issues & Technical Debt

1. **No offline support** - Requires internet for any AI feature
2. **Hardcoded AI URLs** - DeepSeek endpoint in backend/main.py
3. **Duplicated page logic** - Iching/Tarot/Runes pages should share a base component
4. **No loading states on initial load** - App crashes if Supabase unavailable
5. **Blog not connected** - wpService.ts exists but not wired to UI
5. **Sanctum UI missing** - Data saved, but no dedicated page to browse past readings
7. **No error boundaries** - React errors can crash entire app

---

## 🎯 Recommendations (Priority Order)

### High Priority
1. **Add error boundaries** - Wrap pages in ErrorBoundary components
2. **Connect Sanctum page** - Create UI to browse /api/history
3. **Fix hardcoded API URLs** - Move to environment variables

### Medium Priority
4. **Refactor oracle pages** - Create shared `OraclePage` component
5. **Add analytics** - Implement basic event tracking
6. **Wire Blog** - Connect wpService to Blog page

### Low Priority
7. **Add offline mode** - Cache last readings locally
8. **Performance monitoring** - Add Core Web Vitals
9. **Dark mode toggle** - Add theme switcher in Header

---

## 🗺️ Roadmap (Next Steps)

See [ROADMAP.md](./ROADMAP.md) for detailed planning.

### Phase 1 — Cleanup & Stabilization
- [x] Replace Gemini with DeepSeek ✅
- Verify backend works with DeepSeek
- Clean up obsolete references

### Phase 2 — Sanctum UI
- Create UI to browse `/api/history`
- Filter by oracle (I Ching/Tarot/Runas)
- Show saved interpretation + chat history

### Phase 3 — Blog (WordPress Headless)
- Configure Apollo Client
- Connect Blog.tsx with WPGraphQL

### Phase 4 — UX/UI Improvements
- Add error boundaries
- Improve loading states
- Add offline mode

### Phase 5 — Analytics
- Implement basic event tracking
- Add error reporting (Sentry)

### Phase 6 — Gamification (Future)
- XP and levels system
- Badges
- Credits system

---

## License

MIT