# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ea** (Entrenamiento Auditivo) is a web application for teaching Colombian music theory through interactive ear training exercises. It focuses on chord progressions, rhythm patterns, and melodic dictation for genres like cumbia, vallenato, and bambuco.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework:** Next.js 16 with App Router, React 19, TypeScript
- **State:** Zustand (persisted to localStorage)
- **Audio:** Tone.js for synthesis and playback
- **UI:** shadcn/ui components (Radix UI), Tailwind CSS 4, Framer Motion
- **Path alias:** `@/*` maps to `./src/*`

## Architecture

### App Router Structure

```
src/app/
├── (modules)/           # Route group (no URL impact)
│   ├── progresiones/    # Chord progression exercises
│   ├── ritmos/          # Rhythm pattern exercises
│   ├── dictado/         # Melodic dictation
│   └── repertorio/      # Song browser
└── progreso/            # Progress/stats dashboard
```

### Key Directories

- `/components/ui/` - shadcn/ui base components
- `/components/exercises/` - Exercise logic components
- `/components/audio/` - Audio visualization (piano, rhythm grid)
- `/lib/audio/` - ToneEngine singleton for audio synthesis
- `/stores/` - Zustand stores (progress-store, exercise-store)
- `/data/` - Static music data (progressions, rhythms, repertoire)
- `/types/music.ts` - All TypeScript types for music domain

### Audio System

`ToneEngine` (singleton in `/lib/audio/tone-engine.ts`) wraps Tone.js:
- PolySynth for chords/melodies
- MembraneSynth for drums
- MetalSynth for hi-hat/guira
- Transport-based scheduling with beat callbacks

Use the `useTone` hook for React integration - it handles dynamic imports to avoid SSR issues.

### State Management

- **progressStore:** Persisted user stats, exercise history, accuracy by type/genre
- **exerciseStore:** Current exercise state (selected answer, feedback)

## Conventions

- Client components use `'use client'` directive
- Stores use kebab-case with `-store` suffix
- All music types defined in `/types/music.ts`
- Data files export typed constants (progressions, rhythms, songs)
