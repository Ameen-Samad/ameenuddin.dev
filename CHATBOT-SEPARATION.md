# Chatbot Separation Documentation

## CRITICAL: Two Separate Chatbots

This project has **TWO COMPLETELY SEPARATE** chatbots. Do NOT confuse them!

### 1. Guitar Chat - AI Guitar Concierge

**Purpose**: Help users find and purchase guitars

**Routes**:
- Frontend: `/demo/guitars` (integrated into guitar demo page)
- API: `/demo/api/ai/guitars/chat`

**Files**:
- API: `src/routes/demo/api.ai.guitars.chat.ts`
- Component: `src/routes/demo/guitars/_components/-GuitarChat.tsx`

**Features**:
- Tool calling with `recommendGuitar` tool
- Shows interactive guitar cards
- Uses Llama 4 Scout model
- Has access to guitar inventory
- Personality: Warm, friendly guitar shop owner with 30 years experience

**Tools**:
```typescript
- getGuitars: View all available guitars
- recommendGuitar: Display guitar recommendation cards
```

---

### 2. Portfolio Chat - Ameenuddin Portfolio Assistant

**Purpose**: Answer questions about Ameen Uddin's background, skills, and projects

**Routes**:
- Frontend: `/demo/ai-portfolio`
- API: `/demo/api/ai/portfolio`

**Files**:
- API: `src/routes/demo/api.ai.portfolio.ts`
- Component: `src/routes/demo/ai-portfolio.tsx`

**Features**:
- NO tool calling
- NO guitar functionality
- Simple Q&A about Ameen's professional background
- Uses Llama 4 Scout model
- Personality: Professional, helpful AI assistant

**Tools**: NONE (empty array)

**Topics**:
- AI/ML expertise
- Full-stack development
- Cloud infrastructure (Cloudflare Workers)
- Projects and technical work

---

## Key Differences

| Feature | Guitar Chat | Portfolio Chat |
|---------|-------------|----------------|
| Purpose | Sell guitars | Showcase Ameen's work |
| Tools | Yes (recommendGuitar) | No |
| Model | Llama 4 Scout | Llama 4 Scout |
| Location | /demo/guitars | /demo/ai-portfolio |
| API Route | /demo/api/ai/guitars/chat | /demo/api/ai/portfolio |
| Import guitars? | YES | NO |
| Guitar cards? | YES | NO |
| Tool calls? | YES | NO |

---

## Common Mistakes to Avoid

❌ **DO NOT** add guitar tools to portfolio chat
❌ **DO NOT** import `guitars` data in portfolio chat API
❌ **DO NOT** render guitar cards in portfolio chat frontend
❌ **DO NOT** confuse the two when making changes

✅ **DO** keep them completely separate
✅ **DO** use different file names (guitars.chat vs portfolio)
✅ **DO** check which chatbot you're editing before making changes

---

## File Naming Convention

To avoid confusion, files are named explicitly:

- `api.ai.guitars.chat.ts` - Guitar chatbot API
- `api.ai.portfolio.ts` - Portfolio chatbot API
- `ai-portfolio.tsx` - Portfolio chatbot frontend
- `-GuitarChat.tsx` - Guitar chatbot frontend component

---

## History

**Problem**: The portfolio chat (originally `api.ai.chat.ts`) had guitar tools and guitar imports, causing confusion. It was mixing concerns between portfolio Q&A and guitar recommendations.

**Solution**:
1. Renamed `api.ai.chat.ts` → `api.ai.portfolio.ts`
2. Renamed `ai-chat.tsx` → `ai-portfolio.tsx`
3. Removed all guitar tools and imports from portfolio chat
4. Added clear documentation headers in both files
5. Created this document to prevent future confusion

**Date**: 2026-01-22
