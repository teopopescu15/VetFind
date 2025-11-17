---
name: ui-ux-designer
description: |
  Expert UI/UX designer leveraging the shadcn MCP server for intelligent component generation. This skill uses 7 powerful MCP tools to browse, search, and implement shadcn/ui components that are inherently responsive and accessible. Specializes in modern web applications with the mandatory Dark Blue/Cyan color palette. Automatically activates for tasks involving "design", "UI", "UX", "shadcn", "components", "color palette", or "layout improvements".
---

# UI/UX Designer Skill

## ⚠️ MANDATORY COLOR PALETTE

**THIS SKILL ENFORCES A STRICT COLOR PALETTE POLICY.**

All UI/UX implementations MUST use the **Dark Blue/Cyan palette** specified in `references/color_palettes.md`.

**DO NOT:**
- ❌ Suggest alternative color palettes
- ❌ Ask users to choose colors
- ❌ Use purple, pink, green, or other colors as primary
- ❌ Implement light mode backgrounds (dark mode only)
- ❌ Deviate from the established palette

**ALWAYS:**
- ✅ Use dark backgrounds (#020617, #0a0e1a, #0f172a)
- ✅ Use blue (#3b82f6, #60a5fa, #93c5fd) and cyan (#06b6d4, #22d3ee, #67e8f9) as primary colors
- ✅ Consult `references/color_palettes.md` for exact specifications
- ✅ Apply appropriate palette variation per page type
- ✅ Follow the "Look Absolutely Fabulous" design philosophy

This is a project requirement and cannot be changed.

## 🚀 SHADCN MCP SERVER - YOUR INTELLIGENT COMPONENT ASSISTANT

**THIS SKILL LEVERAGES 7 POWERFUL MCP TOOLS FOR COMPONENT GENERATION**

The shadcn MCP server provides intelligent, context-aware access to the entire shadcn/ui ecosystem. All shadcn components are **inherently responsive**, **accessible**, and **production-ready**.

**THE 7 MCP TOOLS AT YOUR DISPOSAL:**

1. **`get_project_registries`** - View all configured component registries
   - Shows available component sources (@shadcn, @acme, etc.)
   - Identifies custom/private registries

2. **`list_items_in_registries`** - Browse all available components
   - Lists components, blocks, demos, and hooks
   - Supports pagination for large registries

3. **`search_items_in_registries`** - Find components intelligently
   - Fuzzy search across names and descriptions
   - Quick discovery of specific UI patterns

4. **`view_items_in_registries`** - Get complete component code
   - Returns full TypeScript/React implementation
   - Includes all dependencies and imports

5. **`get_item_examples_from_registries`** - Access usage examples
   - Find demo implementations (e.g., 'button-demo', 'card-example')
   - Complete working code with all dependencies

6. **`get_add_command_for_items`** - Generate installation commands
   - Get exact CLI commands for adding components
   - Batch installation support

7. **`get_audit_checklist`** - Verify implementation
   - Post-installation validation checklist
   - Ensures everything works correctly

**WHY SHADCN COMPONENTS ARE SUPERIOR:**
- ✅ **Responsive-Ready Structure** - Components provide solid foundation for responsive design
- ✅ **Accessibility First** - ARIA attributes and keyboard navigation included
- ✅ **Type-Safe** - Full TypeScript support out of the box
- ✅ **Customizable** - Tailwind classes for easy styling
- ✅ **Easy Responsive Implementation** - Add Tailwind utilities for perfect responsive behavior
- ✅ **Production Ready** - Used by thousands of production applications

**ALWAYS USE SHADCN MCP INSTEAD OF:**
- ❌ Writing responsive CSS manually
- ❌ Creating custom breakpoint systems
- ❌ Building components from scratch
- ❌ Copy-pasting from documentation
- ❌ Using outdated component patterns

## Overview

Transform any web application into a modern, beautiful, fully responsive experience using **shadcn/ui components via MCP server**, professional color palettes, and best-practice design patterns. This skill provides comprehensive guidance for implementing production-ready UI/UX across all device sizes with consistent, accessible design.

**Key Feature**: Integrated with **shadcn MCP server** (`@magnusrodseth/shadcn-mcp-server`) for intelligent, on-demand component generation without manual CLI commands.

## 🎯 Critical Understanding: shadcn Components Are NOT Automatically Responsive

**IMPORTANT CLARIFICATION**:
- shadcn provides **responsive-ready structure** (good HTML, accessibility)
- You must **add Tailwind responsive utilities** for actual responsive behavior
- Components won't automatically adapt to different screen sizes without your input

**What This Means**:
```jsx
// ❌ shadcn component alone - NOT responsive
<Button>Click me</Button>

// ✅ With your responsive utilities - NOW responsive
<Button className="w-full sm:w-auto px-3 sm:px-4 text-sm sm:text-base">
  Click me
</Button>
```

## When to Use This Skill

Activate this skill when the user requests:
- **UI/UX improvements** or redesigns
- **Responsive design** implementation (iPhone, MacBook, Desktop)
- **Color palette** selection and implementation
- **shadcn/ui components** integration
- **Icon** implementation with shadcn icons (Lucide React as fallback)
- **Modern design** patterns and best practices
- **Design system** creation or updates
- **Accessibility** improvements
- **Component library** setup

## MCP Integration - How to Use the 7 Tools

This skill is **MCP-powered** for seamless shadcn/ui component generation using the official shadcn MCP server.

### Using the 7 MCP Tools Effectively

**Tool 1 - Check Available Registries**:
```
Use: get_project_registries
Example: "Show me configured registries"
Returns: List of available component sources
```

**Tool 2 - Browse Components**:
```
Use: list_items_in_registries
Example: "List all components from @shadcn"
Returns: Complete component catalog
```

**Tool 3 - Search for Components**:
```
Use: search_items_in_registries
Example: "Find authentication components"
Returns: Matching components with descriptions
```

**Tool 4 - Get Component Code**:
```
Use: view_items_in_registries
Example: "Show me the button component code"
Returns: Full implementation with TypeScript
```

**Tool 5 - Find Examples**:
```
Use: get_item_examples_from_registries
Example: "Find button examples and demos"
Returns: Working demos with complete code
```

**Tool 6 - Generate Install Commands**:
```
Use: get_add_command_for_items
Example: "How do I add button and card?"
Returns: CLI commands for installation
```

**Tool 7 - Verify Implementation**:
```
Use: get_audit_checklist
Example: "Check if everything is working"
Returns: Validation checklist
```

**MCP Workflow Example**:
1. Search: `search_items_in_registries` for "form"
2. Preview: `view_items_in_registries` for form components
3. Examples: `get_item_examples_from_registries` for demos
4. Install: `get_add_command_for_items` for CLI command
5. Verify: `get_audit_checklist` after installation

**Component Categories Available via MCP**:

**Interactive Components**:
- Button, Dialog, Command, Dropdown Menu, Context Menu, Alert Dialog

**Form Components**:
- Input, Textarea, Select, Checkbox, Radio Group, Switch, Form, Label, Slider, Toggle

**Layout Components**:
- Card, Sheet, Sidebar, Resizable, Separator, Aspect Ratio, Scroll Area

**Navigation Components**:
- Navigation Menu, Breadcrumb, Pagination, Tabs, Menubar

**Feedback Components**:
- Alert, Toast, Toaster, Progress, Skeleton, Badge, Avatar

**Data Components**:
- Table, Chart, Calendar, Carousel, Accordion, Collapsible

**Overlay Components**:
- Popover, Tooltip, Hover Card, Drawer

**Advanced Components**:
- Input OTP, Toggle Group, Sonner (notifications)

**MCP Workflow in This Skill**:

```
1. User requests UI improvement
   ↓
2. Skill identifies needed components
   ↓
3. Request from shadcn MCP: "Generate [component]"
   ↓
4. MCP returns complete component code
   ↓
5. Customize with color palette & styling
   ↓
6. Integrate into user's project
   ↓
7. Test & validate
```

**Error Handling**:
- If MCP unavailable → Fall back to manual CLI commands
- If component not found → Use references/shadcn_components.md
- If generation fails → Provide manual component code

## Quick Start Workflow

### Step 1: Understand the Project

Before making any changes, analyze the current project:

1. **Identify the framework**:
   - Check `package.json` for React, Vue, Angular, etc.
   - Note build tool (Vite, Next.js, Create React App)
   - Verify Tailwind CSS is installed

2. **Assess current state**:
   - Read existing component files
   - Note current styling approach
   - Check for existing component library
   - Identify pages needing redesign

3. **Gather requirements**:
   - Which pages/components to redesign?
   - **MANDATORY**: Design MUST be responsive for iPhone (375px-430px), MacBook (1280px-1440px), and Desktop (1920px+)
   - **PRIMARY FOCUS**: Application must look absolutely great on Desktop and iPhone
   - Any specific design inspirations?

### Step 2: Apply the Mandatory Color Palette

**CRITICAL: This project uses a MANDATORY Dark Blue/Cyan color palette.**

**You MUST use the color palette specified in `references/color_palettes.md`.**

**DO NOT suggest alternative palettes. DO NOT ask the user to choose colors.**

The **Dark Modern Tech Aesthetic** palette includes:
- **Primary Colors**: Blue (#3b82f6) and Cyan (#06b6d4)
- **Backgrounds**: Very dark slate (#020617, #0a0e1a, #0f172a)
- **Accent Colors**: Light blues and cyans for highlights
- **6 Variations**: Electric Storm, Deep Ocean, Cyan Focus, Neon Night, Slate Blue, Arctic Glow

**Consult `references/color_palettes.md` for complete specifications.**

**Selection Guide**:
- Login/Register pages → Electric Storm (high energy, glowing effects)
- Dashboard home → Neon Night (vibrant, energetic)
- Analytics pages → Cyan Focus (cyan-heavy for data)
- Settings/Admin → Deep Ocean (calm, minimal)
- Content pages → Slate Blue (readable, balanced)
- Forms → Arctic Glow (high contrast, functional)

**This is NON-NEGOTIABLE. All UI implementations must follow this palette.**

### Step 3: Setup shadcn/ui with MCP

**IMPORTANT**: This skill uses the **shadcn MCP server** for intelligent component generation.

The shadcn MCP server (`@magnusrodseth/shadcn-mcp-server`) provides:
- **50+ shadcn/ui components** available on demand
- **Intelligent component generation** with proper dependencies
- **Automatic styling** with Tailwind CSS integration
- **Type-safe** TypeScript components
- **Accessibility** built-in with ARIA attributes

**MCP Integration**:
When you need a shadcn component, the MCP server will:
1. Generate the complete component code
2. Include all necessary dependencies
3. Apply proper Tailwind styling
4. Ensure TypeScript compatibility
5. Add accessibility features

**Available Components** (use MCP to generate):
- **Interactive**: Button, Dialog, Command, Dropdown Menu, Alert Dialog
- **Form**: Input, Textarea, Select, Checkbox, Radio Group, Switch, Form, Label
- **Layout**: Card, Sheet, Sidebar, Resizable, Separator, Scroll Area
- **Navigation**: Navigation Menu, Breadcrumb, Pagination, Tabs
- **Feedback**: Alert, Toast, Progress, Skeleton, Badge
- **Data**: Table, Chart, Calendar, Carousel, Accordion
- **Overlays**: Popover, Tooltip, Hover Card, Drawer

**Manual Fallback** (if MCP unavailable):
```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add essential components
npx shadcn@latest add button input label card alert separator
```

Configure `components.json`:
- Style: "new-york" (modern)
- Icon library: "lucide" (shadcn components include built-in icons; use lucide-react only as fallback)
- CSS variables: true

### Step 4: Implement Color Palette

Update `src/index.css` or equivalent with the MANDATORY Dark Blue/Cyan palette:

```css
:root {
  /* MANDATORY: Dark Blue/Cyan Palette (Electric Storm) */
  --radius: 0.75rem;

  /* Background colors - Very dark slate */
  --bg-primary: #020617;      /* Deep space navy */
  --bg-card: #0a0e1a;         /* Card backgrounds */
  --bg-input: #0f172a;        /* Input backgrounds */

  /* Primary colors - Blue */
  --primary: #3b82f6;         /* blue-500 */
  --primary-foreground: #f8fafc;

  /* Secondary colors - Cyan */
  --secondary: #06b6d4;       /* cyan-500 */
  --secondary-foreground: #f8fafc;

  /* Text colors */
  --text-primary: #f8fafc;    /* slate-50 */
  --text-secondary: #e2e8f0;  /* slate-200 */
  --text-muted: #cbd5e1;      /* slate-300 */

  /* Semantic colors (dark mode optimized) */
  --success: #34d399;         /* emerald-400 */
  --error: #f87171;           /* red-400 */
  --warning: #fbbf24;         /* amber-400 */
  --info: #60a5fa;            /* blue-400 */
}
```

Add custom button variants:
```tsx
// In button.tsx - MANDATORY blue/cyan gradient
gradient: "bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]",
```

### Step 5: Make shadcn Components Responsive with Tailwind

**✨ REALITY CHECK: shadcn components provide the structure, YOU add responsive styling!**

When you use shadcn MCP tools to generate components, they provide:
- **Well-structured HTML** that won't break on mobile
- **Accessibility features** built-in
- **Touch-friendly interaction areas**
- **Viewport-aware positioning** (for modals, popovers)
- **Base styles** you enhance with Tailwind utilities

**How to Use shadcn MCP for Responsive Components:**

1. **Search for the component you need:**
```
Use: search_items_in_registries
Query: "responsive navigation menu"
```

2. **Get the full component code:**
```
Use: view_items_in_registries
Items: ["@shadcn/navigation-menu"]
```

3. **Find responsive examples:**
```
Use: get_item_examples_from_registries
Query: "navigation-menu-demo responsive"
```

4. **Customize with Tailwind's responsive utilities:**
```jsx
{/* shadcn components + Tailwind = Perfect responsiveness */}
<Card className="p-4 sm:p-6 lg:p-8">
  <CardTitle className="text-xl sm:text-2xl lg:text-3xl">
    Automatically Responsive
  </CardTitle>
</Card>
```

**What shadcn Provides vs What You Add:**

**shadcn Provides:**
- ✅ **Component structure** - Semantic HTML that works on all devices
- ✅ **Accessibility** - Screen readers and keyboard navigation
- ✅ **Base interactivity** - Modals, dropdowns, collapsibles work on mobile
- ✅ **Touch-friendly defaults** - Appropriate click areas

**You Must Add:**
- 📱 **Responsive spacing** - `p-4 sm:p-6 lg:p-8`
- 📱 **Responsive text** - `text-sm sm:text-base lg:text-lg`
- 📱 **Responsive widths** - `w-full sm:w-auto`, `max-w-sm sm:max-w-md`
- 📱 **Hide/show elements** - `hidden sm:block`, `block lg:hidden`
- 📱 **Responsive grids** - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

**Testing is Still Important:**
While shadcn components are responsive, always verify at these key sizes:
- iPhone: 375px-430px (iPhone SE to iPhone Pro Max)
- MacBook: 1280px-1440px (MacBook Air/Pro)
- Desktop: 1920px+ (Full HD and above)

**PRIMARY FOCUS**: The application must look absolutely great on Desktop and iPhone.

### Step 6: Implement Components with MCP

**PRIMARY METHOD**: Use the shadcn MCP server to generate components.

**MCP Workflow**:
1. **Request component**: "I need a Button component with gradient variant"
2. **MCP generates**: Complete TypeScript component with all features
3. **Review & customize**: Add project-specific styling (gradients, colors)
4. **Integrate**: Use in your pages with proper imports

**MCP Advantages**:
- ✅ Always up-to-date component code
- ✅ Proper TypeScript types
- ✅ Accessibility built-in
- ✅ Tailwind CSS integrated
- ✅ No manual CLI commands needed

**Component Generation Examples**:

**Generate Button Component**:
Request from MCP: "Generate shadcn Button component"
Then customize with MANDATORY blue/cyan gradient:
```tsx
// Add to button.tsx after MCP generation
gradient: "bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]",
```

**Generate Input Component**:
Request from MCP: "Generate shadcn Input component"
Use with dark theme styling:
```tsx
<Input className="h-12 border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-slate-900/50 text-slate-100" />
```

**Generate Card Component**:
Request from MCP: "Generate shadcn Card component"
Apply dark modern styling:
```tsx
<Card className="border border-blue-500/20 backdrop-blur-xl bg-[#0a0e1a]/95 shadow-2xl" />
```

**Fallback**: If MCP unavailable, consult `references/shadcn_components.md` for manual implementation.

**Common Patterns**:

**Form Fields**:
```jsx
<div className="space-y-4">
  <Label htmlFor="email" className="flex items-center gap-2 text-slate-200">
    <Mail className="w-4 h-4 text-blue-400" />
    Email Address
  </Label>
  <Input
    id="email"
    type="email"
    className="h-12 border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-slate-900/50 text-slate-100"
    placeholder="you@example.com"
  />
</div>
```

**Buttons**:
```jsx
<Button variant="gradient" className="w-full h-12 group bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
  Submit
  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
</Button>
```

**Cards**:
```jsx
<Card className="border border-blue-500/20 backdrop-blur-xl bg-[#0a0e1a]/95 shadow-2xl">
  <CardHeader className="text-center space-y-6 pt-8">
    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(96,165,250,0.6)]">
      <Sparkles className="w-10 h-10 text-white" strokeWidth={2.5} />
    </div>
    <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400">Modern Card</CardTitle>
  </CardHeader>
  <CardContent className="text-slate-300 space-y-6 pb-8">Content</CardContent>
</Card>
```

**Component Cards with Blue Gradient Icons** (See `references/shadcn_components.md` for complete patterns):
```jsx
<div className="group relative">
  {/* Hover border effect */}
  <div className="absolute inset-0 rounded-lg border border-blue-500/0 group-hover:border-blue-500/40 transition-all duration-300"></div>

  <Card className="relative">
    <CardHeader className="space-y-6 pt-6">
      {/* Blue gradient icon with glow */}
      <div
        className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
        style={{ boxShadow: 'rgba(96, 165, 250, 0.4) 0px 0px 15px' }}
      >
        <Layers className="w-5 h-5 text-white" />
      </div>
      <CardTitle className="text-lg">Component Title</CardTitle>
      <CardDescription>Component description</CardDescription>
    </CardHeader>
  </Card>
</div>
```

### Step 7: Add Animations

Add to `tailwind.config.js`:

```js
theme: {
  extend: {
    animation: {
      'blob': 'blob 7s infinite',
    },
    keyframes: {
      blob: {
        '0%': { transform: 'translate(0px, 0px) scale(1)' },
        '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
        '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        '100%': { transform: 'translate(0px, 0px) scale(1)' },
      },
    },
  },
}
```

Add animation delays to CSS:

```css
@layer utilities {
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
}
```

Use in components with responsive sizing:

```jsx
{/* Animated background blobs - Dark Blue/Cyan theme (responsive) */}
<div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
  <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-48 sm:w-96 h-48 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob" />
  <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-blue-600/15 rounded-full blur-3xl animate-blob animation-delay-4000" />
</div>
```

### Step 8: Validate & Test

1. **MANDATORY Responsive testing**:
   - ✅ MUST test on iPhone (375px-430px) - Primary mobile target
   - ✅ MUST test on MacBook (1280px-1440px) - Primary laptop target
   - ✅ MUST test on Desktop (1920px+) - Primary desktop target
   - ✅ MUST verify touch targets (minimum 44x44px) on iPhone
   - ✅ MUST check text readability at iPhone, MacBook, and Desktop sizes
   - ❌ NO EXCEPTIONS - iPhone and Desktop must look absolutely great

2. **Accessibility**:
   - Verify color contrast (4.5:1 minimum)
   - Test keyboard navigation
   - Check screen reader support

3. **Performance**:
   - Optimize images
   - Minimize animations
   - Check bundle size

4. **Browser testing**:
   - Chrome, Safari, Firefox, Edge
   - Mobile browsers

## Design Patterns Library

### Authentication Pages

```jsx
<div className="flex items-center justify-center min-h-screen bg-[#020617] p-4 sm:p-6 lg:p-8">
  {/* Decorative background blobs - DARK THEME (responsive) */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-48 sm:w-96 h-48 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob" />
    <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-blue-600/15 rounded-full blur-3xl animate-blob animation-delay-4000" />
  </div>

  <Card className="w-full max-w-sm sm:max-w-md border border-blue-500/20 backdrop-blur-xl bg-[#0a0e1a]/95 shadow-2xl relative z-10">
    <CardHeader className="space-y-6 text-center pb-8 sm:pb-10 pt-10 sm:pt-12">
      <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(96,165,250,0.6)]">
        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2.5} />
      </div>
      <CardTitle className="text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400">
        Welcome Back
      </CardTitle>
      <CardDescription className="text-slate-300">Login to continue your journey</CardDescription>
    </CardHeader>

    <CardContent className="px-6 sm:px-8 pb-8 sm:pb-10 space-y-6">
      {/* Form fields here */}
    </CardContent>
  </Card>
</div>
```

### Dashboard Layout (Dark Mode)

```jsx
<div className="min-h-screen bg-[#020617]">
  <header className="sticky top-0 z-50 bg-[#0a0e1a] border-b border-blue-500/20 h-16">
    {/* Navigation with dark theme */}
  </header>

  <div className="flex">
    <aside className="hidden md:block w-60 lg:w-72 border-r border-blue-500/20 bg-[#0a0e1a] min-h-screen">
      {/* Sidebar with dark theme */}
    </aside>

    <main className="flex-1 p-6 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Content with dark backgrounds */}
      </div>
    </main>
  </div>
</div>
```

### Form Validation

```jsx
{/* Password strength indicator */}
<div className="flex gap-1">
  {[1, 2, 3, 4].map((level) => (
    <div
      key={level}
      className={`h-1.5 flex-1 rounded-full transition-all ${
        passwordStrength >= level
          ? passwordStrength <= 2
            ? 'bg-red-500'
            : passwordStrength === 3
            ? 'bg-yellow-500'
            : 'bg-green-500'
          : 'bg-gray-200'
      }`}
    />
  ))}
</div>

{/* Password match validation */}
{confirmPassword && (
  <div className="flex items-center gap-2 text-xs">
    {password === confirmPassword ? (
      <>
        <CheckCircle className="w-3 h-3 text-green-500" />
        <span className="text-green-600">Passwords match</span>
      </>
    ) : (
      <>
        <XCircle className="w-3 h-3 text-red-500" />
        <span className="text-red-600">Passwords don't match</span>
      </>
    )}
  </div>
)}
```

## Best Practices

### 1. Mobile-First Design

Always start with mobile and scale up:

```jsx
{/* ✓ GOOD */}
<div className="text-base sm:text-lg lg:text-xl">

{/* ✗ BAD */}
<div className="text-xl lg:text-lg sm:text-base">
```

### 2. Consistent Spacing

Use Tailwind's spacing scale consistently:

```jsx
{/* Forms - Standard Pattern */}
space-y-6                  // Between fields on all screens
px-6 sm:px-8              // Horizontal padding

{/* Sections - Standard Pattern */}
space-y-8                  // Between sections on all screens
p-6 sm:p-8 lg:p-12        // Container padding

{/* Cards - Standard Pattern */}
p-4 sm:p-6 lg:p-8         // Card content padding

{/* Always follow this hierarchy */}
// Small (iPhone): base values
// Medium (MacBook): +2 units
// Large (Desktop): +4 units from base
```

### 3. Touch Targets

Minimum 44x44px for mobile interactions:

```jsx
<Button className="h-11 px-4 sm:h-12 sm:px-6">  {/* 44px+ */}
  Click Me
</Button>
```

### 4. Color Contrast

Ensure WCAG AA compliance (4.5:1 ratio):

```jsx
{/* High contrast combinations (Dark Mode) */}
- Slate-50 (#f8fafc) on #020617: 19.2:1 ✓✓✓ (AAA)
- Blue-300 (#93c5fd) on #020617: 11.5:1 ✓✓ (AAA)
- Blue-400 (#60a5fa) on #020617: 8.9:1 ✓ (AA)
- Cyan-400 (#22d3ee) on #020617: 9.2:1 ✓ (AA)

{/* Test with tools like WebAIM Contrast Checker */}
```

### 5. Loading States

Always provide feedback:

```jsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Loading...
    </>
  ) : (
    <>Submit</>
  )}
</Button>
```

### 6. Error Handling

Clear, helpful error messages:

```jsx
{error && (
  <Alert variant="destructive" className="animate-in fade-in">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

## Resources

### Reference Files

This skill includes two comprehensive reference documents:

1. **`references/color_palettes.md`**
   - 6 professional color palettes with complete specifications
   - **Mandatory Dark Blue/Cyan palette** for this project
   - Gradient combinations and usage guidelines
   - Semantic color definitions
   - Dark mode variants
   - Accessibility testing and contrast ratios
   - Color psychology and selection guide

2. **`references/shadcn_components.md`**
   - **MCP integration instructions and workflows**
   - Complete component reference (50+ components)
   - **Modern Component Card Patterns** with blue gradient icons
   - Reusable ComponentCard component with TypeScript types
   - Form patterns with validation
   - Advanced components (Dialog, Tabs, Dropdown)
   - Customization examples
   - Best practices and accessibility
   - **Built-in responsive features** of all components

### When to Use MCP Tools vs References

**Use MCP Tools for:**
- ✅ Getting live component code (`view_items_in_registries`)
- ✅ Searching for components (`search_items_in_registries`)
- ✅ Finding examples (`get_item_examples_from_registries`)
- ✅ Installation commands (`get_add_command_for_items`)

**Use Reference Files for:**
- ✅ Color palette specifications
- ✅ Custom styling patterns
- ✅ Component card design patterns
- ✅ Best practices and guidelines

## Deliverables

After completing a UI/UX design task, provide:

1. **Updated Components**
   - All redesigned page/component files
   - New shadcn/ui components added
   - Icon imports and usage

2. **Configuration Files**
   - Updated `tailwind.config.js` with animations
   - Updated `src/index.css` with color palette
   - Updated `components.json` if needed

3. **Documentation**
   - UI guidelines document (optional, recommended for teams)
   - Color palette reference
   - Component usage examples
   - Responsive breakpoint guide

4. **Testing Notes**
   - Devices/sizes tested
   - Browser compatibility
   - Accessibility validation results

## Common Tasks - Using MCP Tools

### Redesign Authentication Pages with MCP

1. **Search for auth components:**
   ```
   Use: search_items_in_registries
   Query: "authentication login form"
   ```

2. **Get component examples:**
   ```
   Use: get_item_examples_from_registries
   Query: "login-demo auth-form-demo"
   ```

3. **View component code:**
   ```
   Use: view_items_in_registries
   Items: ["@shadcn/button", "@shadcn/input", "@shadcn/card"]
   ```

4. **Apply mandatory Dark Blue/Cyan palette**
5. **Components are already responsive - just customize!**
6. **Verify with audit:**
   ```
   Use: get_audit_checklist
   ```

### Create Dashboard with MCP

1. **Search for dashboard components:**
   ```
   Use: search_items_in_registries
   Query: "dashboard sidebar navigation chart"
   ```

2. **Get layout examples:**
   ```
   Use: get_item_examples_from_registries
   Query: "dashboard-demo sidebar-demo"
   ```

3. **Components handle responsiveness automatically!**
   - Sidebar collapses on mobile
   - Charts adapt to screen size
   - Tables scroll horizontally

### Build Form with Validation using MCP

1. **Find form components:**
   ```
   Use: search_items_in_registries
   Query: "form input validation"
   ```

2. **Get validation examples:**
   ```
   Use: get_item_examples_from_registries
   Query: "form-demo validation-demo"
   ```

3. **shadcn forms include:**
   - Built-in validation patterns
   - Accessible error states
   - Touch-friendly inputs
   - Responsive layouts

## Common Pitfalls to Avoid

### 1. **Assuming shadcn Components Are Fully Responsive**
**Problem**: Expecting components to adapt automatically
**Reality**: You must add responsive utilities
```jsx
// ❌ Wrong assumption
<Card>This will be responsive automatically</Card>

// ✅ Correct implementation
<Card className="p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md">
  Now it's responsive
</Card>
```

### 2. **Using Fixed Pixel Values for Layout Elements**
**Problem**: Background elements, icons, or containers with fixed sizes
```jsx
// ❌ Bad - causes overflow on mobile
<div className="w-96 h-96">  // 384px on 375px screen!

// ✅ Good - adapts to screen size
<div className="w-48 sm:w-96 h-48 sm:h-96">
```

### 3. **Forgetting Dark Mode in Examples**
**Problem**: Using light colors when enforcing dark mode
```jsx
// ❌ Violates dark mode rule
<div className="bg-white">

// ✅ Follows dark mode
<div className="bg-[#0a0e1a]">
```

### 4. **Not Testing on Actual Target Sizes**
- **Always test at 375px** (iPhone SE - minimum iPhone size)
- **Check 430px** (iPhone Pro Max - maximum iPhone size)
- **Test 1280px-1440px** (MacBook range)
- **Test 1920px+** (Desktop)
- **Verify no horizontal scroll on iPhone**
- **Test touch targets** (minimum 44x44px on iPhone)

### 5. **Inconsistent Spacing Patterns**
**Problem**: Different spacing in similar contexts
```jsx
// ❌ Inconsistent
<Card className="p-6">
<Card className="p-4 sm:p-8">  // Different pattern!

// ✅ Consistent
<Card className="p-4 sm:p-6 lg:p-8">  // Same pattern everywhere
```

## Troubleshooting

### MCP Tools Not Working

**If MCP tools aren't responding:**
1. Check registries: `get_project_registries`
2. Verify components.json exists in project
3. Try searching with simpler terms
4. Fall back to manual CLI if needed

### Component Not Found

**If search returns no results:**
```
Use: list_items_in_registries
Registries: ["@shadcn"]
```
Then browse the full list manually

### Responsive Issues (Rare with shadcn)

**shadcn components are responsive by default, but if issues occur:**
- Check if Tailwind CSS is properly configured
- Verify viewport meta tag exists
- Ensure no conflicting CSS overrides
- Components auto-adapt - avoid manual breakpoints

### Icons Not Available

**Use shadcn MCP first, lucide-react as fallback:**
```
1. Search: search_items_in_registries for "icon"
2. If not found: npm install lucide-react
3. Import: import { Icon } from "lucide-react"
```

### Dark Blue/Cyan Palette Not Applied

- Verify CSS variables in `:root`
- Check gradient classes are applied
- Ensure dark mode is active
- Apply blue-500 to cyan-500 gradients

## Example: Complete Login Page

See the user's current implementation for a production-ready example featuring:

- **Dark Blue/Cyan color palette** (MANDATORY - Electric Storm variation)
- Dark navy background (#020617)
- Animated blue/cyan background blobs with glow effects
- Blue gradient icon containers with shadow glow
- Responsive form layout
- Icon-labeled inputs with blue accents
- Loading states with spinner
- Error handling with animations
- Full responsiveness (mobile → desktop)
- Glassmorphism card effect with dark backdrop
- Hover animations with blue highlights
- Dark slate text on dark backgrounds

This serves as a template for other pages in the application. All pages MUST follow this Dark Blue/Cyan aesthetic.

## 🎯 Key Takeaways - Always Use MCP

### The MCP-First Workflow

**EVERY UI task should start with MCP tools:**

1. **Search First**: `search_items_in_registries`
2. **Get Examples**: `get_item_examples_from_registries`
3. **View Code**: `view_items_in_registries`
4. **Customize**: Apply Dark Blue/Cyan palette
5. **Verify**: `get_audit_checklist`

### Why MCP + shadcn = Excellent UI Foundation

- ✅ **Responsive-Ready Structure** - Easy to make responsive with Tailwind
- ✅ **Quick Implementation** - Add responsive utilities as needed
- ✅ **Instant Components** - No npm install delays
- ✅ **Always Up-to-Date** - Latest shadcn versions
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Accessible** - WCAG compliant out of the box
- ✅ **Production Ready** - Used by major companies

### Remember

**ALWAYS prefer MCP tools over:**
- ❌ Manual component creation
- ❌ Copy-pasting from docs
- ❌ Writing responsive CSS
- ❌ Creating custom breakpoints
- ❌ Building from scratch

---

**Use this skill with MCP tools to create beautiful, modern, automatically responsive UI/UX that delights users across all devices!**
