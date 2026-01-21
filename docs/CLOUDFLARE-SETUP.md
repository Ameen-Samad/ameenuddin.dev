# Cloudflare Workers AI Setup Guide

## Overview

Your portfolio uses **Cloudflare Workers AI** for AI-powered features:

### Models Used

| Feature | Model | Purpose |
|---------|-------|---------|
| **Three.js Code Generation** | `@cf/qwen/qwen2.5-coder-32b-instruct` | Generates Three.js code from natural language |
| **Semantic Search** | `@cf/google/embeddinggemma-300m` | Vector embeddings for AI-powered search (Google's optimized embedding model) |
| **Project Summaries** | `@cf/meta/llama-4-scout-17b-16e-instruct` | Generates project descriptions and features (Meta's latest Llama 4) |

## How It Works

### ✅ When Deployed to Cloudflare Pages/Workers

**No setup needed!** Once deployed, your code automatically gets access to Workers AI through the AI binding.

The AI binding (configured in `wrangler.jsonc`) gives your worker direct access to Cloudflare's AI models without needing API keys or account IDs.

### 🔧 For Local Development

You need to configure:

1. **Cloudflare Account ID**
2. **Cloudflare API Token**

## Setup Steps

### 1. Get Your Cloudflare Account ID

```bash
# Option 1: From Cloudflare Dashboard
# Go to: https://dash.cloudflare.com
# Look in the URL: https://dash.cloudflare.com/<YOUR_ACCOUNT_ID>

# Option 2: Using Wrangler CLI
wrangler whoami
```

### 2. Create a Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Or create custom token with these permissions:
   - Account > Workers AI > Read
   - Account > Workers Scripts > Edit

### 3. Update Environment Variables

Add to `.env.local`:

```bash
# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
```

### 4. Update Code to Use Environment Variables

The code in `src/routes/api/generate-three.tsx` currently has a placeholder. You can either:

**Option A: Use environment variable (for local dev)**
```typescript
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/qwen/qwen2.5-coder-32b-instruct`;
```

**Option B: Use Workers AI binding (recommended for production)**

When deployed to Cloudflare Workers, use the AI binding directly:

```typescript
// In your Worker context
export default {
  async fetch(request, env) {
    const ai = env.AI; // AI binding from wrangler.jsonc

    const response = await ai.run('@cf/qwen/qwen2.5-coder-32b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 3000,
      temperature: 0.7
    });

    return new Response(JSON.stringify(response));
  }
};
```

## Deployment

### Deploy to Cloudflare Pages

```bash
# Build and deploy
pnpm run deploy

# This runs:
# 1. pnpm run build  -> Creates dist/ folder
# 2. wrangler pages deploy ./dist -> Deploys to Cloudflare
```

### Test Locally with Wrangler

```bash
# Run with Cloudflare Workers environment
pnpm run dev:worker

# This uses wrangler pages dev with AI binding
```

## Configuration Files

### ✅ Already Configured

- **`wrangler.jsonc`** - Added AI binding:
  ```jsonc
  {
    "ai": {
      "binding": "AI"
    }
  }
  ```

### ⚠️ Needs Configuration

- **`src/routes/api/generate-three.tsx`** - Replace `REPLACE_WITH_ACCOUNT_ID` with:
  - Environment variable: `process.env.CLOUDFLARE_ACCOUNT_ID`
  - Or use AI binding when deployed

## Models Reference

### Qwen 2.5 Coder (32B)
- **ID**: `@cf/qwen/qwen2.5-coder-32b-instruct`
- **Purpose**: Code generation (Three.js scenes)
- **Max Tokens**: 3000
- **Temperature**: 0.7 (balanced creativity)
- **Why**: Specialized for coding tasks with excellent Three.js knowledge

### Google EmbeddingGemma (300M)
- **ID**: `@cf/google/embeddinggemma-300m`
- **Purpose**: Convert text to vector embeddings
- **Dimensions**: 768
- **Use Case**: Semantic search
- **Why**: Google's optimized embedding model - faster and more accurate than BGE

### Meta Llama 4 Scout (17B)
- **ID**: `@cf/meta/llama-4-scout-17b-16e-instruct`
- **Purpose**: Generate summaries and descriptions
- **Use Case**: Project documentation
- **Why**: Latest Llama 4 model - significantly better at instruction following and content generation

## Troubleshooting

### "Cannot find module '@cloudflare/ai'"

**For local dev**: This is expected - `@cloudflare/ai` only works when deployed to Workers.

**Solutions**:
1. Use `pnpm run dev:worker` instead of `pnpm run dev`
2. Or add conditional imports to check if running in Workers environment
3. Or mock AI responses for local development

### "Failed to resolve import"

The dev server doesn't have access to Cloudflare-specific modules. This is normal and won't affect production deployment.

### API Token Errors

If you get 401/403 errors:
1. Check your API token has Workers AI permissions
2. Verify account ID matches your Cloudflare account
3. Ensure token hasn't expired

## Next Steps

1. ✅ AI binding configured in `wrangler.jsonc`
2. ⏳ Get your Cloudflare Account ID and API Token
3. ⏳ Update `.env.local` with credentials
4. ⏳ Update `generate-three.tsx` to use environment variables
5. ⏳ Deploy to Cloudflare Pages to test
6. ✅ AI models work automatically when deployed!

## Summary

**TL;DR**:
- **Production**: Works automatically once deployed to Cloudflare - no extra setup!
- **Local Dev**: Need Account ID + API Token in `.env.local`
- **Models**: Qwen 2.5 Coder for Three.js, BGE for search, Llama 2 for summaries
