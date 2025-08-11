# Studio (PromptParser)

Convert natural language into structured JSON, detect potential bias, and get AI-driven prompt enhancements. Built with Next.js App Router, Tailwind CSS, and Genkit using Google AI Gemini 2.0.

- Deployed on Vercel
- Local dev port: 9002

## Features

- Parse prompts to structured JSON with optional bias detection
- One-click prompt enhancements with reasoning
- Local history (stored in `localStorage`) with quick-load
- Clean UI with shadcn/ui + Radix primitives

## Tech Stack

- Next.js 15 (App Router, Server Actions)
- React 18, TypeScript
- Tailwind CSS, shadcn/ui, Radix UI
- Genkit (`genkit`, `@genkit-ai/googleai`) targeting `googleai/gemini-2.0-flash`
- Jest + Testing Library for tests

## Getting Started (Local)

1) Install dependencies

```bash
npm install
```

2) Set environment variables

- Required for AI calls via Genkit Google AI plugin:
  - `GOOGLE_GENAI_API_KEY` (from Google AI Studio)

Create a `.env.local` file in the project root:

```bash
GOOGLE_GENAI_API_KEY=your_key_here
```

3) Run the app

```bash
npm run dev
# http://localhost:9002
```

## Vercel Deployment

This project is optimized for Vercel.

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Output: automatic (Next.js)
- Environment variables (Project Settings → Environment Variables):
  - `GOOGLE_GENAI_API_KEY`

Next.js config in `next.config.ts` ignores TypeScript and ESLint errors during builds to keep deployments unblocked. You can tighten this for production.

## Scripts

```bash
npm run dev          # Next dev (Turbopack) on port 9002
npm run build        # Next build
npm start            # Next start (after build)
npm run lint         # Next lint
npm run typecheck    # TypeScript noEmit check
npm test             # Jest tests

# Genkit developer server (optional local tooling)
npm run genkit:dev   # genkit start -- tsx src/ai/dev.ts
npm run genkit:watch # genkit start -- tsx --watch src/ai/dev.ts
```

## Project Structure

```
src/
  ai/
    genkit.ts                  # Genkit client configured with Google AI plugin
    dev.ts                     # Genkit dev bootstrap (dotenv + flow registration)
    flows/
      parse-prompt-to-json.ts  # Parses prompt → JSON, detects bias
      suggest-prompt-enhancements.ts # Rewrites prompt + reasoning
      generate-title.ts        # Creates short titles for history
  app/
    actions.ts                 # Server Actions calling the flows
    page.tsx                   # Main workspace UI
    layout.tsx                 # Root layout, fonts, theme provider
  components/                  # UI components (shadcn/ui)
  hooks/                       # `use-toast`, etc.
  lib/                         # Utilities
```

## How It Works

- UI triggers Server Actions in `src/app/actions.ts`.
- Actions call Genkit flows defined in `src/ai/flows/*` using the `ai` client from `src/ai/genkit.ts`.
- The Google AI plugin reads `GOOGLE_GENAI_API_KEY` at runtime (Vercel/Node env).
- Local history is stored in `localStorage` and surfaced in the UI.

## Testing

```bash
npm test
```

Jest + jsdom are configured in `jest.config.js` and `src/setupTests.ts`.

## Styling

- Tailwind CSS configured in `tailwind.config.ts`
- Fonts loaded in `src/app/layout.tsx` (Inter, Source Code Pro)
- shadcn/ui components live in `src/components/ui/*`

## Troubleshooting

- 404 or empty responses from AI: ensure `GOOGLE_GENAI_API_KEY` is set in both local `.env.local` and Vercel project settings.
- Build passes despite TS/ESLint issues: `next.config.ts` currently ignores them during builds; adjust for stricter CI.

## License

No license specified. This repository is marked `"private": true` in `package.json`.

