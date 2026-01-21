# Cloudflare CI/CD Setup

## Issue

The Cloudflare automatic deployment was failing because:
- The build command was set to `bun run deploy:all`
- This tries to deploy 3 workers: main app + 2 WebSocket workers
- Cloudflare CI expects to deploy only ONE worker (`ameenuddin`)
- WebSocket workers have different names, causing route conflicts

## Solution

### Update Cloudflare Pages/Workers Build Settings

Go to your Cloudflare dashboard and update the build configuration:

**For Cloudflare Pages:**
1. Go to Workers & Pages → ameenuddin → Settings → Builds & deployments
2. Update the build command to: `bun run deploy:ci`
3. This will only deploy the main app worker

**Build Command:** `bun run deploy:ci`
**Build Output Directory:** `dist`

### WebSocket Workers Deployment

The WebSocket workers should be deployed **separately** (not via automatic CI):

```bash
# Deploy WebSocket workers manually when needed
bun run deploy:websockets

# Or deploy individually
bun run deploy:transcription
bun run deploy:tts
```

## Deployment Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `bun run deploy` | Deploy main app only | Cloudflare CI (automatic) |
| `bun run deploy:ci` | Same as `deploy` (CI-safe) | Cloudflare CI (automatic) |
| `bun run deploy:websockets` | Deploy both WebSocket workers | Manual, after code changes |
| `bun run deploy:all` | Deploy everything | Local full deployment |

## Complete Deployment Process

1. **Automatic (on git push):**
   - Cloudflare CI runs `bun run deploy:ci`
   - Only deploys main app worker

2. **Manual (when WebSocket code changes):**
   ```bash
   bun run deploy:websockets
   ```

3. **Local full deployment:**
   ```bash
   bun run deploy:all
   ```

## GitHub Actions (Optional Future Enhancement)

If you want fully automatic deployments for all workers, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy All Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Deploy All Workers
        run: bun run deploy:all
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

Then add these secrets to GitHub:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
