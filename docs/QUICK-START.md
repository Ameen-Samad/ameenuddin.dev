# Quick Start Guide - Cloudflare Workers AI

## Step 1: Install Dependencies

```bash
npm install lru-cache @types/lru-cache
```

## Step 2: Set Up Cloudflare Account

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Create account or sign in
3. Navigate to **Workers & Pages**
4. Enable **Workers AI** (it's free!)

## Step 3: Create KV Namespace

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create "PROJECT_CACHE"

# Save the ID for wrangler.toml
```

## Step 4: Create D1 Database

```bash
# Create D1 database
wrangler d1 create PROJECT_DB

# Save the binding name for wrangler.toml
```

## Step 5: Configure wrangler.toml

Create or update `wrangler.toml`:

```toml
name = "portfolio"
main = "src/entry.worker.ts"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "<YOUR_KV_NAMESPACE_ID>"

[[env.production.d1_databases]]
binding = "DB"
database_name = "PROJECT_DB"
database_id = "<YOUR_D1_DATABASE_ID>"

[env.development]
vars = { ENVIRONMENT = "development" }

[[env.development.kv_namespaces]]
binding = "CACHE"
id = "<YOUR_KV_NAMESPACE_ID>"

[[env.development.d1_databases]]
binding = "DB"
database_name = "PROJECT_DB"
database_id = "<YOUR_D1_DATABASE_ID>"
```

## Step 6: Deploy Workers

```bash
# Deploy to Cloudflare
wrangler deploy

# Or deploy specific route
wrangler deploy src/routes/api/workers/embeddings.tsx
```

## Step 7: Update Environment Variables

In your project's `.env` file:

```env
VITE_CLOUDFLARE_ACCOUNT_ID=your-account-id
```

## Step 8: Test AI Features

### Test Search
1. Go to homepage
2. Type "AI projects with React" in search
3. Click "AI Search" button
4. Should see relevant projects

### Test Recommendations
1. Scroll down to "Trending Projects"
2. Should see featured projects
3. Click any project card
4. AI Assistant should appear

### Test Chat Assistant
1. Click any project card
2. Click "How do I set up this project?"
3. AI should provide setup instructions
4. Try "What technologies are used?"

## Step 9: Monitor Usage

1. Go to Cloudflare Dashboard
2. Navigate to **Workers & Pages**
3. Click your worker
4. View analytics:
   - Request count
   - Errors
   - CPU time
   - Memory usage

## Step 10: Optimize (Optional)

### Enable Caching
Already implemented! LRU cache stores:
- Embeddings (24h TTL)
- Summaries (7d TTL)
- Chat responses (1h TTL)

### Set Up Alerts
1. Cloudflare Dashboard → Workers
2. Click worker
3. Set up alerts for:
   - CPU time > 100ms
   - Memory > 128MB
   - Error rate > 1%

### Test Performance

```bash
# Test embeddings endpoint
time curl -X POST http://localhost:3000/api/workers/embeddings \
  -H "Content-Type: application/json" \
  -d '{"text": "AI projects"}'

# Should complete in < 500ms
```

## Troubleshooting

### "AI features not working"
1. Check browser console for errors
2. Verify API routes are accessible
3. Check Cloudflare Workers logs
4. Ensure KV/D1 bindings are correct

### "Slow responses"
1. Check if cache is being used
2. Reduce batch size
3. Use faster model (LLaMA instead of Mistral)
4. Check Cloudflare Worker CPU limits

### "No search results"
1. Try different search terms
2. Check project data exists
3. Verify embeddings are generated
4. Test embeddings endpoint directly

## Next Steps

After completing these steps:

1. ✅ AI search is working
2. ✅ Recommendations are showing
3. ✅ Chat assistant is functional
4. ✅ All API endpoints deployed
5. ✅ Caching is active
6. ✅ Monitoring is set up

**You're ready to go! 🚀**

## Resources

- [Cloudflare Workers AI Docs](https://developers.cloudflare.com/workers-ai)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [Full Documentation](./CLOUDFLARE-AI.md)

---

**Questions?** Check the [Implementation Summary](./IMPLEMENTATION-SUMMARY.md) or [Cloudflare AI Docs](./CLOUDFLARE-AI.md)
