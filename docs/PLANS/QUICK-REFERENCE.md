# 🚀 Quick Reference - Implementation Guide

## Project Structure Overview

```
ameenuddin.dev/
├── docs/
│   └── PLANS/
│       ├── 00-master-plan.md          # Overall timeline & phases
│       ├── 01-sidebar-navigation.md     # Sidebar component detailed spec
│       └── 02-enhanced-projects-grid.md # Projects grid detailed spec
│
├── src/
│   ├── components/
│   │   ├── [NEW] Sidebar.tsx        # Main navigation
│   │   ├── [NEW] MobileNav.tsx       # Mobile drawer
│   │   ├── [NEW] ProjectHero.tsx     # Projects header
│   │   ├── [NEW] ProjectCard.tsx      # Individual card
│   │   ├── [NEW] ProjectFilter.tsx    # Filter tabs
│   │   ├── [NEW] ProjectsSection.tsx  # Grid container
│   │   ├── [NEW] SkillsDashboard.tsx  # Skills showcase
│   │   ├── [NEW] ExperienceTimeline.tsx # Work history
│   │   ├── [NEW] ContactSection.tsx   # Contact form
│   │   ├── [REMOVE] Header.tsx         # Old header
│   │   ├── ResumeAssistant.tsx      # Keep as-is
│   │   └── ...other components...
│   │
│   ├── lib/
│   │   ├── [NEW] projects-data.ts     # Centralized project data
│   │   └── [NEW] navigation-data.ts  # Nav structure
│   │
│   └── routes/
│       ├── __root.tsx              # UPDATE: Add Sidebar
│       ├── index.tsx               # UPDATE: Use new components
│       └── ...other routes...
│
└── content/
    ├── education/                   # Keep existing
    └── [NEW] jobs/                 # Your new job entries
```

## Key Design Tokens

### Colors
```css
--primary-blue: #3b82f6;
--primary-purple: #8b5cf6;
--primary-green: #10b981;
--primary-orange: #f97316;

--bg-dark: #0a0a0f;
--bg-card: rgba(26, 26, 26, 0.6);
--bg-glass: rgba(255, 255, 255, 0.05);

--text-primary: #e2e8f0;
--text-secondary: #94a3b8;
--text-muted: #64748b;

--border-light: rgba(255, 255, 255, 0.1);
--border-hover: rgba(59, 130, 246, 0.3);
```

### Typography
```css
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.5rem;    /* 24px */
--font-size-2xl: 2rem;     /* 32px */

--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Spacing
```css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
```

### Effects
```css
--transition-fast: 150ms ease;
--transition-base: 300ms ease;
--transition-slow: 500ms ease;

--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.25);
```

## Component Quick API

### Sidebar
```typescript
import Sidebar from '@/components/Sidebar';

<Sidebar
  mobileOpen={isMobileOpen}
  collapsed={isCollapsed}
  onMobileClose={() => setMobileOpen(false)}
  onToggleCollapse={() => setCollapsed(!isCollapsed)}
  onThemeToggle={() => toggleTheme()}
  isDarkMode={isDarkMode}
/>
```

### ProjectCard
```typescript
import ProjectCard from '@/components/ProjectCard';

<ProjectCard
  id="tetris-ai"
  title="Tetris with AI Agent"
  description="Classic Tetris game..."
  link="/tetris"
  github="https://github.com/..."
  category="ai-ml"
  color="#00f3ff"
  icon={<IconCpu size={32} />}
  tags={['Phaser', 'JavaScript', 'AI']}
  featured={true}
  techStack={{
    frontend: ['Phaser', 'JavaScript'],
    ai: ['TensorFlow'],
  }}
/>
```

### ProjectsSection
```typescript
import ProjectsSection from '@/components/ProjectsSection';

<ProjectsSection
  projects={projects}
  showSearch={true}
  showFilters={true}
  filter="all" // 'all' | 'ai-ml' | 'web-apps' | '3d-graphics'
/>
```

## Tailwind Utility Classes Reference

### Layout
```tsx
<div className="flex items-center justify-between gap-4">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<div className="flex flex-col md:flex-row">
```

### Spacing
```tsx
<div className="p-4 md:p-6 lg:p-8">
<div className="gap-2 md:gap-4 lg:gap-6">
<div className="my-4 md:my-8 lg:my-12">
```

### Colors
```tsx
<div className="bg-slate-900 text-slate-50">
<div className="bg-gradient-to-r from-blue-500 to-purple-600">
<div className="border border-white/10 hover:border-blue-500/30">
<div className="text-blue-400 hover:text-blue-300">
```

### Effects
```tsx
<div className="backdrop-blur-xl bg-slate-900/80">
<div className="shadow-lg shadow-slate-900/50">
<div className="transition-all duration-300 hover:scale-105">
<div className="animate-in fade-in duration-500">
```

### Responsive
```tsx
<div className="w-full md:w-auto lg:w-1/2">
<div className="hidden md:block lg:hidden">
<div className="flex-col md:flex-row lg:grid lg:grid-cols-3">
```

## Framer Motion Patterns

### Fade In
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

### Stagger Children
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    }
  }}
>
  {items.map((item) => (
    <motion.div variants={{ /* variants */ }}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Scale on Hover
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
  {children}
</motion.div>
```

## Common Patterns

### Conditional Rendering
```tsx
{isLoading && <Skeleton />}
{error && <ErrorDisplay message={error} />}
{items.length > 0 && <ItemList items={items} />}
{items.length === 0 && <EmptyState />}
```

### List with Keys
```tsx
{projects.map((project) => (
  <ProjectCard key={project.id} {...project} />
))}
```

### Form Handling
```tsx
const [form, setForm] = useState({ name: '', email: '', message: '' });
const [errors, setErrors] = useState({ name: '', email: '', message: '' });

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // Validation and submission logic
};

<input
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
  className={errors.name ? 'border-red-500' : ''}
/>
```

## Performance Tips

### React
- Use `React.memo()` for expensive components
- Use `useCallback()` for event handlers
- Use `useMemo()` for computed values
- Avoid inline function definitions in JSX

### Images
- Use `loading="lazy"` on img tags
- Use WebP format with fallback
- Optimize images before adding
- Add width/height attributes

### Code Splitting
```tsx
import { lazy } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

## Git Workflow

### Branch Strategy
```
main           # Production (protected)
  └── develop     # Development branch
      ├── feature/sidebar-navigation
      ├── feature/enhanced-projects
      ├── feature/skills-dashboard
      └── feature/experience-timeline
```

### Commit Messages
```
feat: add sidebar navigation component
fix: resolve mobile overlay z-index issue
refactor: extract project data to separate file
style: improve card hover effects
perf: optimize filter transitions
test: add unit tests for project card
docs: update component API documentation
```

## Testing Checklist

### Visual Testing
- [ ] All animations smooth (60fps)
- [ ] Hover states consistent
- [ ] No layout shifts
- [ ] Typography hierarchy clear
- [ ] Colors accessible
- [ ] Images load properly

### Functional Testing
- [ ] All navigation links work
- [ ] Filters work correctly
- [ ] Search returns accurate results
- [ ] Form validation works
- [ ] Forms submit successfully
- [ ] Theme toggle works

### Responsive Testing
- [ ] Mobile (< 640px) works
- [ ] Tablet (640-1024px) works
- [ ] Desktop (1024-1280px) works
- [ ] Wide (> 1280px) works
- [ ] Touch interactions work
- [ ] Keyboard navigation works

### Cross-Browser Testing
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works
- [ ] Edge works

## Troubleshooting

### Issue: Sidebar covers content on mobile
**Solution:** Add z-index hierarchy
- Sidebar: 100
- Overlay: 1000
- Content: auto

### Issue: Animations laggy
**Solution:** Use CSS transforms instead of layout changes
```css
/* Bad */
.sidebar { left: 0; transition: left 0.3s; }

/* Good */
.sidebar { transform: translateX(0); transition: transform 0.3s; }
```

### Issue: Search slow
**Solution:** Debounce search input
```typescript
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);
```

### Issue: Cards jump when loading
**Solution:** Reserve space for skeleton
```tsx
<div className="min-h-[400px]">
  {loading ? <Skeleton /> : <Content />}
</div>
```

## Useful Resources

### Libraries
- Framer Motion: https://www.framer.com/motion
- Vanilla Tilt: https://micku744.github.io/vanilla-tilt.js/
- Mantine: https://mantine.dev/
- Lucide Icons: https://lucide.dev/
- TanStack: https://tanstack.com/

### Documentation
- React Docs: https://react.dev
- TypeScript: https://www.typescriptlang.org/
- Tailwind CSS: https://tailwindcss.com/
- MDN Web Docs: https://developer.mozilla.org/

### Tools
- Lighthouse: https://pagespeed.web.dev/
- axe DevTools: https://www.deque.com/axe/
- React DevTools: https://react.dev/learn/react-developer-tools
- Chrome DevTools: https://developer.chrome.com/docs/devtools

## Quick Start Command

```bash
# Create new feature branch
git checkout -b feature/sidebar-navigation

# Install new dependencies
pnpm add vanilla-tilt

# Start dev server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Format code
pnpm format

# Lint code
pnpm lint
```

## Environment Variables

```env
# No new env variables needed
# All configuration is in code
```

## Deployment Commands

```bash
# Build for Cloudflare Pages
pnpm build

# Preview build locally
pnpm preview

# Deploy to Cloudflare Pages
pnpm deploy
```
