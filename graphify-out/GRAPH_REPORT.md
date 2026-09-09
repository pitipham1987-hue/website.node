# Graph Report - portal-giai-doan-2  (2026-09-09)

## Corpus Check
- 95 files · ~246,440 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 502 nodes · 704 edges · 46 communities (27 shown, 15 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.81)
- Token cost: 445,702 input · 78,651 output

## Community Hubs (Navigation)
- Portal Auth Routes & Session
- Slice Plans & Pure Resolvers
- Runtime Dependencies
- Landing Page Sections
- Supabase Client & Milestone Order
- Portal Dashboard Components
- Test Seed Data & Personas
- DB Schema Migrations & Triggers
- TypeScript Config
- Postgres Triggers & RLS Helpers
- weav.com Reference Layout Patterns
- E2E Playwright Login Setup
- Visual Style & Animation Rules
- Content & UI Check Guidelines
- Three-Layer Route Protection
- Dev Dependencies
- Admin Input Validation
- Env Vars & Supabase Hosted
- Karpathy Coding Principles
- Landing Page Architecture
- Portal Schema Tables
- DNK Logo Asset (Logogen)
- Phase 2 Admin Execution
- Dev / Test Commands
- Proxy & Supabase SSR Clients
- Admin Server Actions & Forms
- DNK Logo Asset (Logosmall)
- Portal Layout (no auth check)
- Database-Level Data Isolation
- Admin Queries & Home Page
- ESLint Config
- PostCSS Config
- Vietnamese Default Language
- Portal Animation Exclusion
- Portal Not-Found Message
- Landing SSG Independence
- Admin E2E Spec
- milestones Table
- projects Table
- updates Table
- profiles Table
- project_members Table

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 25 edges
2. `compilerOptions` - 16 edges
3. `DNK House Company Website` - 15 edges
4. `weav.com Reference Screenshot (Full Page)` - 15 edges
5. `vitest` - 10 edges
6. `lucide-react` - 9 edges
7. `Client portal (/portal)` - 9 edges
8. `scripts` - 8 edges
9. `ScrollReveal()` - 8 edges
10. `Landing Page Architecture` - 8 edges

## Surprising Connections (you probably didn't know these)
- `DNK House Company Website` --references--> `Site Structure (planned)`  [EXTRACTED]
  CLAUDE.md → .claude/rules/site-structure.md
- `DNK House Company Website` --references--> `Landing Page Architecture`  [EXTRACTED]
  CLAUDE.md → .claude/rules/architecture.md
- `DNK House Company Website` --references--> `Dev/build/test commands`  [EXTRACTED]
  CLAUDE.md → .claude/rules/commands-and-stack.md
- `DNK House Company Website` --references--> `DNK House ≠ weav.com content rule`  [EXTRACTED]
  CLAUDE.md → .claude/rules/content-guidelines.md
- `DNK House Company Website` --references--> `Karpathy code-behavior principles`  [EXTRACTED]
  CLAUDE.md → .claude/rules/karpathy-guidelines.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Three-layer portal access protection** — _claude_rules_portal_architecture_proxy, _claude_rules_portal_architecture_dal_session, _claude_rules_portal_architecture_rls [EXTRACTED 0.90]
- **Karpathy four code-behavior principles** — _claude_rules_karpathy_guidelines_think_before_coding, _claude_rules_karpathy_guidelines_prefer_simplicity, _claude_rules_karpathy_guidelines_surgical_changes, _claude_rules_karpathy_guidelines_goal_driven_execution [EXTRACTED 0.90]
- **Phase 2 admin execution setup (SDD in worktree with deferred DB tests)** — _claude_rules_project_status_phase2_admin_area, _claude_rules_project_status_subagent_driven_development, _claude_rules_project_status_git_worktree_phase2, _claude_rules_project_status_docker_deferred_tests, _claude_rules_project_status_model_by_role [EXTRACTED 0.85]
- **Ba lớp phòng thủ route + DB (proxy → DAL → RLS)** — docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_ba_lop_bao_ve, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_proxy_ts, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_dal_session, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_rls [EXTRACTED 1.00]
- **Luồng đăng nhập Google (login → OAuth → callback → trigger → portal)** — docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_luong_dang_nhap_google, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_route_login, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_login_button, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_route_auth_callback, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_handle_new_user, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_route_portal [EXTRACTED 1.00]
- **5 bảng schema portal (profiles, projects, project_members, milestones, updates)** — docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_profiles, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_projects, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_project_members, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_milestones, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_updates [EXTRACTED 1.00]

## Communities (46 total, 15 thin omitted)

### Community 0 - "Portal Auth Routes & Session"
Cohesion: 0.06
Nodes (46): roleToScreen(role) (thuần), GET(), GET(), LoginPage(), PortalLayout(), signOut(), ActionState, initialActionState (+38 more)

### Community 1 - "Slice Plans & Pure Resolvers"
Cohesion: 0.06
Nodes (40): Slice 1 plan (8 task), DAL dùng supabase.auth.getUser() xác thực JWT (không tin getSession server), resolveClientAccess(profile) (thuần), Slice 2 plan (8 task), milestoneProgress({done,total}) — thuần, total<=0 → 0, Slice 3 plan (6 task), src/app/portal/error.tsx (use client, prop retry), formatVnDate tự viết, không thêm dayjs/date-fns (+32 more)

### Community 2 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (34): nextConfig, dependencies, framer-motion, lucide-react, next, react, react-dom, server-only (+26 more)

### Community 3 - "Landing Page Sections"
Cohesion: 0.10
Nodes (23): framer-motion, lucide-react, react, About(), TODO: số liệu placeholder — thay bằng con số thật của DNK House trước khi…, STATS, CtaBanner(), Footer() (+15 more)

### Community 4 - "Supabase Client & Milestone Order"
Cohesion: 0.09
Nodes (22): @supabase/ssr, vitest, LoginButton(), handleClick(), MilestoneOrder, reorderMilestones(), createClient(), CompositeTypes (+14 more)

### Community 5 - "Portal Dashboard Components"
Cohesion: 0.13
Nodes (17): server-only, PortalPage(), ProjectDetailPage(), MilestoneList(), PendingNotice(), ProjectCard(), UpdatesFeed(), formatVnDate() (+9 more)

### Community 6 - "Test Seed Data & Personas"
Cohesion: 0.08
Nodes (25): Migration 20260828000003_portal_rls.sql, 4 user seed (admin/client-a/client-b/pending, mật khẩu portal-dev-123), Supabase local (Docker) cho test integration/E2E, tests/helpers/supabase.ts (signInAs, serviceClient, IDS), vitest.config.ts (fileParallelism:false, node env, alias @/), Persona seed client-c@dnkhouse.test (client, 0 dự án) cho màn thông báo trống, ProjectListItem interface, Phân rã 4 slice dọc tuần tự (+17 more)

### Community 7 - "DB Schema Migrations & Triggers"
Cohesion: 0.10
Nodes (24): Migration 20260828000002_portal_functions_triggers.sql, Migration 20260828000001_portal_schema.sql, Hàm helper RLS SECURITY DEFINER + set search_path (tránh đệ quy RLS), seed.sql UPDATE done_at cho mốc done (trigger chỉ chạy before-update), File "use server" chỉ export async — hàm thuần phải ở file khác, handle_new_user() trigger, is_admin(), is_project_member(pid uuid) (+16 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "Postgres Triggers & RLS Helpers"
Cohesion: 0.12
Nodes (12): public.handle_new_user, public.prevent_role_self_change, public.set_milestone_done_at, public.set_updated_at, milestones_set_done_at, on_auth_user_created, profiles_prevent_role_self_change, projects_set_updated_at (+4 more)

### Community 10 - "weav.com Reference Layout Patterns"
Cohesion: 0.17
Nodes (16): Alternating Full-Bleed Color Section Bands, Latest From Blog Teaser Grid, Bold Short Sentence-Case Headlines, Cobalt Blue Primary Accent Color, weav.com as DNK House Design Reference (Style Only, Not Content), Dark-Themed Developer/Enterprise Section, Feature Section: Headline + Bullet Checklist + Visual, Final CTA Band + Multi-Column Footer (+8 more)

### Community 11 - "E2E Playwright Login Setup"
Cohesion: 0.29
Nodes (9): .env.local.example commit / .env.local gitignore, tests/e2e/helpers.ts (loginAs, EMAILS), playwright.config.ts (webServer next build+start, E2E_TEST_LOGIN=1), /auth/test-login (E2E seam, E2E_TEST_LOGIN=1, 404 nếu khác), Kịch bản E2E Playwright (mục 5.3), @playwright/test, EMAILS, loginAs() (+1 more)

### Community 12 - "Visual Style & Animation Rules"
Cohesion: 0.18
Nodes (13): globals.css — single source of color/typography tokens, ScrollReveal.tsx — sole scroll-reveal wrapper, framer-motion whileInView animation, lucide-react icons, next/font font loading (no external CDN), Tech stack (Next.js App Router, Tailwind, TypeScript), What NOT to take from weav (no fake logos/mockups), Scroll-in animation mandatory, one consistent technique (+5 more)

### Community 13 - "Content & UI Check Guidelines"
Cohesion: 0.18
Nodes (13): Content template (placeholder copy formulas), DNK House ≠ weav.com content rule, Component naming/structure conventions, Unverified stats must be marked // TODO: placeholder, Responsive-first breakpoint checks (375/768/1440), Structural patterns borrowed from reference, weav.com design reference screenshots, Mandatory mobile/tablet/desktop breakpoints (+5 more)

### Community 14 - "Three-Layer Route Protection"
Cohesion: 0.20
Nodes (12): Three layers of protection (proxy, DAL, RLS), Client portal (/portal), DAL src/lib/portal/session.ts (requireClient, requireProjectAccess), Phase 1 data entry via Supabase Studio, Portal routes (/login, /auth/callback, /portal, /portal/[projectId]), src/proxy.ts cookie redirect, src/lib/portal/queries.ts (server-only, RLS-filtered), Postgres RLS final defense layer (+4 more)

### Community 15 - "Dev Dependencies"
Cohesion: 0.17
Nodes (12): devDependencies, eslint, eslint-config-next, @playwright/test, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+4 more)

### Community 16 - "Admin Input Validation"
Cohesion: 0.25
Nodes (7): ProjectInput, UpdateInput, Validated, validateDirection(), validateMilestoneTitle(), validateProjectIds(), validateUpdateInput()

### Community 17 - "Env Vars & Supabase Hosted"
Cohesion: 0.24
Nodes (10): E2E_TEST_LOGIN backdoor + security warning, .env.test committed file (Supabase local demo keys), Supabase environment variables, Supabase hosted project obcfgqkaokghxgauomxo (ap-northeast-1), E2E_TEST_LOGIN has no NODE_ENV guard (next start forces production), Supabase hosted for manual dev, local for test (no .env.local swapping), Phase 1 — Client portal (Google login + dashboard), done & merged, Phase 1 four slices (infra, Google auth, dashboard list, project detail) (+2 more)

### Community 18 - "Karpathy Coding Principles"
Cohesion: 0.25
Nodes (8): Goal-driven execution (verifiable success criteria), Karpathy code-behavior principles, Andrej Karpathy tweet on LLM coding pitfalls, Prefer simplicity (minimal code, no speculation), Surgical changes (touch only what is required), Think before coding / expose ambiguity, formatVnDate via Intl.DateTimeFormat (no date library), Use getByRole(heading) not getByText for key E2E assertions

### Community 19 - "Landing Page Architecture"
Cohesion: 0.29
Nodes (7): Anchor IDs / NAV_LINKS in Header.tsx, Landing Page Architecture, page.tsx section composition (source of truth for order), Path alias @/* → src/*, Root layout (layout.tsx, next/font Inter, typed routes), Section components (Server Components, inline const content), Site Structure (planned)

### Community 20 - "Portal Schema Tables"
Cohesion: 0.48
Nodes (6): auth.users, public.milestones, public.profiles, public.project_members, public.projects, public.updates

### Community 21 - "DNK Logo Asset (Logogen)"
Cohesion: 0.43
Nodes (7): DNK House Company Brand, DNK Monogram, DNK Wordmark, Hexagonal / Cube Badge Emblem, Logogen1.1.png — DNK Logo Asset, Metallic Gold & Silver 3D Style, Dark Navy Background

### Community 22 - "Phase 2 Admin Execution"
Cohesion: 0.33
Nodes (6): /portal/admin (Phase 2), ActionState/initialActionState split to non-"use server" file, git worktree .claude/worktrees/portal-giai-doan-2, Model by role (haiku mechanical tasks, sonnet integration + all reviews), Phase 2 — /portal/admin area (in progress, 6/21 tasks), subagent-driven-development execution (per-task subagent + review)

### Community 23 - "Dev / Test Commands"
Cohesion: 0.50
Nodes (5): Dev/build/test commands, Playwright E2E tests, Vitest (unit + integration RLS tests), Docker-dependent tests deferred (integration RLS, E2E, real query checks), Exclude .claude/** from ESLint scope

### Community 24 - "Proxy & Supabase SSR Clients"
Cohesion: 0.50
Nodes (5): updateSession → { response, isAuthenticated }, Không thêm ORM / thư viện session ngoài @supabase/ssr, src/proxy.ts (Next 16 Proxy, lớp 1), src/lib/supabase/{server,client,middleware}.ts (@supabase/ssr), updateSession(request) helper

### Community 25 - "Admin Server Actions & Forms"
Cohesion: 0.50
Nodes (4): redirect() ném NEXT_REDIRECT — action useActionState nhánh thành công không return, src/components/portal/admin/* (ProjectForm, MilestoneManager, UpdateManager, MemberList, ApproveAssignForm, DeleteButton, AdminNav), /portal/admin/projects/[id] — trang làm việc 1 dự án, useActionState (React 19.2) — lỗi validation theo field

### Community 26 - "DNK Logo Asset (Logosmall)"
Cohesion: 0.83
Nodes (4): Metallic Silver-Gold on Navy Style, DNK House Brand, Logosmall.png (DNK House logo asset), DNK Hexagon Monogram

## Knowledge Gaps
- **154 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+149 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 213 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Supabase Client & Milestone Order` to `Portal Auth Routes & Session`, `Runtime Dependencies`, `Portal Dashboard Components`, `Test Seed Data & Personas`, `Admin Input Validation`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Why does `requireAdmin() + resolveAdminAccess() (thuần)` connect `Slice Plans & Pure Resolvers` to `Portal Auth Routes & Session`, `DB Schema Migrations & Triggers`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `Row Level Security (lớp 3, phòng thủ cuối ở DB)` connect `Test Seed Data & Personas` to `DB Schema Migrations & Triggers`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `weav.com Reference Screenshot (Full Page)` (e.g. with `weav.com as DNK House Design Reference (Style Only, Not Content)` and `Section Scroll-Reveal / whileInView Pattern`) actually correct?**
  _`weav.com Reference Screenshot (Full Page)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _154 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Portal Auth Routes & Session` be split into smaller, more focused modules?**
  _Cohesion score 0.062146892655367235 - nodes in this community are weakly interconnected._
- **Should `Slice Plans & Pure Resolvers` be split into smaller, more focused modules?**
  _Cohesion score 0.06153846153846154 - nodes in this community are weakly interconnected._