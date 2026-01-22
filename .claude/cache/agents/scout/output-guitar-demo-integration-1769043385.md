# Guitar Demo Integration Guide
Generated: 2026-01-22

## Summary
Found the DemosSection component and navigation data structure. Both files follow consistent patterns for adding new demos.

## File Locations

| File | Path | Lines | Purpose |
|------|------|-------|---------|
| **DemosSection** | `src/components/DemosSection.tsx` | 866 | Homepage demo cards with detailed info |
| **Navigation Data** | `src/lib/navigation-data.tsx` | 276 | Sidebar navigation structure |

---

## 1. DemosSection.tsx Structure

**Location:** `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/src/components/DemosSection.tsx`

### Demo Interface (Lines 38-50)

```typescript
interface Demo {
  id: string;               // Unique identifier
  title: string;            // Display name
  description: string;      // Brief description
  icon: React.ReactNode;    // Lucide icon component
  path: string;             // Route path
  badge: string;            // Badge label (e.g., "Live AI", "Game AI")
  color: string;            // Hex color for theming
  features: string[];       // Quick feature list
  learnings: string[];      // What was learned building this
  gitEvidence?: string;     // Optional: file reference
  technicalHighlights?: string[];  // Optional: technical details
}
```

### Demo Array (Starting Line 52)

Demos are stored in a `const demos: Demo[]` array. Here's a complete example:

```typescript
{
  id: "tetris",
  title: "Tetris with AI Agent",
  description: "Classic Tetris game with WebAssembly and AI-powered gameplay assistant",
  icon: <Gamepad2 className="w-8 h-8" />,
  path: "/tetris",
  badge: "Game AI",
  color: "#f783ac",
  features: ["WebAssembly", "AI agent", "Real-time"],
  learnings: [
    "Compiling game logic to WebAssembly for performance",
    "Building AI agents that can play games autonomously",
    "Managing game state synchronization between WASM and JavaScript",
    "Optimizing render loops for smooth 60fps gameplay",
  ],
  technicalHighlights: [
    "WebAssembly runs at near-native speed (vs pure JavaScript)",
    "AI agent uses heuristics to evaluate board states",
    "Game loop runs independently from React render cycle",
  ],
  gitEvidence: "src/routes/tetris.tsx",
}
```

### Available Icons (Lines 16-36)

Icons imported from `lucide-react`:
- `Gamepad2` - for games
- `Bot` - for AI
- `Mic` - for audio
- `Volume2` - for sound
- `MessageSquare` - for chat
- `Guitar` - **You'll need to import this for the guitar demo**

---

## 2. Navigation Data Structure

**Location:** `/Users/nasdin/code/personal/ameenuddin.com/ameenuddin.dev/src/lib/navigation-data.tsx`

### NavItem Interface (Lines 16-23)

```typescript
export interface NavItem {
  id: string;              // Unique identifier
  label: string;           // Display name
  icon: React.ReactNode;   // Tabler icon component
  path?: string;           // Optional route path
  external?: boolean;      // Optional external link flag
  children?: NavItem[];    // Optional nested items
  action?: () => void;     // Optional click handler
}
```

### Demos Section (Lines 40-152)

The demos are organized hierarchically:

```typescript
{
  id: "demos",
  label: "Demos",
  icon: <IconRobot size={20} />,
  children: [
    {
      id: "demos-overview",
      label: "All Demos",
      icon: <IconRobot size={18} />,
      path: "/#demos",
    },
    {
      id: "ai-demos",
      label: "AI Demos",
      icon: <IconRobot size={18} />,
      children: [
        {
          id: "demo-ai-voice",
          label: "Voice Agent",
          icon: <IconRobot size={16} />,
          path: "/demo/ai-voice",
        },
        // ... more AI demos
      ],
    },
    {
      id: "tanstack-demos",
      label: "TanStack Demos",
      icon: <IconCode size={18} />,
      children: [
        // TanStack demos
      ],
    },
    // ... more demo categories
  ],
}
```

### Current AI Demos in Navigation (Lines 51-104)

```typescript
{
  id: "ai-demos",
  label: "AI Demos",
  icon: <IconRobot size={18} />,
  children: [
    { id: "demo-ai-voice", label: "Voice Agent", path: "/demo/ai-voice" },
    { id: "demo-chatbot", label: "Chatbot with RAG", path: "/chatbot" },
    { id: "demo-tetris", label: "Tetris AI Agent", path: "/tetris" },
    { id: "demo-builder", label: "3D Builder", path: "/builder" },
    { id: "demo-ai-image", label: "Image Generation", path: "/demo/ai-image" },
    { id: "demo-ai-tts", label: "Text-to-Speech", path: "/demo/ai-tts" },
    { id: "demo-ai-chat", label: "AI Chat", path: "/demo/ai-chat" },
    { id: "demo-ai-structured", label: "Structured Output", path: "/demo/ai-structured" },
  ],
}
```

---

## 3. How to Add Guitar Demo

### Step 1: Update DemosSection.tsx

**File:** `src/components/DemosSection.tsx`

#### 1.1 Import Guitar Icon (Line ~36)

Add to the lucide-react imports:
```typescript
import {
  // ... existing imports
  Guitar,  // ADD THIS
} from "lucide-react";
```

#### 1.2 Add Demo Entry (After line ~130, in the demos array)

Insert after the "builder" demo or in the AI demos section:

```typescript
{
  id: "guitar-concierge",
  title: "Guitar Concierge",
  description: "AI-powered guitar recommendation assistant with voice support",
  icon: <Guitar className="w-8 h-8" />,
  path: "/demo/guitars",
  badge: "Voice AI",
  color: "#fd7e14",  // Orange color
  features: ["Voice input", "AI recommendations", "Interactive chat"],
  learnings: [
    "Building conversational AI with context awareness",
    "Integrating voice input with AI chat systems",
    "Creating domain-specific AI assistants",
    "Managing multi-turn conversations with state",
  ],
  technicalHighlights: [
    "Voice-to-text integration for hands-free interaction",
    "AI understands guitar terminology and preferences",
    "Context maintained across conversation turns",
  ],
  gitEvidence: "src/routes/demo/guitars/index.tsx",
}
```

### Step 2: Update Navigation Data

**File:** `src/lib/navigation-data.tsx`

Add to the `ai-demos` children array (around line 98, after "demo-ai-structured"):

```typescript
{
  id: "demo-guitar-concierge",
  label: "Guitar Concierge",
  icon: <IconRobot size={16} />,
  path: "/demo/guitars",
}
```

---

## 4. Verification Checklist

After making the changes:

- [ ] Import `Guitar` icon in DemosSection.tsx
- [ ] Add demo object to `demos` array in DemosSection.tsx
- [ ] Add nav item to `ai-demos.children` in navigation-data.tsx
- [ ] Verify path is `/demo/guitars` (matches route file)
- [ ] Check homepage shows new card
- [ ] Check sidebar navigation shows new item
- [ ] Test link navigation works

---

## 5. Key Files Referenced

| File | Purpose |
|------|---------|
| `src/components/DemosSection.tsx` | Homepage demo showcase cards |
| `src/lib/navigation-data.tsx` | Sidebar navigation tree |
| `src/routes/demo/guitars/index.tsx` | Guitar demo route (already exists) |

---

## Notes

- **Color scheme**: Used `#fd7e14` (orange) to match guitar/music theme
- **Badge**: "Voice AI" emphasizes the voice input feature
- **Category**: Added to AI Demos section (appropriate for AI assistant)
- **Icon size**: DemosSection uses `w-8 h-8`, navigation uses `size={16}`
- **Path consistency**: Both files must use `/demo/guitars` to match the route

---

## Pattern Summary

**DemosSection Pattern:**
```
Import icon → Add to demos array → Use consistent structure (id, title, description, icon, path, badge, color, features, learnings)
```

**Navigation Pattern:**
```
Add to appropriate children array → Use consistent structure (id, label, icon, path)
```
