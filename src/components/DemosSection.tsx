import { Container, SimpleGrid, Title, Text, Paper, Badge, Group, Stack } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ImageIcon,
  Volume2,
  Mic,
  FileCode,
  MessageSquare,
  ArrowRight
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
}

const demos: Demo[] = [
  {
    id: 'ai-image',
    title: 'Image Generation',
    description: 'Generate stunning images from text prompts using Stable Diffusion XL Lightning',
    icon: <ImageIcon className="w-8 h-8" />,
    path: '/demo/ai-image',
    badge: 'Image AI',
    color: '#ff6b6b',
    features: ['Multiple sizes', 'Batch generation', 'Instant download'],
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
  },
  {
    id: 'ai-voice',
    title: 'Voice Agent',
    description: 'Real-time speech-to-text transcription using WebSocket streaming',
    icon: <Mic className="w-8 h-8" />,
    path: '/demo/ai-voice',
    badge: 'Live AI',
    color: '#339af0',
    features: ['Real-time', 'WebSocket', 'Live transcription'],
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
              AI Demos
            </Title>
            <Text size="lg" c="dimmed" style={{ maxWidth: 600, margin: '0 auto' }}>
              Explore live demos showcasing Cloudflare Workers AI capabilities
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
