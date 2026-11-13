# Admin liquid glass integration

The existing Vite project already supports TypeScript, Tailwind CSS v4, and the shadcn component structure. No setup or dependency installation is required for this integration.

- UI components: `src/components/ui`, imported as `@/components/ui`.
- The root `components` symlink points to `src/components`, so `components/ui` resolves to the same folder. Keep the actual sources in `src/components/ui`; this matches `components.json`, TypeScript paths, and the Vite alias, and avoids maintaining two copies.
- Global styles: `src/index.css`. Admin theme rules are scoped under `.admin-glass`.
- Component: `src/components/ui/liquid-glass-navbar.tsx`.
- Standalone example: `src/components/ui/liquid-glass-navbar-demo.tsx`, served at `/demo/liquid-navbar`. The existing `/demo` is preserved.

The navbar uses React and browser APIs only. The admin uses the existing `lucide-react` dependency and club logo. It requires no additional context provider, images, remote assets, or state library.

`AdminDashboard.jsx` owns the selected lookup method. It passes a controlled `active` index and three items (QR scan, name search, registration number) to the navbar. `onChange` switches the existing lookup panel and clears the selected attendee. Supabase authentication and registration updates remain in the dashboard.

The navbar supports controlled or uncontrolled selection, custom labels/icons/links, light or dark tone, optional compact mode, and optional synthesized audio (off in admin). On narrow screens it shows icons with accessible names; the lookup panel repeats the active method as a visible heading. Arrow keys, Home and End change the selected item. The layout stacks check-in panels and converts the guest table to cards on mobile.

The supplied Waterline implementation retains water shader rendering, droplet physics, ripples, icon animations, CSS fallback, and optional refraction. The admin passes `refraction={false}` because SVG backdrop filters nested inside glass surfaces cause Chromium to hide sibling surfaces on mobile; navbar blur and WebGL water remain enabled. Mobile cards use translucent gradients without backdrop blur to prevent compositor gaps in tall panels. Integration adjustments add unique SVG filter IDs, WebGL and audio cleanup, context restoration, live reduced-motion preference handling, and per-item resize observation.

Validation: `npm run typecheck` and `npm run build`. Browser checks with mock data cover name and number lookup, check-in, keyboard navigation, responsive width, the login page, reduced-motion interaction, and the CSS fallback. Live credentials and physical camera scanning are not part of those checks.
