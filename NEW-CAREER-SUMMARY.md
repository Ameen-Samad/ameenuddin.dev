# New Career Summary (Fast Learner with Proof)

Replace the current "Career Summary" section in `src/routes/index-resume.tsx` (lines 38-71) with this:

```tsx
<Paper shadow="lg" p="xl" radius="md" className="bg-white/50 backdrop-blur-sm">
  <Stack gap="md">
    <Title order={2} className="text-2xl text-gray-900">
      Career Summary
    </Title>
    <p className="text-gray-700 leading-relaxed mb-4">
      <strong className="text-blue-600">Fast learner who builds to understand.</strong>{" "}
      I don't claim expertise—I show proof through working code. This portfolio contains{" "}
      <strong className="text-purple-600">15+ live demos</strong> and a git history of{" "}
      <strong className="text-green-600">30+ commits</strong> showing real problem-solving.
    </p>
    <p className="text-gray-700 leading-relaxed mb-4">
      Currently pursuing a Diploma in IT at Ngee Ann Polytechnic (Year 2), I learn by implementing:
      built 5 AI-powered demos (voice agent with WebSocket streaming, text-to-speech, image generation,
      chat, structured output), deployed to Cloudflare Workers with D1 database and KV cache, and
      integrated the complete TanStack ecosystem (Start, Router, Query, Table, Form, Pacer, Store).
    </p>
    <p className="text-gray-700 leading-relaxed">
      My git history tells the story: <code className="bg-gray-100 px-2 py-1 rounded">8581789:
      "Removed OpenAI, used fully Cloudflare Workers"</code> shows I migrated from external APIs
      to Workers AI for security and performance. Multiple "Fix X" commits show I iterate until
      it works. <strong className="text-blue-600">I learn fast, apply immediately, and prove
      it with deployments.</strong>
    </p>
    <p className="text-gray-700 leading-relaxed">
      <a
        href="/demo/ai-voice"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        See the demos →
      </a>
    </p>
  </Stack>
</Paper>
```

## Why This Works

| Old Claim | New Proof |
|-----------|-----------|
| "100x productivity" | "15+ live demos with 30+ commits" |
| "I master AI tools" | "Built 5 AI demos you can interact with" |
| "Unique advantage" | "Git history shows migration from OpenAI to Workers AI" |
| Generic skills | "WebSocket streaming, AudioContext processing, SSR deployment" |

## Tone Shift

**Before**: "I'm an expert, trust me"
**After**: "Here's what I built, see for yourself"

The new summary:
- ✅ Links to actual demos (proof)
- ✅ References git commits (shows iteration)
- ✅ Specific technologies (not buzzwords)
- ✅ Honest about learning journey
- ✅ Shows problem-solving (OpenAI → Workers migration)
