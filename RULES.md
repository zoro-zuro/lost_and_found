# AMC Lost & Found - Redesign Rules & Guidelines

## 🎯 Core Design Philosophy

### 1. Container & Layout Rules
- **Global Container**: Always use `max-w-[1140px] mx-auto` for main content containers
- **Screen Fit**: Everything must fit in one screen - no page-level overflow
- **Container Height**: Use `h-[85vh] max-h-[800px]` for consistent viewport usage
- **Flexible Content**: Content should expand/contract naturally, not be fixed height

### 2. Space Usage Principles
- **No Wasted Space**: Every pixel should serve a purpose
- **Medium Density**: Avoid oversized/zoomed UI - maintain professional density
- **Proper Padding**: Use responsive padding patterns:
  - `p-4 md:px-6 md:py-4 lg:px-8 lg:py-6` for main containers
  - `p-4 md:p-6 lg:p-8` for sections
- **Smart Margins**: Use `mb-4 md:mb-6`, `mt-4 md:mt-6` for consistent spacing

### 3. Width Ratios for Authentication Pages
- **Login Page**: Form 60% (`lg:w-[60%]`) + Design 40% (`lg:left-[60%]`)
- **Register Page**: Form 43% (`lg:w-[43%]`) + Design 57% (`lg:left-[43%]`)
- **Mobile**: Form takes full width, design overlay hidden (`hidden lg:flex`)

## 📱 Responsive Design Rules

### 1. Breakpoint Strategy
- **Mobile First**: Start with mobile layout, enhance for larger screens
- **Tablet**: `md:` prefix for medium screens (768px+)
- **Desktop**: `lg:` prefix for large screens (1024px+)
- **Progressive Enhancement**: Add features, don't remove them

### 2. Responsive Typography
- **Headings**: `text-xl md:text-xl lg:text-2xl` (scale up, not down)
- **Body Text**: `text-sm md:text-sm lg:text-base`
- **Labels**: `text-xs` consistently across all sizes
- **Buttons**: `text-xs md:text-sm` - maintain readability

### 3. Responsive Spacing
- **Grid Layout**: `grid-cols-1 md:grid-cols-2` (single to double column)
- **Gap Spacing**: `gap-3 md:gap-4` (tighter on mobile)
- **Input Padding**: `px-3 py-2` (consistent, not too large on mobile)

## 🎨 Design System Rules

### 1. Color & Visual Hierarchy
- **No Dark Mode**: Never use `dark:` variants or dark mode toggles
- **Glass Panels**: Use `glass-panel` class for main content areas
- **Mesh Background**: Always use `mesh-bg-full` for page backgrounds
- **Consistent Shadows**: `shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)]` for containers

### 2. Component Patterns
- **Form Inputs**: `bg-white/60 border border-white/40 rounded-xl px-3 py-2`
- **Buttons**: `bg-royal-blue hover:bg-blue-600 text-white font-bold py-3`
- **Tab Switchers**: `bg-white/40 p-1 rounded-2xl border border-white/30`
- **Error Messages**: `text-red-500 text-xs mt-1 ml-1`

### 3. Animation & Interactions
- **Subtle Animations**: Use `animate-bounce-subtle`, `animate-wave-flow`
- **Hover States**: `hover:scale-105 transition-transform duration-500`
- **Focus States**: `focus:ring-2 focus:ring-primary focus:border-transparent`
- **Loading States**: Show loading text and disable buttons appropriately

## 🚫 Content Management Rules

### 1. Overflow Handling
- **Never Hide Overflow**: Don't use `overflow-hidden` to cut content
- **Internal Scrolling**: Use `overflow-y-auto scrollbar-hide` for form sections
- **Flexible Heights**: Let content determine height, don't force fixed heights
- **Responsive Content**: Content should adapt, not be cut off

### 2. Field Management
- **Remove Unnecessary Fields**: If a field doesn't add value, remove it
- **Group Related Fields**: Use 2-column grids for related inputs
- **Password Confirmation**: Always split password into two columns with confirmation
- **Smart Validation**: Real-time validation with clear error messages

### 3. Content Priority
- **Form First**: Authentication forms are the primary focus
- **Design as Enhancement**: Visual elements should enhance, not compete
- **Progressive Disclosure**: Show essential info first, details on scroll

## 🔧 Technical Implementation Rules

### 1. Tailwind CSS v4 Usage
- **CSS-First Theme**: Use `@theme` block, never `tailwind.config.js`
- **Utility Classes**: Prefer utility classes over custom CSS
- **Responsive Prefixes**: Always include responsive prefixes for consistency
- **Component Consistency**: Use the same classes across similar components

### 2. Component Structure
```
Container (max-w-[1140px])
├── Main Container (h-[85vh] max-h-[800px])
│   ├── Form Section (width% based on page)
│   │   ├── Header
│   │   ├── Tab Switcher (if needed)
│   │   ├── Form Fields
│   │   └── Actions
│   └── Design Overlay (remaining width%)
│       ├── Wavy Separator
│       ├── Animated Elements
│       └── Illustration
```

### 3. State Management
- **Form Data**: Use consistent state structure across forms
- **Error Handling**: Centralized error state with field-specific errors
- **Loading States**: Show loading indicators during async operations
- **Success Messages**: Clear success feedback with navigation

## 📐 Space Optimization Rules

### 1. Form Layout
- **Compact Headers**: Remove unnecessary icons and reduce header sizes
- **Tight Spacing**: Use `space-y-3 md:space-y-5` instead of larger gaps
- **Smart Grids**: Use `md:col-span-2` for fields that need full width
- **Button Placement**: Use `md:mt-8` for proper button spacing on desktop

### 2. Design Overlay
- **Proper Positioning**: Use `absolute inset-0 lg:left-[X%]` for overlay
- **Pointer Events**: Use `pointer-events-none` for non-interactive design
- **Responsive Sizing**: Scale illustrations appropriately (`w-64 h-64`)
- **Animation Timing**: Stagger animations with different delays

### 3. Content Adaptation
- **Mobile Full Width**: Form takes `w-full` on mobile
- **Desktop Split**: Use percentage-based widths for consistency
- **Content Flow**: Use `justify-start` for top-aligned content
- **Scroll Management**: Internal scrolling only when necessary

## ✅ Quality Assurance Checklist

### Before Finalizing Any Page:
- [ ] Uses `max-w-[1140px] mx-auto` container
- [ ] Fits in one screen without overflow
- [ ] Responsive on mobile, tablet, desktop
- [ ] Proper width ratios (60:40 for login, 43:57 for register)
- [ ] No dark mode variants
- [ ] Consistent spacing and typography
- [ ] Form validation works properly
- [ ] Loading states implemented
- [ ] Design elements don't interfere with functionality
- [ ] Content can expand/contract naturally

### Common Pitfalls to Avoid:
- ❌ Fixed heights that don't adapt to content
- ❌ Hiding overflow instead of managing content
- ❌ Inconsistent container widths
- ❌ Dark mode classes or toggles
- ❌ Oversized/zoomed UI elements
- ❌ Breaking responsive design patterns
- ❌ Inconsistent spacing patterns
- ❌ Missing loading or error states

## 🎯 Design Goals

1. **Professional Appearance**: Clean, modern, trustworthy interface
2. **Excellent UX**: Intuitive navigation, clear feedback, smooth interactions
3. **Responsive Design**: Perfect experience on all device sizes
4. **Performance**: Fast loading, smooth animations, efficient code
5. **Accessibility**: Semantic HTML, proper contrast, keyboard navigation
6. **Maintainability**: Consistent patterns, clear structure, documented rules

---

*Remember: These rules are not restrictions - they're guidelines for creating consistent, professional, and user-friendly interfaces that follow the established design system.*
