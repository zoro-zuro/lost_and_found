# Complete UI Redesign Process — Full Instructions (v2.0)

**Status**: Ready to execute end-to-end redesign with component-first architecture.  
**Structure**: Component-based → Page-based → End-to-end testing → Backend integration.  
**Duration**: ~1-2 pages per iteration (components → page integration → UI/UX validation → backend).  
**Outcome**: Professional, pixel-perfect redesign with zero functionality loss and full backend integration.

---

## Folder Structure (Source of Truth)

```
client/redesign/
├── components/
│   ├── global_navbar/
│   │   ├── screen.png
│   │   └── code.html
│   ├── admin_navbar/
│   │   ├── screen.png
│   │   └── code.html
│   ├── universal_bg/
│   │   ├── screen.png
│   │   └── code.html
│   ├── profile_model/
│   │   ├── screen.png
│   │   └── code.html
│   ├── user_details_model/
│   │   ├── screen.png
│   │   └── code.html
│   └── loading_screen/
│       ├── screen.png
│       └── code.html
└── pages/
    ├── login_page/
    │   ├── screen.png
    │   └── code.html
    ├── register_page/
    │   ├── screen.png
    │   └── code.html
    ├── dashboard_page/
    │   ├── screen.png
    │   └── code.html
    ├── found&lost_directory_page/
    │   ├── screen.png
    │   └── code.html
    ├── found_items_details_page/
    │   ├── screen.png
    │   └── code.html
    ├── lost_items_details_page/
    │   ├── screen.png
    │   └── code.html
    ├── foundorlost_item_report_page/
    │   ├── screen.png
    │   └── code.html
    ├── admin_room_page/
    │   ├── screen.png
    │   └── code.html
    └── manage_reports_page/
        ├── screen.png
        └── code.html
```

---

## Phase 1: Pre-redesign Setup

### 1.1 Verify current state
```bash
cd <project-root>
pnpm install
pnpm lint
pnpm build
pnpm run dev  # Verify app runs and core flows work
```

**Checklist**:
- [ ] App starts without errors
- [ ] Can navigate between pages
- [ ] Auth works (login/logout)
- [ ] Key data loads (dashboards, lists, reports)
- [ ] Admin/user role functionality works

### 1.2 Create working branch
```bash
git checkout -b ui/redesign-v2
```

### 1.3 Map navbar locations
**Document where navbars are currently mounted**:
- Global navbar file: `<PATH>` (used by all users)
- Admin navbar file: `<PATH>` (used only by admins)
- Whether they're in layout route or per-page

**Navbar rules**:
- Global navbar appears on all pages EXCEPT login and register
- Admin navbar replaces global navbar when admin is logged in
- Navbar includes: profile button (opens profile_model), user name (opens user_details_model)
- Profile model and user_details_model are overlay modals

### 1.4 Extract global theme from Stitch
Open any Stitch design file:
- Identify colors (primary, secondary, bg, text, borders, overlay)
- Identify typography (font family, sizes, weights, line-height)
- Identify spacing rhythm (padding/margin multiples)
- Identify border radius, shadows, backdrop blur for modals
- Identify responsive breakpoints

**Create theme reference file** `docs/theme-tokens.md`:
```
# Theme Tokens

## Colors
- PRIMARY: #...
- SECONDARY: #...
- BG_PRIMARY: #...
- BG_SECONDARY: #...
- TEXT_PRIMARY: #...
- TEXT_SECONDARY: #...
- BORDER: #...
- ACCENT: #...
- OVERLAY_BG: rgba(...) (for modals)

## Typography
- FONT_FAMILY: "..." (e.g., "Inter, sans-serif")
- FONT_SIZE_XS: ...
- FONT_SIZE_SM: ...
- FONT_SIZE_BASE: ...
- FONT_SIZE_LG: ...
- FONT_SIZE_XL: ...

## Spacing (4px grid)
- SPACE: 4, 8, 12, 16, 20, 24, 32, ...

## Components
- BORDER_RADIUS_SM: 6px
- BORDER_RADIUS_MD: 8px
- BORDER_RADIUS_LG: 12px
- SHADOW_SM: ...
- SHADOW_MD: ...
- MODAL_BACKDROP: rgba(..., 0.5) + blur

## Responsive
- MOBILE: < 640px
- TABLET: 640px - 1024px
- DESKTOP: > 1024px
```

### 1.5 Identify used vs unused components
**Current code**:
```bash
# Find all component imports in pages/
grep -r "import.*from.*components" client/src/pages/
# Find all component declarations
find client/src/components -name "*.tsx" -o -name "*.jsx"
```

**Mark for removal after redesign**:
- Document unused components (will delete after redesign complete)

---

## Phase 2: Cascade Agent Setup

### 2.1 Create project rules file
**File**: `.windsurf/redesign-rules.md`

```markdown
# UI Redesign Project Rules (v2.0)

## Architecture
- **Component-first**: Build components → use in pages
- **Page structure**: Pages use components, no business logic in components
- **Modals**: profile_model and user_details_model are overlays (not full page)
- **Loading**: loading_screen shows skeleton based on page layout (not global)

## Component rules
- Global navbar: on all pages except login/register
- Admin navbar: replaces global navbar when admin logged in
- Modals (profile_model, user_details_model): overlay on current page, can close
- universal_bg: behind all content (excluding login/register)
- loading_screen: skeleton UI matching page layout

## Page rules
- Each page imports required components
- Each page passes data to components
- No hardcoded data
- No broken flows
- Login/register do NOT include navbar/universal_bg

## Core constraints
- Never break existing functionality
- Never change API contracts
- Always preserve component reusability
- All new backend integrations must be end-to-end
- Verify with `pnpm run dev` after each page

## Verification flow
1. Components → UI/UX validation
2. Pages → component integration + UI/UX validation
3. Backend → connect page to APIs
4. Full flow → test entire user journey
```

### 2.2 Create Tailwind config theme extension
**If not already done**, update `tailwind.config.ts`:
```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#...',
        secondary: '#...',
        'bg-primary': '#...',
        'text-primary': '#...',
      },
      fontFamily: {
        base: '...',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
      },
    },
  },
}
```

---

## Phase 3: Component-First Redesign

### 3.1 Component build order
**Start with foundational components** (used by many pages):
1. **global_navbar** — used on most pages
2. **admin_navbar** — conditional rendering in navbar
3. **universal_bg** — background for all pages
4. **profile_model** — triggered from navbar
5. **user_details_model** — triggered from navbar
6. **loading_screen** — shown during page navigation

### 3.2 Component build prompt (copy-paste per component)

**Replace `<COMPONENT_NAME>` with actual component name.**

```
TASK: Build <COMPONENT_NAME> component from Stitch design. This is a reusable component (not a full page).

PHASE 1 — PREPARATION
1. Study these files:
   - Visual: client/redesign/components/<COMPONENT_NAME>/screen.png
   - Structure: client/redesign/components/<COMPONENT_NAME>/code.html

2. Identify:
   - What data this component receives (props)
   - What events it emits (onClick, onChange, callbacks)
   - Whether it's a modal (overlay) or regular component
   - Whether it's visible always or conditionally

3. Current location:
   - Component file: client/src/components/<COMPONENT_NAME>/index.tsx
   - Or create: client/src/components/<COMPONENT_NAME>.tsx

PHASE 2 — COMPONENT STRUCTURE
4. Design component interface (TypeScript):
   - Props: What data does it need?
   - Events: What callbacks does it need?
   - State: What local state (if any)?

5. Example for navbar component:
   - Props: {user, isAdmin, onLogout, onProfileClick, onUserDetailsClick}
   - Events: emit logout, profile click, user details click
   - State: none (stateless presentational component)

6. Example for modal component:
   - Props: {isOpen, data, onClose}
   - Events: emit close, emit actions
   - State: local form state if needed

PHASE 3 — IMPLEMENTATION
7. Create/update component file:
   - Import Stitch theme tokens from Tailwind config or globals
   - Build JSX matching Stitch design pixel-perfectly
   - Use Tailwind classes only (no inline styles)
   - Make component responsive (mobile/tablet/desktop)
   - Export clear prop interface

8. For modals:
   - Use overlay backdrop with backdrop-blur
   - Center content properly
   - Allow close on outside click or close button
   - Use z-index appropriately (z-50 for modals, z-40 for backdrops)

9. For navbar:
   - Sticky/fixed positioning
   - Responsive menu (hamburger on mobile if in design)
   - Profile button opens modal on click
   - User name text opens details modal on click

10. For loading_screen:
    - Show skeleton UI matching page layout
    - Use pulse animation
    - Hide when page data ready

PHASE 4 — COMPONENT VERIFICATION
11. Verify component (no backend needed yet):
    - Create a test/demo file showing component with mock data
    - Run: pnpm run dev
    - Check:
      - Layout matches Stitch screen.png
      - Responsive on mobile/tablet/desktop
      - All interactive elements respond to clicks
      - No TypeScript errors
      - No console errors
      - Proper spacing, alignment, shadows

12. UI/UX Validation Checklist:
    - [ ] Colors match theme tokens
    - [ ] Typography: font, size, weight, line-height correct
    - [ ] Spacing: padding, margin consistent (4px grid)
    - [ ] Alignment: text, icons, buttons aligned properly
    - [ ] Shadows: depth and blur correct
    - [ ] Border radius: corners match design
    - [ ] Hover states: visible and responsive
    - [ ] Focus states: keyboard navigation works
    - [ ] No visual flaws: no overflow, cutoff, or misalignment
    - [ ] Mobile: scales properly, touch targets >44px
    - [ ] Tablet: layout adapts, readable
    - [ ] Desktop: full width used, not cramped

OUTPUT
- Component created/updated: <COMPONENT_NAME>
- Props interface defined
- Mock data test file created (for verification)
- All Stitch design elements replicated
- UI/UX validation passed (list checks)
- No TypeScript or console errors
- Ready for pages to use

CONSTRAINTS
- Do not add backend API calls in component (will do in page)
- Do not add business logic (only presentation)
- Keep component reusable (avoid hard-coded data)
- Make all text/data dynamic (accept as props)
- Component should work with mock data for testing
```

### 3.3 Components to build (detailed)

#### Component 1: global_navbar
**Purpose**: Navigation bar for all users (except login/register)  
**Props**: 
- `user`: {name, avatar, role}
- `onProfileClick`: () => void
- `onUserDetailsClick`: () => void
- `onLogout`: () => void

**Features**:
- Logo/app name on left
- Navigation links (dashboard, found/lost directory, manage reports)
- Profile button (shows avatar) → opens profile_model on click
- User name text → opens user_details_model on click
- Logout button

#### Component 2: admin_navbar
**Purpose**: Navigation bar for admins  
**Props**: Same as global_navbar + `onAdminRoomClick`

**Features**:
- Same as global_navbar
- Additional "Admin Room" button (admin only)

#### Component 3: universal_bg
**Purpose**: Background wrapper for all pages (except login/register)  
**Props**: `children`, `className`

**Features**:
- Full-screen background
- Gradient or color matching Stitch theme
- All pages wrap content in this component

#### Component 4: profile_model
**Purpose**: Overlay modal showing user profile options  
**Props**: `isOpen`, `user`, `onClose`, `onEditProfile`, `onSettings`

**Features**:
- Overlay backdrop (semi-transparent, clickable to close)
- Modal centered on screen
- Profile info (avatar, name, email, role)
- Action buttons (edit profile, settings, etc.)
- Close button

#### Component 5: user_details_model
**Purpose**: Overlay modal showing detailed user information  
**Props**: `isOpen`, `user`, `onClose`

**Features**:
- Similar to profile_model
- Show more detailed user info
- May be read-only or editable

#### Component 6: loading_screen
**Purpose**: Page loading skeleton matching layout  
**Props**: `isLoading`, `layoutType` (dashboard/list/details/form)

**Features**:
- Show skeleton UI based on layout type
- Pulse animation
- Hides when page data loads
- Different skeleton layouts:
  - dashboard: skeleton cards + stats
  - list: skeleton rows
  - details: skeleton header + content
  - form: skeleton input fields

---

## Phase 4: Page-by-Page Redesign

### 4.1 Page build order

**Ordered by complexity and dependencies**:
1. **login_page** — no navbar, simple form
2. **register_page** — no navbar, form with tabs
3. **dashboard_page** — global navbar, common page
4. **found&lost_directory_page** — global navbar, tabs, list
5. **found_items_details_page** — global navbar, details + modals
6. **lost_items_details_page** — global navbar, details + modals
7. **foundorlost_item_report_page** — global navbar, form
8. **manage_reports_page** — global navbar, list + manage
9. **admin_room_page** — admin navbar, admin-only page

### 4.2 Page build flow (for each page)

```
STEP 1: BUILD COMPONENTS
  └─ Create/update components this page needs
     └─ Verify components with mock data
        └─ UI/UX validation

STEP 2: INTEGRATE COMPONENTS INTO PAGE
  └─ Create/update page component
  └─ Import required components
  └─ Pass mock data initially
  └─ Test layout and interactions

STEP 3: UI/UX FINAL VALIDATION
  └─ Pixel-perfect match with Stitch screen.png
  └─ Responsive check (mobile/tablet/desktop)
  └─ Spacing, alignment, shadows, colors
  └─ No visual flaws

STEP 4: BACKEND INTEGRATION
  └─ Connect to real APIs
  └─ Replace mock data with actual data
  └─ Add loading states (loading_screen)
  └─ Add error handling
  └─ Add success/failure messages

STEP 5: END-TO-END TESTING
  └─ Run pnpm run dev
  └─ Navigate entire page flow
  └─ Test all interactions
  └─ Verify data loads/updates/deletes correctly
  └─ Check performance
  └─ Check for console errors

STEP 6: USER CONSENT & COMMIT
  └─ Review changes with user
  └─ Get approval to move to next page
  └─ Commit to git
```

### 4.3 Page build prompt (copy-paste per page)

**Replace `<PAGE_NAME>` and `<NAVBAR_TYPE>` with actual values.**

```
TASK: Redesign <PAGE_NAME> page from Stitch design end-to-end.

PHASE 1 — PREPARATION
1. Study Stitch design:
   - Visual: client/redesign/pages/<PAGE_NAME>/screen.png
   - Structure: client/redesign/pages/<PAGE_NAME>/code.html

2. Current page file:
   - client/src/pages/<PAGE_NAME>.tsx (or equivalent route)

3. Components this page uses:
   - [LIST COMPONENTS NEEDED]
   - Ensure all are already built and verified

4. Identify:
   - What data page displays (from hooks/API calls)
   - What user actions are possible (buttons, forms, navigation)
   - What modals/overlays exist (profile_model, user_details_model)
   - Whether navbar needed (<NAVBAR_TYPE>)

PHASE 2 — COMPONENT INTEGRATION
5. Update page component:
   - Import all required components
   - Add navbar at top (unless login/register)
   - Wrap content in universal_bg (unless login/register)
   - Import and use loading_screen while fetching

6. Structure for non-login/register pages:
   ```
   <universal_bg>
     <Navbar user={user} ... />
     <main>
       {isLoading && <LoadingScreen layoutType="..." />}
       {!isLoading && <PageContent ... />}
     </main>
     <ProfileModel isOpen={...} user={user} onClose={...} />
     <UserDetailsModel isOpen={...} user={user} onClose={...} />
   </universal_bg>
   ```

7. Structure for login/register:
   ```
   <main>
     <LoginForm /> or <RegisterForm />
   </main>
   ```

PHASE 3 — LAYOUT & STYLING
8. Replace page JSX:
   - Keep: all imports, hooks, handlers, API calls, state management
   - Replace: layout structure, Tailwind classes, page wrappers
   - Match: Stitch design pixel-perfectly

9. Use Tailwind classes:
   - Colors from theme tokens
   - Spacing on 4px grid
   - Typography consistent with theme
   - Responsive design (mobile-first)

10. Testing (with mock data first):
    - Import mock data
    - Render page with mock data
    - Run: pnpm run dev
    - Verify layout matches Stitch screen.png

PHASE 4 — UI/UX VALIDATION
11. Detailed validation:
    - [ ] Layout matches Stitch design
    - [ ] Colors: all match theme tokens
    - [ ] Typography: font, size, weight correct
    - [ ] Spacing: padding/margin on 4px grid, consistent
    - [ ] Alignment: all elements properly aligned
    - [ ] Shadows: depth and blur correct
    - [ ] Border radius: corners match design
    - [ ] Hover/focus states: visible, responsive
    - [ ] Responsive: mobile/tablet/desktop proper layout
    - [ ] Modals: centered, proper backdrop blur
    - [ ] Loading skeleton: matches page layout
    - [ ] No visual flaws: no overflow, cutoff, misalignment
    - [ ] Touch targets: buttons >44px on mobile

12. Visual flaws check:
    - Zoom in 200%: check for pixelation, misalignment
    - Check RTL (if multilingual): text direction correct
    - Dark mode (if supported): colors contrast good
    - Print preview (if needed): layout works in print

PHASE 5 — BACKEND INTEGRATION
13. Connect to real APIs:
    - Replace mock data with actual API calls
    - Use existing hooks (useFetchData, useMutation, etc.)
    - Keep all error handling
    - Show loading_screen while fetching
    - Show error state if fetch fails

14. For each user action:
    - Identify API endpoint needed
    - Check if endpoint exists (backend)
    - If not exists: implement backend first (schema, validation, route, handler)
    - Connect frontend to endpoint
    - Add error handling, success messages

15. State management:
    - Keep all existing state logic
    - Don't change how data flows
    - Don't change how mutations work
    - Just wire up to real APIs

PHASE 6 — FULL FUNCTIONALITY TEST
16. End-to-end testing:
    - Run: pnpm run dev
    - Navigate to /<PAGE_NAME>
    - Test every interactive element:
      - Click buttons → correct action happens
      - Fill forms → validation works
      - Submit forms → data saved to backend
      - Navigate away and back → data persists
      - Refresh page → data still there
    - Test error cases:
      - Invalid input → error message shown
      - API fails → error state shown
      - No data → empty state shown
    - Test auth:
      - Check role access (admin vs user)
      - Check if redirected if not authorized
    - Test loading:
      - Loading skeleton appears while fetching
      - Skeleton disappears when data arrives

17. Performance check:
    - Page loads in <2 seconds
    - No excessive re-renders
    - No memory leaks
    - No unhandled console errors

18. Verification checklist (see template below):
    - [ ] All checks passed
    - [ ] Layout matches Stitch
    - [ ] All functionality works
    - [ ] Backend connected
    - [ ] No console errors
    - [ ] Navbar present (if not login/register)
    - [ ] UI/UX professional quality

OUTPUT
- Page updated: <PAGE_NAME>
- Components imported and used: [LIST]
- Stitch design replicated pixel-perfectly
- UI/UX validation passed (detail all checks)
- Backend integration complete
- End-to-end testing passed
- All files changed listed
- Ready for next page

CONSTRAINTS
- Do not change API contracts
- Do not break existing functionality
- Do not add useless UI components
- Do not hardcode any data
- Always use real data from backend
- Always show loading/error states
- Always keep navbar (except login/register)
- Always verify with pnpm run dev
```

---

## Phase 5: Cleanup & Finalization

### 5.1 Remove unused components
After all pages are done:
```bash
# Delete unused components identified in Phase 1.5
rm client/src/components/<UNUSED_COMPONENT>.tsx
rm -rf client/src/components/<UNUSED_COMPONENT>/

# Run lint to ensure no orphaned imports
pnpm lint

# Fix any import errors
pnpm lint --fix
```

### 5.2 Final build verification
```bash
pnpm lint
pnpm build
pnpm run dev
```

**Checklist**:
- [ ] `pnpm lint` passes (zero errors/warnings)
- [ ] `pnpm build` succeeds
- [ ] `pnpm run dev` starts without errors
- [ ] App fully functional end-to-end

### 5.3 Full user flow test
```bash
# Test complete user journey
1. Start on login page
   - [ ] Layout matches design
   - [ ] Form works
   - [ ] Login successful → redirect to dashboard

2. On dashboard
   - [ ] Navbar present
   - [ ] Profile button works (opens profile_model)
   - [ ] User name works (opens user_details_model)
   - [ ] All navigation links work
   - [ ] Data displays correctly

3. Navigate to found/lost directory
   - [ ] Layout matches design
   - [ ] Tabs switch correctly
   - [ ] List displays
   - [ ] Click item → details page opens

4. On details page
   - [ ] All info displays
   - [ ] Buttons work
   - [ ] Report item → form opens

5. On report form
   - [ ] Form fields work
   - [ ] Validation works
   - [ ] Submit → success message
   - [ ] Back to previous page

6. On manage reports
   - [ ] User's reports listed
   - [ ] Can manage claims
   - [ ] Can update status

7. Admin flow (if admin user)
   - [ ] Admin navbar appears (replaces global navbar)
   - [ ] Admin room button available
   - [ ] Admin room page has proper access control
   - [ ] Can manage admin-only reports

8. Logout
   - [ ] Logout button works
   - [ ] Redirected to login
   - [ ] Session cleared
```

### 5.4 Create PR and merge
```bash
git log --oneline ui/redesign-v2 origin/main  # Review all commits
git push origin ui/redesign-v2
# Create PR on GitHub
# Add link to this redesign-full.md in PR description
# Add full user flow test checklist in PR
# Merge after review
```

---

## TODO List Template

Create `docs/redesign-todo.md`:

```markdown
# UI Redesign TODO — Comprehensive Checklist

## Phase 1: Setup ✓
- [x] Verify current app state
- [x] Create ui/redesign-v2 branch
- [x] Map navbar locations
- [x] Extract theme tokens
- [x] Document unused components

## Phase 2: Components
### Components to build
- [ ] global_navbar
  - [ ] Build component
  - [ ] UI/UX validation
  - [ ] Mock data test
  - [ ] Ready for pages

- [ ] admin_navbar
  - [ ] Build component
  - [ ] UI/UX validation
  - [ ] Mock data test
  - [ ] Ready for pages

- [ ] universal_bg
  - [ ] Build component
  - [ ] UI/UX validation
  - [ ] Mock data test
  - [ ] Ready for pages

- [ ] profile_model
  - [ ] Build component
  - [ ] UI/UX validation
  - [ ] Mock data test
  - [ ] Ready for pages

- [ ] user_details_model
  - [ ] Build component
  - [ ] UI/UX validation
  - [ ] Mock data test
  - [ ] Ready for pages

- [ ] loading_screen
  - [ ] Build component (dashboard layout)
  - [ ] Build component (list layout)
  - [ ] Build component (details layout)
  - [ ] Build component (form layout)
  - [ ] UI/UX validation
  - [ ] Mock data test
  - [ ] Ready for pages

## Phase 3: Pages
### Page 1: login_page
- [ ] Layout redesign (Stitch design)
- [ ] UI/UX validation
- [ ] Backend integration
- [ ] End-to-end testing
- [ ] User consent
- [ ] Commit: redesign(login_page)

### Page 2: register_page
- [ ] Layout redesign (Stitch design)
- [ ] Tab switching works
- [ ] UI/UX validation
- [ ] Backend integration
- [ ] End-to-end testing
- [ ] User consent
- [ ] Commit: redesign(register_page)

### Page 3: dashboard_page
- [ ] Layout redesign (Stitch design)
- [ ] Navbar integration
- [ ] Components used: [global_navbar, universal_bg, profile_model, user_details_model, loading_screen]
- [ ] UI/UX validation
- [ ] Backend integration (fetch dashboard data)
- [ ] End-to-end testing
- [ ] User consent
- [ ] Commit: redesign(dashboard_page)

### Page 4: found&lost_directory_page
- [ ] Layout redesign (Stitch design)
- [ ] Navbar integration
- [ ] Tab switching (found/lost)
- [ ] Components used: [global_navbar, universal_bg, profile_model, user_details_model, loading_screen]
- [ ] UI/UX validation
- [ ] Backend integration (fetch items)
- [ ] End-to-end testing
- [ ] User consent
- [ ] Commit: redesign(found&lost_directory_page)

### Page 5: found_items_details_page
- [ ] Layout redesign (Stitch design)
- [ ] Navbar integration
- [ ] Components used: [global_navbar, universal_bg, profile_model, user_details_model, loading_screen]
- [ ] UI/UX validation
- [ ] Backend integration (fetch item details)
- [ ] End-to-end testing
- [ ] User consent
- [ ] Commit: redesign(found_items_details_page)

### Page 6: lost_items_details_page
- [ ] Layout redesign (Stitch design)
- [ ] Navbar integration
- [ ] Components used: [global_navbar, universal_bg, profile_model, user_details_model, loading_screen]
- [ ] UI/UX validation
- [ ] Backend integration (fetch item details)
- [ ] End-to-end testing
- [ ] User consent
- [ ] Commit: redesign(lost_items_details_page)

### Page 7: foundorlost_item_report_page
- [ ] Layout redesign (Stitch design)
- [ ] Navbar integration
- [ ] Form fields matching design
- [ ] Components used: [global_navbar, universal_bg, profile_model, user_details_model, loading_screen]
- [ ] UI/UX validation
- [ ] Backend integration (submit report)
- [ ] End-to-end testing
- [ ] User consent
- [ ] Commit: redesign(foundorlost_item_report_page)

### Page 8: manage_reports_page
- [ ] Layout redesign (Stitch design)
- [ ] Navbar integration
- [ ] List of user's reports
- [ ] Components used: [global_navbar, universal_bg, profile_model, user_details_model, loading_screen]
- [ ] UI/UX validation
- [ ] Backend integration (fetch/update reports)
- [ ] End-to-end testing
- [ ] User consent
- [ ] Commit: redesign(manage_reports_page)

### Page 9: admin_room_page
- [ ] Layout redesign (Stitch design)
- [ ] Admin navbar integration (replaces global navbar)
- [ ] Components used: [admin_navbar, universal_bg, profile_model, user_details_model, loading_screen]
- [ ] Access control (admin only)
- [ ] UI/UX validation
- [ ] Backend integration (fetch admin reports)
- [ ] End-to-end testing
- [ ] User consent
- [ ] Commit: redesign(admin_room_page)

## Phase 4: Cleanup & Finalization
- [ ] Remove unused components
- [ ] pnpm lint passes
- [ ] pnpm build succeeds
- [ ] pnpm run dev runs
- [ ] Full user flow test passed
- [ ] Create PR
- [ ] PR reviewed
- [ ] PR merged to main

## TOTAL: All 9 pages completed ✓
```

---

## Page-by-Page Verification Template

Create `docs/page-verification-template.md`:

```markdown
# Page Verification Template — <PAGE_NAME>

## BUILD PHASE
### Component Integration
- [ ] All required components imported
- [ ] Components receiving correct props
- [ ] No prop type errors
- [ ] Navbar present (unless login/register)
- [ ] Modals properly wired to state

### Layout Structure
- [ ] Page structure matches Stitch design HTML
- [ ] wrapper/container hierarchy correct
- [ ] Responsive classes applied
- [ ] No hardcoded dimensions (use Tailwind)

## UI/UX VALIDATION PHASE

### Visual Matching
- [ ] Layout matches Stitch screen.png pixel-perfectly
- [ ] All sections present (header, body, footer, modals, etc.)
- [ ] Elements positioned correctly
- [ ] Content visible and readable

### Color & Theme
- [ ] All colors use theme tokens (primary, secondary, bg, text, etc.)
- [ ] Color contrast meets accessibility standard (4.5:1)
- [ ] Hover colors work (darkened/lightened appropriately)
- [ ] Borders, shadows consistent with theme

### Typography
- [ ] Font family: matches theme (should be consistent across app)
- [ ] Font sizes: scale correctly (xs, sm, base, lg, xl, 2xl)
- [ ] Font weights: normal, medium, semibold applied correctly
- [ ] Line height: readable, not cramped
- [ ] Letter spacing: consistent with theme

### Spacing & Alignment
- [ ] Padding on all containers (consistent 4px grid)
- [ ] Margins between sections (4px grid)
- [ ] Horizontal alignment: centered, left, right as designed
- [ ] Vertical alignment: top, center, bottom consistent
- [ ] No squished content, no excess whitespace

### Components
- [ ] All component interactive areas visible
- [ ] Buttons: proper size, touch target >44px on mobile
- [ ] Forms: fields labeled, proper spacing
- [ ] Lists: rows readable, proper hover state
- [ ] Cards: shadows, radius, borders correct

### Interactive States
- [ ] Hover states: buttons, links change color/opacity
- [ ] Focus states: keyboard navigation works, focus ring visible
- [ ] Active states: pressed buttons show feedback
- [ ] Disabled states: grayed out, not clickable

### Responsive Design
**Mobile (< 640px)**
- [ ] Single column layout
- [ ] Text readable (not too small)
- [ ] Buttons/inputs large enough to tap
- [ ] Navigation accessible (hamburger or scrollable)
- [ ] Images scale without distortion

**Tablet (640px - 1024px)**
- [ ] Two-column layout (if designed)
- [ ] Proper use of space
- [ ] Tables readable
- [ ] Navigation accessible

**Desktop (> 1024px)**
- [ ] Full width layout
- [ ] Sidebar/main content properly sized
- [ ] Whitespace balanced
- [ ] Not cramped or empty-looking

### Modals & Overlays
- [ ] Backdrop semi-transparent with blur
- [ ] Modal centered on screen
- [ ] Modal sized appropriately (not full width)
- [ ] Close button present and works
- [ ] Click outside closes (if designed)
- [ ] Z-index correct (modal above page)
- [ ] Scrollable if content overflows

### Loading States
- [ ] Loading skeleton appears while fetching
- [ ] Skeleton matches page layout (not generic)
- [ ] Pulse animation smooth
- [ ] Skeleton disappears when data loads
- [ ] No blank page during loading

### Error States
- [ ] Error message displayed clearly
- [ ] Error styling distinct (color, icon)
- [ ] Error message actionable (retry button if needed)
- [ ] Error doesn't break layout

### Empty States
- [ ] Empty state shown when no data
- [ ] Message clear (e.g., "No items found")
- [ ] Icon or image (if designed)
- [ ] CTA button present (e.g., "Create new")

### Accessibility
- [ ] All text has sufficient contrast
- [ ] Focus indicators visible (outline or highlight)
- [ ] Focus order logical (tab through)
- [ ] Forms have labels (screen reader friendly)
- [ ] Images have alt text
- [ ] Keyboard navigation works fully

### Performance
- [ ] Page loads quickly (< 2s)
- [ ] Smooth scrolling
- [ ] No layout shift (CLS low)
- [ ] Animations smooth (60fps)

### Console & Errors
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No console warnings (or documented)
- [ ] No React warnings

## FUNCTIONALITY TESTING PHASE

### Data Display
- [ ] Page loads with real data (not hardcoded)
- [ ] All data fields display
- [ ] Data formats correct (dates, numbers, text)
- [ ] Empty values handled gracefully

### User Interactions
- [ ] Buttons trigger correct actions
- [ ] Forms can be filled (all fields)
- [ ] Form validation works (shows errors)
- [ ] Form submission works (posts to backend)
- [ ] Navigation links work
- [ ] Tab switching works (if tabs)
- [ ] Sorting/filtering works (if available)
- [ ] Search works (if available)

### Backend Integration
- [ ] API calls made to correct endpoints
- [ ] Request data sent correctly
- [ ] Response data processed correctly
- [ ] Error responses handled
- [ ] Loading state shown while fetching
- [ ] Success/failure messages shown
- [ ] No duplicate API calls

### State Management
- [ ] Page state updates correctly
- [ ] User state (login) maintained
- [ ] Data state (list, details) accurate
- [ ] Modal states (open/close) work
- [ ] No unintended side effects

### Navigation
- [ ] Can navigate to this page
- [ ] Can navigate away from page
- [ ] Browser back button works
- [ ] Navbar links work
- [ ] Page redirects work (auth, role-based)

### Auth & Permissions
- [ ] User can access if authorized
- [ ] User redirected if not authorized
- [ ] Admin features hidden from users
- [ ] User features hidden from admins (if applicable)

## COMMIT & CLEANUP

- [ ] All changes committed with clear message: `redesign(<PAGE_NAME>): [description]`
- [ ] Commit message includes:
  - [ ] Components used
  - [ ] Backend endpoints connected
  - [ ] Any breaking changes (none expected)

- [ ] Code cleanup:
  - [ ] No console.log() left (use in dev, remove before commit)
  - [ ] No TODO comments without context
  - [ ] No commented-out code

## SIGN-OFF

- [ ] All checks passed
- [ ] Layout matches Stitch design
- [ ] All functionality works
- [ ] Backend connected
- [ ] No visual flaws
- [ ] No console errors
- [ ] User approved/consented

**Status**: READY FOR NEXT PAGE

**Date completed**: ___________
**Reviewer**: ___________
```

---

## Common Issues & Fixes

### Issue: Navbar missing on page
**Fix**: Ensure page imports navbar component and renders it at top (before page content). If using layout route, check that route wrapper includes navbar.

### Issue: Components not rendering
**Fix**: Check imports (file path, export syntax). Check props being passed match component interface. Check for conditional rendering logic.

### Issue: Modals not opening
**Fix**: Check state management (isOpen state correct). Check onClick handlers wired to state setter. Check z-index (backdrop z-40, modal z-50).

### Issue: Data not displaying
**Fix**: Check API call is made and returns data. Check data is stored in state. Check JSX renders data (not mock). Check for null/undefined handling.

### Issue: API call fails
**Fix**: Check endpoint URL is correct. Check request body matches backend schema. Check authentication token sent. Check error handling shows error state.

### Issue: pnpm run dev fails to start
**Fix**: Run `pnpm lint` to find errors. Check for TypeScript errors. Check for import errors. Revert last commit if stuck.

### Issue: Styling doesn't match Stitch
**Fix**: Compare Tailwind classes with Stitch design. Check theme tokens applied. Compare colors, spacing, typography. Use browser DevTools to inspect computed styles.

### Issue: Layout broken on mobile
**Fix**: Check responsive classes (sm:, md:, lg:). Test on actual mobile device or use browser DevTools device emulation. Adjust breakpoints if needed.

---

## How to Use This Document

### For you (developer):
1. **Pre-redesign**: Complete Phase 1 once
2. **For each component**: Use component build prompt (Phase 3.2)
3. **For each page**: Use page build prompt (Phase 4.3)
4. **After each page**: Use verification template from Phase 5
5. **Post-redesign**: Complete Phase 5 cleanup

### Structure:
- **Components first** (foundational, reusable)
- **Pages second** (use components, integrate, test)
- **Backend third** (connect to real APIs)
- **Testing final** (end-to-end verification)

### Cascade agent usage:
- Copy component prompt → paste in Cascade → let it build
- Copy page prompt → paste in Cascade → let it build
- After each, run `pnpm run dev` manually to verify

---

## Success Criteria

✅ **Component complete when**:
- Built from Stitch design
- Accepts props (reusable)
- Works with mock data
- UI/UX validation passed
- No TypeScript errors
- Ready for pages to use

✅ **Page complete when**:
- Layout matches Stitch design
- Components integrated
- UI/UX validation passed
- Backend connected
- All functionality works
- No console errors
- User consented

✅ **Redesign complete when**:
- All 9 pages done
- Full user flow test passed
- `pnpm build` succeeds
- `pnpm lint` passes
- Ready to merge

---

**Created**: 2026-01-29  
**Status**: Ready to use  
**Version**: 2.0 (Component-first architecture)
