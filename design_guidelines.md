# Design Guidelines (Project + QA)

## A) Project Theme Setup (EDIT THIS)
This section is the only place you are allowed to “design”. Everything else must reference these tokens.

### A1. Brand identity
- App name: **AMC Lost & Found**
- Style keywords: unique, premium, institutional, organic-rounded, glassmorphism
- Visual tone: Hyper-rounded surfaces (28px-32px), subtle backdrop blurs, cube micro-patterns, and large action-oriented buttons. The UI must feel like a dedicated institutional utility, not a generic web portal.

### A2. Typography tokens
Use only these sizes. Tracking should be tight (-0.01em) for headings.

**Type scale (tokens)**
- `text-display`: 28px / line-height 36px / weight 700 / tracking-tight
- `text-h1`: 22px / line-height 28px / weight 700 / tracking-tight
- `text-h2`: 18px / line-height 24px / weight 600 / tracking-tight
- `text-body`: 15px / line-height 22px / weight 400
- `text-small`: 12px / line-height 16px / weight 400
- `text-label`: 13px / line-height 18px / weight 600 (Used for UI labels and nav)

### A3. Spacing tokens (4px grid)
Allowed spacing values only:
- 4, 8, 12, 16, 24, 32, 40, 48, 64, 80

### A4. Layout tokens
- `containerMaxWidth`: 1120px
- `navbarHeight`: 64px
- `controlHeight`: 40px (Standard Height for buttons/inputs)
- `largeControlHeight`: 52px-60px (Used for main page CTAs)

### A5. Shape + Elevation pattern
Standardized radii pattern based on component scale:
- `radius-sm`: 8px (Small badges/inner elements)
- `radius-control`: 12px (Standard buttons, inputs, select fields)
- `radius-md`: 18px (Intermediate cards, dropdown menus)
- `radius-card`: 28px (Primary content cards)
- `radius-display`: 32px-40px (Hero panels, Auth cards, Page backgrounds)

### A6. Color tokens
- `bg`: `#f6f8fb`
- `surface`: `#ffffff`
- `text`: `#0f172a` (Deep Slate)
- `mutedText`: `#475569`
- `border`: `rgba(15,23,42,0.10)`
- `primary`: `#2563eb`
- `danger`: `#dc2626`
- `success`: `#16a34a`
- `warning`: `#f59e0b`

### A7. Button System (Strict Sizing)
All clickable actions must follow one of these four size profiles:
- **Small (btn-sm)**: 32px height / 8px radius. (Inline actions, micro-interactions)
- **Medium (btn-md)**: 40px height / 12px radius. (Default form buttons, standard navigation)
- **Large (btn-lg)**: 52px height / 18px radius. (Primary page CTAs, main form submissions)
- **Extra Large (btn-xl)**: 60px height / 24px radius. (Hero actions, Auth entry points)

---

## B) Build Quality Rules (GENERIC, DO NOT EDIT)

### B1. Select Component Standard
**CRITICAL**: Native `<select>` tags are FORBIDDEN in application pages.
- Always use the standardized `Select` component (based on `react-select`).
- Height must be exactly 40px.
- Radius must be exactly 12px (`radius-control`).

### B2. Shape Consistency
- All Inputs and Buttons must use `radius-control` (12px).
- All Primary Cards must use `radius-card` (28px).
- Navigation links must match the manual navbar style: `rounded-[12px]`.

### B3. vertical rhythm
- Page headers to content gap: 48px.
- Content section to section gap: 32px–48px.
- Internal card padding: 24px–40px (premium spacing).

---

## C) Design QA Checklist
- [ ] NO native `<select>` tags found in `src/pages`.
- [ ] All inputs and small buttons use `rounded-[12px]`.
- [ ] All page container cards use `rounded-[28px]` or `rounded-[32px]`.
- [ ] Typography matches the NEW display (28px) and label (13px) tokens.
- [ ] Backdrop cubes pattern is active on background.

---

## D) AI Instructions
1) Never use `@apply` on custom CSS classes within another class definition in `index.css`.
2) Do not change the Navbar (Manual User Design).
3) Prioritize the `Select.jsx` component for ALL dropdown interactions.
4) Maintain the "Scaling Radius" pattern: Small things = 12px, Big things = 28px+.
