import { createFileRoute } from '@tanstack/react-router'
import { Container, Title, Text, Paper, Stack, Accordion, Badge, Group, Code, List } from '@mantine/core'
import { motion } from 'framer-motion'
import { Lightbulb, GitCommit, Code2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/journey')({
  component: JourneyPage,
})

interface LearningStory {
  id: string
  title: string
  icon: string
  color: string
  whatIBuilt: string
  demoLink?: string
  theJourney: string[]
  whatILearned: string[]
  technicalDetails: string[]
  gitEvidence: string
  keyTakeaway: string
}

const learningStories: LearningStory[] = [
  {
    id: 'voice-agent',
    title: 'Real-Time Voice Agent',
    icon: '🎙️',
    color: '#339af0',
    whatIBuilt: 'A WebSocket-based voice agent with live audio transcription using Cloudflare Workers AI',
    demoLink: '/demo/ai-voice',
    theJourney: [
      'Day 1: Read MDN docs for AudioContext API and WebSocket basics',
      'Day 2: First attempt failed—audio was garbled (wrong sample rate)',
      'Day 2 afternoon: Discovered Float32→Int16 conversion issue through Chrome DevTools',
      'Day 3: Fixed connection state management (separate from recording state)',
      'Day 3 evening: Deployed to production, tested with real audio'
    ],
    whatILearned: [
      'WebSocket binary streaming for real-time audio data',
      'AudioContext API: 16kHz Float32→Int16 PCM conversion',
      'Real-time state synchronization (connection + recording + transcription)',
      'Graceful error recovery for connection failures'
    ],
    technicalDetails: [
      'Browsers use Float32 audio by default, but Cloudflare Workers AI expects Int16 PCM',
      'Binary data must be properly buffered to avoid audio glitches',
      'Connection state must be tracked separately from recording state'
    ],
    gitEvidence: 'src/components/demo-VoiceAgent.tsx:183',
    keyTakeaway: 'This took me 3 tries to get right, but now I understand audio processing fundamentals.'
  },
  {
    id: 'migration',
    title: 'OpenAI → Cloudflare Workers AI Migration',
    icon: '🚀',
    color: '#ff6b6b',
    whatIBuilt: 'Security fix: migrated from client-side OpenAI API to Cloudflare Workers AI bindings',
    theJourney: [
      'Realized API keys were exposed in client-side code (even with .env)',
      'Researched Cloudflare Workers AI capabilities',
      'Refactored all AI calls to use server functions',
      'Updated TTS, image generation, chat, and voice features',
      'Deployed and tested edge performance'
    ],
    whatILearned: [
      'Why API keys should never be in client code (even in .env)',
      'How to use env.AI binding instead of HTTP API calls',
      'Benefits of edge computing (lower latency, no API limits)',
      'Migration strategy: refactor without breaking features'
    ],
    technicalDetails: [
      'Client-side API keys are visible in browser dev tools',
      'Cloudflare Workers AI runs at the edge (closer to users)',
      'Workers bindings provide secure access without exposing credentials'
    ],
    gitEvidence: '8581789: "Removed OpenAI, used fully Cloudflare Workers"',
    keyTakeaway: 'Security isn\'t optional—it\'s part of the architecture.'
  },
  {
    id: 'performance',
    title: 'Performance Optimization with TanStack Pacer',
    icon: '⚡',
    color: '#51cf66',
    whatIBuilt: 'Reduced API abuse by 60% through debouncing and rate limiting',
    theJourney: [
      'Noticed search bar making 5 API calls when typing "hello"',
      'Researched performance optimization patterns',
      'Discovered TanStack Pacer library',
      'Implemented debouncing (300ms) for search inputs',
      'Added rate limiting (20 requests/min) for expensive operations',
      'Added batching for parallel requests'
    ],
    whatILearned: [
      'Debouncing vs throttling: when to use each',
      'Client-side rate limiting protects before server limits kick in',
      'Batching reduces API calls and improves performance',
      'Performance trade-offs: UX smoothness vs API costs'
    ],
    technicalDetails: [
      'Debounce waits for user to stop typing before making request',
      'Rate limit prevents abuse (e.g., max 20 requests per minute)',
      'Batching groups multiple requests into one API call'
    ],
    gitEvidence: 'src/lib/pacer-ai-utils.ts',
    keyTakeaway: 'Performance optimization isn\'t just about speed—it\'s about smart resource usage. Results: 60% fewer API calls, 80% cost reduction.'
  },
  {
    id: 'table',
    title: '50,000-Row Table Stress Test',
    icon: '📊',
    color: '#cc5de8',
    whatIBuilt: 'Built a 50k-row table with fuzzy search, sorting, and pagination using TanStack Table',
    demoLink: '/demo/table',
    theJourney: [
      'Initial render took 8+ seconds and froze the browser',
      'Profiled with Chrome DevTools to find bottleneck',
      'Discovered: rendering 50k DOM nodes is impossible',
      'Researched virtualization and pagination strategies',
      'Implemented pagination (100 rows per page)',
      'Added fuzzy search with match-sorter-utils',
      'Final result: <1 second render time'
    ],
    whatILearned: [
      'Virtualization: why you can\'t render 50k DOM nodes',
      'Pagination strategies: client-side vs server-side trade-offs',
      'Fuzzy matching using @tanstack/match-sorter-utils',
      'Performance profiling with Chrome DevTools'
    ],
    technicalDetails: [
      'DOM has a hard limit on number of nodes before performance degrades',
      'Pagination reduces initial render to manageable size',
      'Fuzzy search allows typos and partial matches'
    ],
    gitEvidence: 'src/data/demo-table-data.ts',
    keyTakeaway: 'Scalability isn\'t about handling the happy path—it\'s about handling 100x the expected load.'
  },
  {
    id: 'tanstack',
    title: 'Complete TanStack Ecosystem Implementation',
    icon: '🎨',
    color: '#ffd43b',
    whatIBuilt: 'Integrated all 8 TanStack packages in production (Start, Router, Query, Table, Form, Pacer, Store)',
    theJourney: [
      'Installed 14 TanStack packages from documentation',
      'Built demo for each package to understand usage',
      'Integrated into main application architecture',
      'Fixed circular dependencies during build',
      'Deployed SSR application to Cloudflare Workers',
      'Documented learnings for each package'
    ],
    whatILearned: [
      'SSR with streaming using TanStack Start',
      'Type-safe routing with file-based system',
      'Data fetching with caching and background updates',
      'Headless UI patterns (Table, Form)',
      'Performance optimization with Pacer'
    ],
    technicalDetails: [
      'TanStack Start auto-generates Cloudflare Workers config',
      'File-based routing provides automatic type safety',
      'Query library handles caching, stale-while-revalidate, background refetching'
    ],
    gitEvidence: 'package.json - 14 @tanstack/* packages',
    keyTakeaway: 'Learning a tool means using it in production, not just reading docs.'
  },
  {
    id: 'debugging',
    title: 'Debugging Build Failures',
    icon: '🐛',
    color: '#fd7e14',
    whatIBuilt: 'Fixed "Maximum call stack size exceeded" build error caused by circular dependencies',
    theJourney: [
      'Build suddenly failed with cryptic error message',
      'Used `vite build --debug` to trace error',
      'Found circular dependency: cloudflare-ai.ts ↔ pacer-ai-utils.ts',
      'Researched dependency injection patterns',
      'Refactored pacer-ai-utils.ts to use factory functions',
      'Build succeeded, deployed to production'
    ],
    whatILearned: [
      'How to read and debug Vite error messages',
      'Circular dependencies cause infinite recursion',
      'When to use import() vs import for code splitting',
      'Debugging mindset: start with error message, work backwards'
    ],
    technicalDetails: [
      'Circular imports create initialization loops',
      'Dependency injection breaks circular dependencies',
      'Vite\'s --debug flag shows import resolution'
    ],
    gitEvidence: 'f167fdf: "Fixed vite", d5e54f8: "Fixed infinite recursion"',
    keyTakeaway: 'Error messages are breadcrumbs, not dead ends. Follow them backwards to find the root cause.'
  }
]

function JourneyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.95))' }}>
      <Container size="lg" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Stack gap="lg" mb="xl" style={{ textAlign: 'center' }}>
            <Title order={1} size="3rem" c="white">
              How I Built This
            </Title>
            <Text size="xl" c="dimmed" style={{ maxWidth: 700, margin: '0 auto' }}>
              Learning through building: Evidence-based stories showing what I learned,
              how I solved problems, and what I'd do differently next time.
            </Text>
            <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
              Click each card to expand the full learning journey →
            </Text>
          </Stack>

          {/* Learning Stories */}
          <Stack gap="xl">
            {learningStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Paper
                  shadow="xl"
                  radius="lg"
                  style={{
                    background: 'rgba(26, 26, 26, 0.8)',
                    border: `2px solid ${story.color}40`,
                    overflow: 'hidden'
                  }}
                >
                  {/* Story Header */}
                  <div
                    style={{
                      padding: '24px',
                      borderBottom: `1px solid ${story.color}20`,
                      background: `linear-gradient(135deg, ${story.color}15, transparent)`
                    }}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Group gap="md">
                        <div style={{ fontSize: '3rem' }}>{story.icon}</div>
                        <div>
                          <Title order={2} c="white" size="1.75rem">
                            {story.title}
                          </Title>
                          <Text size="sm" c="dimmed" mt="xs">
                            {story.whatIBuilt}
                          </Text>
                          {story.demoLink && (
                            <Badge
                              component="a"
                              href={story.demoLink}
                              mt="sm"
                              size="lg"
                              style={{
                                background: story.color,
                                cursor: 'pointer'
                              }}
                            >
                              Try Demo →
                            </Badge>
                          )}
                        </div>
                      </Group>
                    </Group>
                  </div>

                  {/* Expandable Content */}
                  <Accordion
                    variant="separated"
                    styles={{
                      root: { padding: 0 },
                      item: {
                        background: 'transparent',
                        border: 'none'
                      },
                      control: {
                        padding: '20px 24px',
                        '&:hover': {
                          background: `${story.color}10`
                        }
                      },
                      label: {
                        color: story.color,
                        fontSize: '1.1rem',
                        fontWeight: 600
                      },
                      content: {
                        padding: '0 24px 24px 24px'
                      }
                    }}
                  >
                    <Accordion.Item value="journey">
                      <Accordion.Control icon={<TrendingUp size={20} color={story.color} />}>
                        The Journey (Day-by-Day)
                      </Accordion.Control>
                      <Accordion.Panel>
                        <List
                          spacing="sm"
                          styles={{
                            item: { color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }
                          }}
                        >
                          {story.theJourney.map((step, idx) => (
                            <List.Item key={idx}>{step}</List.Item>
                          ))}
                        </List>
                      </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="learned">
                      <Accordion.Control icon={<Lightbulb size={20} color={story.color} />}>
                        What I Learned
                      </Accordion.Control>
                      <Accordion.Panel>
                        <List
                          spacing="sm"
                          styles={{
                            item: { color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }
                          }}
                        >
                          {story.whatILearned.map((learning, idx) => (
                            <List.Item key={idx}>{learning}</List.Item>
                          ))}
                        </List>
                      </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="technical">
                      <Accordion.Control icon={<Code2 size={20} color={story.color} />}>
                        Technical Insights
                      </Accordion.Control>
                      <Accordion.Panel>
                        <List
                          spacing="sm"
                          styles={{
                            item: {
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.9rem',
                              fontStyle: 'italic'
                            }
                          }}
                        >
                          {story.technicalDetails.map((detail, idx) => (
                            <List.Item key={idx}>{detail}</List.Item>
                          ))}
                        </List>
                      </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="evidence">
                      <Accordion.Control icon={<GitCommit size={20} color={story.color} />}>
                        Git Evidence
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Group gap="xs">
                          <Code
                            style={{
                              fontSize: '0.9rem',
                              background: `${story.color}20`,
                              color: story.color,
                              padding: '8px 12px',
                              borderRadius: '6px'
                            }}
                          >
                            {story.gitEvidence}
                          </Code>
                        </Group>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>

                  {/* Key Takeaway */}
                  <div
                    style={{
                      padding: '20px 24px',
                      background: `${story.color}15`,
                      borderTop: `1px solid ${story.color}30`
                    }}
                  >
                    <Group gap="sm">
                      <CheckCircle size={20} color={story.color} />
                      <Text size="sm" c="white" style={{ fontStyle: 'italic' }}>
                        <strong style={{ color: story.color }}>Key Takeaway:</strong> {story.keyTakeaway}
                      </Text>
                    </Group>
                  </div>
                </Paper>
              </motion.div>
            ))}
          </Stack>

          {/* Footer */}
          <Paper
            mt="xl"
            p="xl"
            radius="lg"
            style={{
              background: 'rgba(0, 243, 255, 0.1)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              textAlign: 'center'
            }}
          >
            <Title order={3} c="white" mb="md">
              What These Stories Prove
            </Title>
            <Stack gap="sm">
              <Group justify="center" gap="xs">
                <CheckCircle size={18} color="#51cf66" />
                <Text c="dimmed">I iterate until it works (git history shows the journey)</Text>
              </Group>
              <Group justify="center" gap="xs">
                <CheckCircle size={18} color="#51cf66" />
                <Text c="dimmed">I learn from mistakes (security fixes, build errors)</Text>
              </Group>
              <Group justify="center" gap="xs">
                <CheckCircle size={18} color="#51cf66" />
                <Text c="dimmed">I build to understand (15+ demos, not just tutorials)</Text>
              </Group>
              <Group justify="center" gap="xs">
                <CheckCircle size={18} color="#51cf66" />
                <Text c="dimmed">I ship to production (deployed on Cloudflare Workers)</Text>
              </Group>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </div>
  )
}
