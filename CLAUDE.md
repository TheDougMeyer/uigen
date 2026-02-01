# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language via a chat interface, and Claude generates React code that renders in a sandboxed iframe preview. Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, and Prisma/SQLite.

## Commands

```bash
npm run setup          # First-time setup: install deps + Prisma generate + migrate
npm run dev            # Dev server with Turbopack (http://localhost:3000)
npm run build          # Production build
npm run lint           # ESLint
npm test               # Vitest (runs in watch mode)
npx vitest run         # Vitest single run (no watch)
npx vitest run src/lib/__tests__/file-system.test.ts  # Run a single test file
npm run db:reset       # Reset SQLite database (destructive)
npx prisma migrate dev # Apply pending migrations
npx prisma generate    # Regenerate Prisma client after schema changes
```

The `ANTHROPIC_API_KEY` env var is optional. Without it, a mock provider returns static component templates instead of calling Claude.

## Architecture

### Data Flow

```
User chat input → useChat hook → POST /api/chat → Claude AI (streaming)
  → AI calls tools (str_replace_editor, file_manager)
  → onToolCall callback → FileSystemProvider updates virtual FS
  → refreshTrigger → PreviewFrame re-renders via Babel JSX transform in iframe
```

### Key Subsystems

**Virtual File System** (`src/lib/file-system.ts`): In-memory Map-based file system. No files are written to disk. Serialized to JSON for persistence in the database. The `FileSystemProvider` context (`src/lib/contexts/file-system-context.tsx`) wraps this class and provides React state management.

**AI Chat** (`src/app/api/chat/route.ts`): Streaming API route using Vercel AI SDK with Anthropic. Exposes two tools to the AI:
- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create/edit files via string replacement
- `file_manager` (`src/lib/tools/file-manager.ts`) — rename/delete files

**Preview Rendering** (`src/components/preview/PreviewFrame.tsx`): Transforms JSX to JS using Babel standalone (client-side), builds an import map resolving packages via esm.sh CDN, and renders everything in a sandboxed iframe with Tailwind CSS injected.

**State Management**: Two React contexts drive the UI:
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat()`, handles streaming and tool call delegation
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — manages virtual file CRUD, exposes a `refreshTrigger` that the preview watches

**Auth** (`src/lib/auth.ts`, `src/actions/index.ts`): JWT-based sessions stored in cookies. Anonymous usage is supported (no login required). Middleware protects `/api/projects` routes.

**Database**: SQLite via Prisma. Schema at `prisma/schema.prisma`. Two models: `User` and `Project`. Projects store messages and file data as JSON strings.

### Layout Structure

The main UI (`src/app/main-content.tsx`) uses resizable panels: chat interface on the left, tabbed preview/code editor on the right. Project pages are at `src/app/[projectId]/`.

### Path Aliases

TypeScript path alias `@/*` maps to `./src/*`.

## Testing

Vitest with jsdom environment and React Testing Library. Tests live in `__tests__/` directories adjacent to source files (e.g., `src/components/chat/__tests__/`, `src/lib/__tests__/`).
