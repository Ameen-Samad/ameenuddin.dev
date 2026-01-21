import { Container, SimpleGrid, Title, Text, Paper, Badge, Group, Stack, Accordion, List, Code } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ImageIcon,
  Volume2,
  Mic,
  FileCode,
  MessageSquare,
  ArrowRight,
  Lightbulb,
  GitCommit,
  Code2,
  Database,
  Table,
  FormInput,
  Server,
  Zap,
  Globe,
  FileText
} from 'lucide-react'

interface Demo {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  path: string
  badge: string
  color: string
  features: string[]
  learnings: string[]
  gitEvidence?: string
  technicalHighlights?: string[]
}

const demos: Demo[] = [
  {
    id: 'ai-voice',
    title: 'Voice Agent',
    description: 'Real-time speech-to-text transcription using WebSocket streaming',
    icon: <Mic className="w-8 h-8" />,
    path: '/demo/ai-voice',
    badge: 'Live AI',
    color: '#339af0',
    features: ['Real-time', 'WebSocket', 'Live transcription'],
    learnings: [
      'WebSocket binary streaming for real-time audio data',
      'AudioContext API: 16kHz Float32→Int16 PCM conversion',
      'Real-time state synchronization (connection + recording + transcription)',
      'Graceful error recovery for connection failures',
    ],
    technicalHighlights: [
      'Browsers use Float32 audio by default, but Cloudflare Workers AI expects Int16 PCM',
      'Binary data must be properly buffered to avoid audio glitches',
      'Connection state must be tracked separately from recording state',
    ],
    gitEvidence: 'src/components/demo-VoiceAgent.tsx:183',
  },
  {
    id: 'ai-image',
    title: 'Image Generation',
    description: 'Generate stunning images from text prompts using Stable Diffusion XL Lightning',
    icon: <ImageIcon className="w-8 h-8" />,
    path: '/demo/ai-image',
    badge: 'Image AI',
    color: '#ff6b6b',
    features: ['Multiple sizes', 'Batch generation', 'Instant download'],
    learnings: [
      'Batch processing with Promise.all for parallel image generation',
      'Base64 image handling and rendering in React',
      'Progress tracking for long-running AI operations',
      'Error handling for generation failures',
    ],
    technicalHighlights: [
      'Generate 1-4 images in parallel using Cloudflare Workers AI',
      'Handle loading states during generation (15-30 seconds per image)',
      'Convert base64 responses to downloadable files',
    ],
    gitEvidence: 'src/routes/demo/ai-image.tsx',
  },
  {
    id: 'ai-tts',
    title: 'Text-to-Speech',
    description: 'Convert text to natural-sounding speech with Deepgram Aura voices',
    icon: <Volume2 className="w-8 h-8" />,
    path: '/demo/ai-tts',
    badge: 'Voice AI',
    color: '#51cf66',
    features: ['12 voices', 'Live playback', 'MP3 download'],
    learnings: [
      'Deepgram Aura API integration for high-quality TTS',
      'Audio file generation and browser playback',
      'File download handling for generated audio',
      'Voice selection and parameter tuning',
    ],
    technicalHighlights: [
      '12 different voice options with natural intonation',
      'Live audio playback with HTML5 Audio API',
      'Generate downloadable MP3 files',
    ],
    gitEvidence: '8581789: "Removed OpenAI, used fully Cloudflare Workers"',
  },
  {
    id: 'ai-chat',
    title: 'AI Chat',
    description: 'Interactive chat with streaming responses and context awareness',
    icon: <MessageSquare className="w-8 h-8" />,
    path: '/demo/ai-chat',
    badge: 'Chat AI',
    color: '#ffd43b',
    features: ['Streaming', 'Context aware', 'Tool calling'],
    learnings: [
      'Server-Sent Events (SSE) for streaming AI responses',
      'Custom ReadableStream parsing for chunked data',
      'Context management for multi-turn conversations',
      'Real-time UI updates during streaming',
    ],
    technicalHighlights: [
      'SSE allows server to push updates without polling',
      'Stream responses word-by-word for better UX',
      'Maintain conversation context across multiple messages',
    ],
    gitEvidence: 'src/lib/demo-chat-hook.ts:132 lines',
  },
  {
    id: 'ai-structured',
    title: 'Structured Output',
    description: 'Generate structured recipe data with type-safe validation',
    icon: <FileCode className="w-8 h-8" />,
    path: '/demo/ai-structured',
    badge: 'Data AI',
    color: '#cc5de8',
    features: ['JSON output', 'Zod validation', 'Type-safe'],
    learnings: [
      'Forcing LLMs to return structured JSON with Zod schemas',
      'Type-safe parsing and validation of AI outputs',
      'Handling parsing errors gracefully',
      'Schema design for reliable AI responses',
    ],
    technicalHighlights: [
      'Zod provides runtime validation for AI-generated data',
      'Type inference ensures compile-time safety',
      'Structured outputs are more reliable than free-form text',
    ],
    gitEvidence: 'src/routes/demo/ai-structured.tsx',
  },
  {
    id: 'tanstack-query',
    title: 'TanStack Query',
    description: 'Async state management with caching, background updates, and automatic refetching',
    icon: <Database className="w-8 h-8" />,
    path: '/demo/tanstack-query',
    badge: 'TanStack',
    color: '#ff4154',
    features: ['Caching', 'Auto-refetch', 'Stale-while-revalidate'],
    learnings: [
      'useQuery hook for data fetching with automatic caching',
      'Background refetching and stale-while-revalidate patterns',
      'Query invalidation and cache management',
      'Optimistic updates for better UX',
    ],
    technicalHighlights: [
      'Reduces boilerplate for async state management',
      'Automatic background updates keep data fresh',
      'Built-in loading and error states',
    ],
    gitEvidence: 'src/routes/demo/tanstack-query.tsx',
  },
  {
    id: 'store',
    title: 'TanStack Store',
    description: 'Reactive global state management with fine-grained subscriptions',
    icon: <Code2 className="w-8 h-8" />,
    path: '/demo/store',
    badge: 'TanStack',
    color: '#20c997',
    features: ['Reactive', 'Type-safe', 'Framework-agnostic'],
    learnings: [
      'Creating reactive stores with TanStack Store',
      'Fine-grained subscriptions for performance',
      'Type-safe state management patterns',
      'Integration with React components',
    ],
    technicalHighlights: [
      'Only re-renders components that use changed state slices',
      'No Context API needed for global state',
      'Works with any framework (React, Vue, Solid, etc.)',
    ],
    gitEvidence: 'src/routes/demo/store.tsx',
  },
  {
    id: 'table',
    title: 'TanStack Table',
    description: 'Headless table/datagrid with sorting, filtering, and pagination',
    icon: <Table className="w-8 h-8" />,
    path: '/demo/table',
    badge: 'TanStack',
    color: '#748ffc',
    features: ['Sorting', 'Filtering', 'Pagination'],
    learnings: [
      'Building fully type-safe tables with TanStack Table',
      'Column definitions with custom cell rendering',
      'Sorting and filtering state management',
      'Headless UI pattern: bring your own styling',
    ],
    technicalHighlights: [
      'Headless means total control over markup and styling',
      'Row/column virtualization for large datasets',
      'Full TypeScript inference for column types',
    ],
    gitEvidence: 'src/routes/demo/table.tsx',
  },
  {
    id: 'trpc-todo',
    title: 'tRPC Todo App',
    description: 'Type-safe API with tRPC + React Query integration',
    icon: <Zap className="w-8 h-8" />,
    path: '/demo/trpc-todo',
    badge: 'TanStack',
    color: '#2e9aff',
    features: ['Type-safe API', 'No codegen', 'Auto-complete'],
    learnings: [
      'Building type-safe APIs with tRPC',
      'Integrating tRPC with TanStack Query',
      'End-to-end type safety from server to client',
      'CRUD operations without REST boilerplate',
    ],
    technicalHighlights: [
      'TypeScript types shared between client and server',
      'No GraphQL schema or REST endpoints needed',
      'Automatic IDE autocomplete for API calls',
    ],
    gitEvidence: 'src/routes/demo/trpc-todo.tsx',
  },
  {
    id: 'form-simple',
    title: 'TanStack Form (Simple)',
    description: 'Type-safe form state management with validation',
    icon: <FormInput className="w-8 h-8" />,
    path: '/demo/form.simple',
    badge: 'TanStack',
    color: '#ffa94d',
    features: ['Type-safe', 'Validation', 'Error handling'],
    learnings: [
      'Building forms with TanStack Form',
      'Field-level validation with Zod',
      'Handling form submission and errors',
      'Type-safe form values throughout',
    ],
    technicalHighlights: [
      'No uncontrolled/controlled component confusion',
      'Validates on change, blur, or submit',
      'Full TypeScript inference for form values',
    ],
    gitEvidence: 'src/routes/demo/form.simple.tsx',
  },
  {
    id: 'form-address',
    title: 'TanStack Form (Address)',
    description: 'Complex form with nested fields and array validation',
    icon: <FileText className="w-8 h-8" />,
    path: '/demo/form.address',
    badge: 'TanStack',
    color: '#f783ac',
    features: ['Nested fields', 'Arrays', 'Complex validation'],
    learnings: [
      'Handling complex nested form structures',
      'Dynamic field arrays with add/remove',
      'Cross-field validation rules',
      'Form field context for nested components',
    ],
    technicalHighlights: [
      'Type-safe nested object and array fields',
      'Dynamic validation based on other field values',
      'Composable form components',
    ],
    gitEvidence: 'src/routes/demo/form.address.tsx',
  },
  {
    id: 'start-ssr-index',
    title: 'TanStack Start SSR Overview',
    description: 'Introduction to TanStack Start SSR modes and patterns',
    icon: <Server className="w-8 h-8" />,
    path: '/demo/start.ssr.index',
    badge: 'Start SSR',
    color: '#4c6ef5',
    features: ['SSR', 'Streaming', 'SEO'],
    learnings: [
      'Understanding SSR vs SPA vs data-only modes',
      'When to use each rendering mode',
      'SEO benefits of server-side rendering',
      'Performance tradeoffs of different modes',
    ],
    technicalHighlights: [
      'TanStack Start supports 3 rendering modes',
      'SSR improves initial load and SEO',
      'Streaming SSR for progressive hydration',
    ],
    gitEvidence: 'src/routes/demo/start.ssr.index.tsx',
  },
  {
    id: 'start-ssr-full',
    title: 'Full SSR Mode',
    description: 'Complete server-side rendering with streaming hydration',
    icon: <Server className="w-8 h-8" />,
    path: '/demo/start.ssr.full-ssr',
    badge: 'Start SSR',
    color: '#4263eb',
    features: ['Full SSR', 'Streaming', 'Fast FCP'],
    learnings: [
      'Implementing full server-side rendering',
      'Streaming HTML for faster first paint',
      'Handling server-only code vs client code',
      'SEO optimization with SSR',
    ],
    technicalHighlights: [
      'HTML sent from server with data pre-rendered',
      'React hydrates the server-rendered markup',
      'Fastest First Contentful Paint (FCP)',
    ],
    gitEvidence: 'src/routes/demo/start.ssr.full-ssr.tsx',
  },
  {
    id: 'start-ssr-data',
    title: 'Data-Only SSR',
    description: 'Fetch data on server, render on client',
    icon: <Database className="w-8 h-8" />,
    path: '/demo/start.ssr.data-only',
    badge: 'Start SSR',
    color: '#5c7cfa',
    features: ['Server data', 'Client render', 'Balance'],
    learnings: [
      'Fetching data on server but rendering on client',
      'When to use data-only mode over full SSR',
      'Avoiding layout shift with skeleton loaders',
      'Balancing server and client load',
    ],
    technicalHighlights: [
      'Data fetched securely on server (API keys safe)',
      'Client receives pre-loaded data and renders',
      'Good middle ground between SPA and full SSR',
    ],
    gitEvidence: 'src/routes/demo/start.ssr.data-only.tsx',
  },
  {
    id: 'start-ssr-spa',
    title: 'SPA Mode',
    description: 'Pure client-side rendering (traditional React)',
    icon: <Globe className="w-8 h-8" />,
    path: '/demo/start.ssr.spa-mode',
    badge: 'Start SSR',
    color: '#748ffc',
    features: ['Client-only', 'No SSR', 'Simple'],
    learnings: [
      'Traditional SPA mode with no SSR',
      'When to choose SPA over SSR',
      'Client-side routing and data fetching',
      'Simplicity vs performance tradeoffs',
    ],
    technicalHighlights: [
      'All rendering happens in the browser',
      'No server complexity, easier deployment',
      'Slower initial load but simpler architecture',
    ],
    gitEvidence: 'src/routes/demo/start.ssr.spa-mode.tsx',
  },
  {
    id: 'start-server-funcs',
    title: 'Server Functions',
    description: 'Call server-side functions from client components',
    icon: <Zap className="w-8 h-8" />,
    path: '/demo/start.server-funcs',
    badge: 'Start SSR',
    color: '#20c997',
    features: ['Server RPC', 'Type-safe', 'Zero API'],
    learnings: [
      'Creating server functions with createServerFn',
      'Calling server code directly from React components',
      'Type-safe RPC without REST endpoints',
      'Automatic request/response handling',
    ],
    technicalHighlights: [
      'Server functions run only on the server',
      'No need to create API routes manually',
      'Full type safety from server to client',
    ],
    gitEvidence: 'src/routes/demo/start.server-funcs.tsx',
  },
  {
    id: 'start-api-request',
    title: 'API Request Handling',
    description: 'Building API routes with TanStack Start',
    icon: <Code2 className="w-8 h-8" />,
    path: '/demo/start.api-request',
    badge: 'Start SSR',
    color: '#ff6b6b',
    features: ['REST API', 'Request/Response', 'Middleware'],
    learnings: [
      'Creating API routes with file-based routing',
      'Handling POST, GET, PUT, DELETE methods',
      'Request validation and error handling',
      'Returning JSON responses',
    ],
    technicalHighlights: [
      'File-based API routes (like Next.js)',
      'Access to Request/Response objects',
      'Can use middleware for auth, logging, etc.',
    ],
    gitEvidence: 'src/routes/demo/start.api-request.tsx',
  },
]

export function DemosSection() {
  return (
    <section id="demos" style={{ padding: '100px 0', background: 'rgba(0, 0, 0, 0.2)' }}>
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Stack gap="md" mb="xl" style={{ textAlign: 'center' }}>
            <Title order={2} c="white">
              AI Demos: What I Built & Learned
            </Title>
            <Text size="lg" c="dimmed" style={{ maxWidth: 700, margin: '0 auto' }}>
              Live demos with working code + learning stories. Each demo shows what I built,
              what I learned, and the technical challenges I solved.
            </Text>
            <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
              Click "What I Learned" to see the journey behind each implementation
            </Text>
          </Stack>

          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3 }}
            spacing="xl"
            style={{ marginTop: 40 }}
          >
            {demos.map((demo, index) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link to={demo.path} style={{ textDecoration: 'none' }}>
                  <Paper
                    p="xl"
                    radius="md"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget
                      el.style.transform = 'translateY(-8px)'
                      el.style.borderColor = demo.color
                      el.style.boxShadow = `0 8px 32px ${demo.color}40`
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget
                      el.style.transform = 'translateY(0)'
                      el.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      el.style.boxShadow = 'none'
                    }}
                  >
                    {/* Background gradient */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${demo.color}, transparent)`,
                      }}
                    />

                    <Stack gap="md">
                      {/* Icon and Badge */}
                      <Group justify="space-between" align="flex-start">
                        <div
                          style={{
                            padding: 12,
                            borderRadius: 12,
                            background: `${demo.color}20`,
                            color: demo.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {demo.icon}
                        </div>
                        <Badge
                          variant="light"
                          size="sm"
                          style={{
                            background: `${demo.color}20`,
                            color: demo.color,
                            border: `1px solid ${demo.color}40`,
                          }}
                        >
                          {demo.badge}
                        </Badge>
                      </Group>

                      {/* Title */}
                      <Title order={4} c="white" style={{ marginTop: 8 }}>
                        {demo.title}
                      </Title>

                      {/* Description */}
                      <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                        {demo.description}
                      </Text>

                      {/* Features */}
                      <Group gap="xs" mt="xs">
                        {demo.features.map((feature) => (
                          <Badge
                            key={feature}
                            size="xs"
                            variant="outline"
                            style={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            {feature}
                          </Badge>
                        ))}
                      </Group>

                      {/* What I Learned Section */}
                      <Accordion
                        variant="separated"
                        styles={{
                          root: { marginTop: 16 },
                          item: {
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          },
                          control: {
                            padding: '8px 12px',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.05)',
                            },
                          },
                          label: {
                            color: demo.color,
                            fontSize: '14px',
                            fontWeight: 600,
                          },
                          content: {
                            padding: '12px',
                            fontSize: '13px',
                          },
                        }}
                      >
                        <Accordion.Item value="learnings">
                          <Accordion.Control icon={<Lightbulb size={16} color={demo.color} />}>
                            What I Learned
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="sm">
                              <List
                                spacing="xs"
                                size="sm"
                                styles={{
                                  item: { color: 'rgba(255, 255, 255, 0.8)' },
                                }}
                              >
                                {demo.learnings.map((learning, idx) => (
                                  <List.Item key={idx}>{learning}</List.Item>
                                ))}
                              </List>

                              {demo.technicalHighlights && demo.technicalHighlights.length > 0 && (
                                <>
                                  <Text size="xs" fw={600} c="dimmed" mt="xs">
                                    <Code2 size={14} style={{ display: 'inline', marginRight: 4 }} />
                                    Technical Insights:
                                  </Text>
                                  <List
                                    spacing="xs"
                                    size="xs"
                                    styles={{
                                      item: {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontStyle: 'italic'
                                      },
                                    }}
                                  >
                                    {demo.technicalHighlights.map((highlight, idx) => (
                                      <List.Item key={idx}>{highlight}</List.Item>
                                    ))}
                                  </List>
                                </>
                              )}

                              {demo.gitEvidence && (
                                <Group gap="xs" mt="sm">
                                  <GitCommit size={14} color={demo.color} />
                                  <Text size="xs" c="dimmed">
                                    Code: <Code style={{ fontSize: '11px' }}>{demo.gitEvidence}</Code>
                                  </Text>
                                </Group>
                              )}
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>

                      {/* Arrow icon */}
                      <Group justify="flex-end" mt="md">
                        <ArrowRight
                          size={20}
                          style={{
                            color: demo.color,
                            transition: 'transform 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(4px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)'
                          }}
                        />
                      </Group>
                    </Stack>
                  </Paper>
                </Link>
              </motion.div>
            ))}
          </SimpleGrid>

          {/* Tech Stack Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            style={{ marginTop: 60 }}
          >
            <Paper
              p="xl"
              radius="md"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
              }}
            >
              <Text size="sm" c="dimmed" mb="xs">
                Powered by
              </Text>
              <Group justify="center" gap="xl">
                <Badge
                  size="lg"
                  variant="light"
                  style={{
                    background: 'rgba(255, 135, 0, 0.1)',
                    color: '#ff8700',
                    border: '1px solid rgba(255, 135, 0, 0.2)',
                  }}
                >
                  Cloudflare Workers AI
                </Badge>
                <Badge
                  size="lg"
                  variant="light"
                  style={{
                    background: 'rgba(0, 122, 255, 0.1)',
                    color: '#007aff',
                    border: '1px solid rgba(0, 122, 255, 0.2)',
                  }}
                >
                  Deepgram
                </Badge>
                <Badge
                  size="lg"
                  variant="light"
                  style={{
                    background: 'rgba(147, 51, 234, 0.1)',
                    color: '#9333ea',
                    border: '1px solid rgba(147, 51, 234, 0.2)',
                  }}
                >
                  Stable Diffusion XL
                </Badge>
              </Group>
            </Paper>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
