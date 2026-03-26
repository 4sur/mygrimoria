# AGENTS.md - MyGrimoria Development Guide

## Project Overview

MyGrimoria is a mystical oracle application with React frontend and Python FastAPI backend. The app provides I Ching, Tarot, and Runes readings with Supabase authentication.

## Build Commands

### Frontend (React + Vite)
```bash
# Development server (port 3000)
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# TypeScript lint check
npm run lint

# Clean dist folder
npm run clean
```

### Backend (Python FastAPI)
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py

# Run with uvicorn
uvicorn main:app --reload --port 8000
```

### Running Single Test
No test framework is currently configured. To add tests:
```bash
# Install Vitest for frontend unit tests
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# Add to package.json scripts:
# "test": "vitest",
# "test:run": "vitest run"
```

## Code Style Guidelines

### TypeScript Conventions

#### Imports
- Use absolute imports with `@/` alias (configured in tsconfig.json)
- Group imports: external first, then internal
- Use `import { type X }` for type-only imports

```typescript
// Good
import React from 'react';
import { useState, useEffect } from 'react';
import { useOracle } from '@/hooks/useOracle';
import type { Reading } from '@/types';
import { HexagramDisplay } from '@/components/HexagramDisplay';

// Bad
import { useOracle } from '../hooks/useOracle';
import { Reading } from '../types/index';
```

#### Naming Conventions
- **Components**: PascalCase (`HexagramDetail`, `LoginPage`)
- **Hooks**: camelCase with `use` prefix (`useOracle`, `useOracleSession`)
- **Types/Interfaces**: PascalCase (`Reading`, `TarotReading`)
- **Constants**: PascalCase for enums (`Hexagram`, `Rune`), SCREAMING_Snake for config
- **Files**: kebab-case for components (`hexagram-detail.tsx`), camelCase for utilities

#### Type Annotations
- Use explicit return types for functions exported from modules
- Prefer `type` over `interface` for simple object shapes
- Use `import { type X }` syntax

```typescript
// Good
export interface Reading {
    lines: LineValue[];
    primaryHexagram: Hexagram;
    changingHexagram?: Hexagram;
    timestamp: number;
}

// Good - type alias
export type LineValue = 6 | 7 | 8 | 9;
```

### React Patterns

#### Component Structure
```typescript
import React from 'react';
import { useState, useEffect } from 'react';
import type { ComponentProps } from '@/types';

interface Props {
    title: string;
    onComplete?: () => void;
}

export function HexagramDetail({ title, onComplete }: Props) {
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        // effect logic
    }, []);
    
    return (
        <div className="hexagram-detail">
            {/* JSX */}
        </div>
    );
}
```

#### Hooks
- Always prefix with `use` (e.g., `useOracle`)
- Return typed objects
- Use custom hooks for reusable logic

### Error Handling

```typescript
// API calls - handle errors gracefully
try {
    const { data, error } = await supabase.from('readings').select('*');
    if (error) throw error;
    return data;
} catch (err) {
    console.error('Failed to fetch readings:', err);
    return [];
}

// For user-facing errors, use toast/notification
```

### Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
```

### TailwindCSS 4

This project uses TailwindCSS v4. Use utility classes directly:
```typescript
// Good
<div className="flex items-center justify-between p-4 bg-slate-900">

// Avoid custom CSS modules when possible
```

### Backend Python (FastAPI)

#### Structure
```
backend/
├── main.py          # FastAPI app entry point
├── auth.py          # Authentication logic
├── models.py        # SQLAlchemy/Pydantic models
├── database.py      # Database connection
├── constants/      # Static data
└── alembic/        # Database migrations
```

#### Patterns
- Use Pydantic models for request/response validation
- Use Supabase client for database operations
- Return appropriate HTTP status codes

## Project Structure

```
src/
├── App.tsx                 # Main app with routes
├── main.tsx               # Entry point
├── index.css              # Global styles (Tailwind)
├── assets/                # Static assets
├── components/            # Reusable UI components
│   ├── Auth/              # Auth components
│   └── Layout/            # Layout components
├── pages/                 # Route pages
│   ├── Home/
│   ├── Blog/
│   ├── Iching/
│   ├── Tarot/
│   ├── Runes/
│   ├── Oracle/
│   ├── Grimorio/
│   └── Sanctum/
├── hooks/                 # Custom React hooks
├── context/               # React context providers
├── services/              # API services
├── lib/                   # Utilities (Supabase client)
├── constants/             # Static data (tarot.ts, runes.ts, iching.ts)
└── types/                 # TypeScript type definitions
```

## Common Development Tasks

### Adding a New Page
1. Create component in `src/pages/NewPage/`
2. Add route in `App.tsx`
3. Use `ProtectedRoute` if auth required

### Adding a New Oracle Type
1. Add constants in `src/constants/`
2. Add types in `src/types/index.ts`
3. Create page component
4. Add route in `App.tsx`

### Database Changes
1. Modify models in `backend/models.py`
2. Generate Alembic migration: `alembic revision --autogenerate -m "description"`
3. Run migration: `alembic upgrade head`

## IDE Recommendations

- VS Code with extensions: ESLint, Prettier, TailwindCSS IntelliSense
- Enable "Format on Save" for TypeScript and CSS
