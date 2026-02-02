# Frontend Migration Guide

## React → Next.js 15 App Router

### Architecture Changes

**Old Project (React + Vite)**
- Single Page Application (SPA)
- Client-side routing with React Router
- Separate frontend/backend
- Manual state management

**New Project (Next.js 15)**
- Server-Side Rendering (SSR) + Client Components
- File-based routing with App Router
- API routes in same project
- Built-in optimizations

---

## Directory Structure

```
app/
├── (auth)/          # Login, Signup, Forgot Password
├── (dashboard)/     # User dashboard routes
├── (admin)/         # Admin panel routes
├── (mentor)/        # Mentor routes
├── (public)/        # Public pages (landing, about)
└── api/             # Backend API routes
```

### Route Groups
- `(auth)` - Authentication pages (no dashboard layout)
- `(dashboard)` - Protected user routes with sidebar
- `(admin)` - Admin-only routes
- `(mentor)` - Mentor-specific routes

---

## Key Migrations

### 1. **Components**
- Moved from `src/components/` → `components/`
- Split into Server Components (default) and Client Components (`'use client'`)
- Added UI component library in `components/ui/`

### 2. **Routing**
```
Old: /src/pages/Dashboard.jsx
New: /app/(dashboard)/dashboard/page.tsx

Old: /src/pages/admin/Skills.jsx
New: /app/(admin)/admin/skills/page.tsx
```

### 3. **State Management**
- No Redux/Context needed for most pages (server components fetch data)
- Client state only where needed (forms, modals, filters)
- NextAuth for authentication state

### 4. **Styling**
- Kept Tailwind CSS
- Added Tailwind v4 (simplified config)
- Dark mode support via `dark:` classes

---

## Component Patterns

### Server Component (Default)
```tsx
// // Fetches data on server, no client JS needed
// export default async function Page() {
//   const data = await fetch('...');
//   return <div>{data}</div>;
// }
```

### Client Component (Interactive)
```tsx
// 'use client';  // Required for hooks, events

// export default function InteractiveComponent() {
//   const [state, setState] = useState();
//   return <button onClick={() => setState()}>Click</button>;
// }
```

---

## Data Fetching

**Old:** `useEffect` + `fetch` in components
**New:** Direct `async` functions in server components

```tsx
// Server Component - No loading states needed
export default async function SkillsPage() {
  const skills = await getSkills(); // Runs on server
  return <SkillsList skills={skills} />;
}
```

---

## Key Benefits
✅ Better SEO (server-rendered)
✅ Faster initial page load
✅ Automatic code splitting
✅ Built-in image optimization
✅ API routes in same project
