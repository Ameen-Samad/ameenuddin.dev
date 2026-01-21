# Cloudflare Workers AI Integration

This project integrates Cloudflare Workers AI for enhanced AI-powered features in the portfolio.

## Features

### AI-Powered Search
- Semantic search using vector embeddings
- Natural language query parsing
- Real-time search suggestions
- Intelligent filtering by technology, category, and complexity

### Project Recommendations
- Trending projects based on stars and views
- Similar projects using vector similarity
- Personalized recommendations based on user interests

### AI-Generated Summaries
- Automatic project summaries
- Key feature extraction
- Complexity assessment
- Learning path suggestions

### Smart Tag Suggestions
- Automatic tag recommendations for new projects
- Technology detection
- Category classification

### AI Chat Assistant
- Project-specific chatbot
- Quick question answering
- Code explanation
- Setup and contribution guidance

## API Endpoints

### POST `/api/workers/embeddings`
Generate vector embeddings for semantic search.

**Request:**
```json
{
  "text": "AI projects with React",
  "model": "@cf/baai/bge-base-en-v1.5"
}
```

**Response:**
```json
{
  "embedding": [0.1, 0.2, 0.3, ...]
}
```

### POST `/api/workers/search`
Perform semantic search across projects.

**Request:**
```json
{
  "embedding": [0.1, 0.2, 0.3, ...],
  "limit": 10
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "tetris-ai",
      "distance": 0.23,
      ...
    }
  ]
}
```

### POST `/api/workers/summary`
Generate AI summary for a project.

**Request:**
```json
{
  "project": {
    "id": "tetris-ai",
    "title": "Tetris with AI Agent",
    "description": "...",
    "tags": ["Phaser", "AI", ...],
    "techStack": {...}
  },
  "model": "@cf/meta/llama-2-7b-chat-int8"
}
```

**Response:**
```json
{
  "summary": "...",
  "keyFeatures": ["...", "...", "..."],
  "complexity": "medium",
  "learningPath": ["...", "..."]
}
```

### POST `/api/workers/tags`
Suggest tags for a project based on description.

**Request:**
```json
{
  "description": "A Tetris game with AI agent...",
  "model": "@cf/mistral/mistral-7b-instruct-v0.1"
}
```

**Response:**
```json
{
  "tags": ["Phaser", "AI", "JavaScript", "Reinforcement Learning"]
}
```

### POST `/api/workers/parse-query`
Parse natural language search query.

**Request:**
```json
{
  "query": "Show me React AI projects that are beginner-friendly",
  "model": "@cf/meta/llama-2-7b-chat-int8"
}
```

**Response:**
```json
{
  "parsed": {
    "technologies": ["react", "ai"],
    "categories": ["ai-ml", "web-apps"],
    "complexity": "beginner"
  }
}
```

### POST `/api/workers/chat`
Chat with AI assistant about a specific project.

**Request:**
```json
{
  "projectId": "tetris-ai",
  "message": "How do I set up this project?",
  "history": [...],
  "model": "@cf/meta/llama-2-7b-chat-int8"
}
```

**Response:**
```json
{
  "response": "To set up Tetris with AI Agent, you'll need..."
}
```

### POST `/api/workers/recommendations`
Get project recommendations.

**Request:**
```json
{
  "projectId": "tetris-ai",
  "userInterests": ["AI", "React", "Three.js"],
  "limit": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "ai-chatbot",
      "distance": 0.18,
      ...
    }
  ]
}
```

### POST `/api/workers/categorize`
Auto-categorize a project.

**Request:**
```json
{
  "project": {
    "title": "...",
    "description": "...",
    "tags": [...]
  },
  "model": "@cf/meta/llama-2-7b-chat-int8"
}
```

**Response:**
```json
{
  "category": "ai-ml"
}
```

## Components

### AISearchBar
Enhanced search component with AI suggestions and semantic search.

```tsx
import { AISearchBar } from "~/components/AISearchBar";

<AISearchBar
  onSearch={(query) => console.log(query)}
  placeholder="Search projects..."
  showSuggestions
/>
```

### AIRecommendations
Dynamic recommendation component for trending, similar, or personalized projects.

```tsx
import { AIRecommendations } from "~/components/AIRecommendations";

<AIRecommendations
  type="trending"
  projects={projects}
  limit={4}
/>

<AIRecommendations
  type="similar"
  projectId="tetris-ai"
  projects={projects}
  limit={3}
/>

<AIRecommendations
  type="personalized"
  userInterests={["AI", "React"]}
  projects={projects}
  limit={5}
/>
```

### ProjectAIAssistant
Floating chat assistant for specific projects.

```tsx
import { ProjectAIAssistant } from "~/components/ProjectAIAssistant";

<ProjectAIAssistant
  projectId="tetris-ai"
  projectTitle="Tetris with AI Agent"
  projectDescription="Classic Tetris game featuring..."
  projectTags={["Phaser", "AI", "JavaScript"]}
/>
```

## Cloudflare Workers AI Models Used

### Embeddings
- **@cf/baai/bge-base-en-v1.5** - High-quality text embeddings for semantic search
- 768-dimensional vectors
- Optimized for English text similarity

### Language Models
- **@cf/meta/llama-2-7b-chat-int8** - Fast, efficient chat model
  - Quantized for faster inference
  - Good for general chatbot use cases
  - ~2-3s response time
  
- **@cf/mistral/mistral-7b-instruct-v0.1** - High-quality instruction-following model
  - Better at following complex instructions
  - Good for code generation and explanations
  - ~2-4s response time

## Caching Strategy

### Client-Side Caching (LRU Cache)
- **Embeddings Cache**: 1000 items, 24-hour TTL
- **Summary Cache**: 500 items, 7-day TTL
- **Chat Cache**: 500 items, 1-hour TTL

### Server-Side Caching (Cloudflare KV)
- Project metadata: Cached for 1 hour
- Search results: Cached for 15 minutes
- AI responses: Cached for 1 hour

### Cache Invalidation
- Automatic expiration via TTL
- Manual cache clear via `clearCache()` function
- Cache key prefixing for different data types

## Performance

### Expected Latencies
- Embedding generation: ~200-300ms
- Semantic search: ~100-200ms
- Summary generation: ~1-2s
- Chat response: ~2-3s
- Tag suggestions: ~500ms

### Optimization Tips
1. **Enable caching**: All AI responses are cached
2. **Debounce search**: 300ms debounce on search input
3. **Lazy load components**: AI components load on-demand
4. **Use semantic search**: More accurate than keyword search
5. **Limit results**: Default limits prevent excessive processing

## Security & Privacy

### Data Handling
- All API calls are server-side (no direct API keys to client)
- User queries are anonymized before processing
- No sensitive data sent to external AI services
- All data stays within Cloudflare network

### Rate Limiting
- Client-side: 100 requests/minute
- Worker-level: Automatic DDoS protection
- KV/D1: Built-in Cloudflare limits

### Best Practices
- Validate all inputs before AI processing
- Sanitize AI responses before display
- Implement fallback for AI failures
- Monitor API usage and costs

## Troubleshooting

### AI Features Not Working
1. Check Cloudflare Workers AI is enabled in account
2. Verify API bindings in `wrangler.toml`
3. Check browser console for errors
4. Test endpoints individually

### Slow Responses
1. Check if cache is working (should see cache hits)
2. Reduce request complexity
3. Check Cloudflare Dashboard for Worker performance
4. Consider using faster model (LLaMA 2 instead of Mistral)

### Poor Search Results
1. Clear cache and retry
2. Check project embeddings are up to date
3. Verify embedding similarity threshold
4. Try different search terms

## Future Enhancements

- [ ] Add voice search using Web Speech API
- [ ] Implement multi-language support
- [ ] Add image recognition for project screenshots
- [ ] Create collaborative filtering based on user behavior
- [ ] Add A/B testing for AI features
- [ ] Implement fine-tuned models for specific tasks
- [ ] Add code review AI integration
- [ ] Create project comparison AI analysis

## Cost & Limits

### Cloudflare Workers AI Free Tier
- **Embeddings**: Unlimited (within Worker limits)
- **LLaMA 2**: 10,000 tokens/day
- **Mistral**: 10,000 tokens/day
- **KV Storage**: 100,000 reads/day, 1,000 writes/day
- **D1 Database**: 5,000 reads/day, 1,000 writes/day

### Estimated Costs (Paid Tier)
- LLaMA 2: $0.0001/1K tokens
- Mistral: $0.0002/1K tokens
- KV: $0.50/million reads, $5.00/million writes
- D1: $0.001/1K reads, $0.003/1K writes

### Cost Optimization
1. Cache aggressively to reduce AI calls
2. Use smaller models when possible
3. Batch requests where feasible
4. Monitor usage via Cloudflare Dashboard
5. Set up alerts for unusual usage

## References

- [Cloudflare Workers AI Docs](https://developers.cloudflare.com/workers-ai)
- [BGE Embeddings Model](https://huggingface.co/BAAI/bge-base-en-v1.5)
- [LLaMA 2 Chat](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf)
- [Mistral 7B Instruct](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1)
