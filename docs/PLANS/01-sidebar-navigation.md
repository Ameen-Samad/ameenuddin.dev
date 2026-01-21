# 📁 Sidebar Navigation Component - Detailed Plan

## Overview
Replace current header-based navigation with a modern, fixed sidebar design that aggregates navigation into clear categories.

## Component Structure

### File: `src/components/Sidebar.tsx`

```typescript
interface SidebarProps {
  isOpen?: boolean; // Mobile state
  onToggle?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[]; // For nested items
  external?: boolean;
}
```

### Layout
```
┌─────────────────────────┐
│ [LOGO]               │
├─────────────────────────┤
│ NAVIGATION             │
│                       │
│ 🏠 Home               │
│                       │
│ 📁 Projects ▸         │
│   ├─ All             │
│   ├─ AI/ML           │
│   ├─ Web Apps        │
│   └─ 3D/Graphics     │
│                       │
│ 💼 Experience ▸       │
│   ├─ Resume          │
│   └─ Skills          │
│                       │
│ 🔗 Contact            │
├─────────────────────────┤
│ SOCIALS               │
│ ┌──────────────┐       │
│ │ [LinkedIn]   │       │
│ │ [GitHub]     │       │
│ └──────────────┘       │
├─────────────────────────┤
│ [🌙] Theme Toggle    │
└─────────────────────────┘
```

## Features

### Desktop
- **Fixed position**: Left side, sticky on scroll
- **Collapsed state**: Icon-only (toggleable)
- **Hover indicators**: Show which items have children
- **Active state**: Highlight current page
- **Smooth animations**: Expand/collapse transitions

### Mobile
- **Hamburger button**: Top-right corner
- **Full-screen overlay**: Backdrop blur
- **Same structure**: Mirrors desktop layout
- **Touch-friendly**: Larger tap targets
- **Swipe to close**: Gesture support

## Navigation Data Structure

```typescript
const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <HomeIcon size={20} />,
    path: '/',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <FolderIcon size={20} />,
    children: [
      { id: 'projects-all', label: 'All Projects', path: '/' },
      { id: 'projects-ai', label: 'AI/ML', path: '/#projects-ai' },
      { id: 'projects-web', label: 'Web Apps', path: '/#projects-web' },
      { id: 'projects-3d', label: '3D/Graphics', path: '/#projects-3d' },
    ],
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: <BriefcaseIcon size={20} />,
    children: [
      { id: 'resume', label: 'Resume', path: '/#resume' },
      { id: 'skills', label: 'Skills', path: '/#skills' },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: <MailIcon size={20} />,
    path: '/#contact',
  },
];

const socialLinks = [
  { id: 'linkedin', label: 'LinkedIn', icon: <LinkedinIcon />, url: '...' },
  { id: 'github', label: 'GitHub', icon: <GithubIcon />, url: '...' },
];
```

## Design System

### Colors
- **Background**: `#0a0a0f` (dark) / `#f8f9fa` (light)
- **Active item**: `#3b82f6` (blue)
- **Hover**: `rgba(59, 130, 246, 0.1)`
- **Border**: `rgba(255,255,255,0.1)`
- **Text**: `#e2e8f0` / `#1f2937`

### Typography
- Logo: 1.25rem (20px), weight 700
- Main items: 1rem (16px), weight 500
- Sub items: 0.875rem (14px), weight 400
- Compact mode: Icons only 24px

### Spacing
- Section padding: 1.5rem (24px)
- Item height: 2.75rem (44px) - touch target
- Nested indent: 1.5rem (24px)
- Section gap: 1rem (16px)

### Animations
```css
.nav-item {
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateX(4px);
}

.nav-submenu {
  animation: slideDown 0.3s ease;
}
```

## State Management

```typescript
interface SidebarState {
  isMobileOpen: boolean;
  isCollapsed: boolean; // Desktop only
  activeSection: string;
  isDarkMode: boolean;
}

// Using TanStack Store
export const sidebarStore = new Store({
  isMobileOpen: false,
  isCollapsed: false,
  activeSection: 'home',
  isDarkMode: true,
});
```

## Accessibility

- **ARIA labels** on all nav items
- **Keyboard navigation**: Arrow keys, Enter, Escape
- **Focus indicators**: Visible focus rings
- **Screen reader**: announce sections
- **Skip links**: Jump to content

## Responsive Breakpoints

| Screen | Layout |
|--------|---------|
| < 768px | Mobile hamburger only |
| 768-1024px | Mobile overlay + collapsed sidebar (icons) |
| 1024-1280px | Desktop with sidebar (labels) |
| > 1280px | Desktop with sidebar + socials visible |

## Implementation Checklist

- [ ] Create Sidebar.tsx component
- [ ] Add navigation data structure
- [ ] Implement desktop layout
- [ ] Implement mobile overlay
- [ ] Add collapse/expand functionality
- [ ] Add theme toggle
- [ ] Add social links
- [ ] Style with Tailwind
- [ ] Add animations with Framer Motion
- [ ] Test keyboard navigation
- [ ] Test responsive breakpoints
- [ ] Add to __root.tsx layout
- [ ] Remove old Header.tsx
- [ ] Update index.tsx to use sidebar
