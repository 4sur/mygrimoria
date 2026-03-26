<div align="center">
  <img width="200" height="200" alt="MyGrimoria Logo" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <h1>MyGrimoria</h1>
  <p>A mystical oracle application for I Ching, Tarot, and Runes readings</p>
</div>

---

## About

MyGrimoria is a web application that provides mystical divination experiences through three ancient oracle systems:

- **I Ching (Yi Jing)** — The Book of Changes, using hexagrams
- **Tarot** — The classic 78-card deck with three-card spreads
- **Runes** — The ancient Futhark alphabet oracle

The app features user authentication, personal grimorio (spellbook), and AI-powered interpretations.

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
| AI | Google Gemini API |
| Build | Vite 6 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.13+
- Supabase account
- Gemini API key

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
GEMINI_API_KEY=your_gemini_api_key
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
│   │   ├── Grimorio/        # User's personal spellbook
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
- **AI Interpretation**: Receive AI-powered explanations via Gemini
- **User Accounts**: Sign up and login with Supabase Auth
- **Grimorio**: Save and revisit your readings
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

## License

MIT