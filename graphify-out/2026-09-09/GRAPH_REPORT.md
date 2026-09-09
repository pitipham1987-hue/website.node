# Graph Report - WEBSITE_AI  (2026-09-09)

## Corpus Check
- 161 files · ~291,082 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 539 nodes · 900 edges · 50 communities (31 shown, 15 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `27f1272f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin-actions.ts
- requireAdmin() + resolveAdminAccess() (thuần)
- package.json
- app/page.tsx
- session.ts
- formatVnDate
- auth.spec.ts
- Row Level Security (lớp 3, phòng thủ cuối ở DB)
- TypeScript Config
- Postgres Triggers & RLS Helpers
- weav.com Reference Layout Patterns
- database.types.ts
- Visual Style & Animation Rules
- Content & UI Check Guidelines
- Three-Layer Route Protection
- Dev Dependencies
- dependencies
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
- vitest
- scripts
- app/layout.tsx
- Client Portal (DNK House)

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 36 edges
2. `requireAdmin()` - 26 edges
3. `lucide-react` - 18 edges
4. `compilerOptions` - 16 edges
5. `weav.com Reference Screenshot (Full Page)` - 15 edges
6. `DNK House Company Website` - 15 edges
7. `formatVnDate()` - 14 edges
8. `revalidateProject()` - 12 edges
9. `vitest` - 11 edges
10. `react` - 9 edges

## Surprising Connections (you probably didn't know these)
- `DNK House Company Website` --references--> `Site Structure (planned)`  [EXTRACTED]
  CLAUDE.md → .claude/rules/site-structure.md
- `DNK House Company Website` --references--> `Mandatory UI checks`  [EXTRACTED]
  CLAUDE.md → .claude/rules/mandatory-ui-checks.md
- `DNK House Company Website` --references--> `Visual Style — DNK House (palette, typography, spacing, radius, motion)`  [EXTRACTED]
  CLAUDE.md → .claude/rules/visual-style.md
- `DNK House Company Website` --references--> `Landing Page Architecture`  [EXTRACTED]
  CLAUDE.md → .claude/rules/architecture.md
- `DNK House Company Website` --references--> `Dev/build/test commands`  [EXTRACTED]
  CLAUDE.md → .claude/rules/commands-and-stack.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Phase 2 admin execution setup (SDD in worktree with deferred DB tests)** — _claude_rules_project_status_phase2_admin_area, _claude_rules_project_status_subagent_driven_development, _claude_rules_project_status_git_worktree_phase2, _claude_rules_project_status_docker_deferred_tests, _claude_rules_project_status_model_by_role [EXTRACTED 0.85]
- **Karpathy four code-behavior principles** — _claude_rules_karpathy_guidelines_think_before_coding, _claude_rules_karpathy_guidelines_prefer_simplicity, _claude_rules_karpathy_guidelines_surgical_changes, _claude_rules_karpathy_guidelines_goal_driven_execution [EXTRACTED 0.90]
- **Three-layer portal access protection** — _claude_rules_portal_architecture_proxy, _claude_rules_portal_architecture_dal_session, _claude_rules_portal_architecture_rls [EXTRACTED 0.90]
- **5 bảng schema portal (profiles, projects, project_members, milestones, updates)** — docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_profiles, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_projects, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_project_members, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_milestones, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_updates [EXTRACTED 1.00]
- **Ba lớp phòng thủ route + DB (proxy → DAL → RLS)** — docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_ba_lop_bao_ve, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_proxy_ts, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_dal_session, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_rls [EXTRACTED 1.00]
- **Luồng đăng nhập Google (login → OAuth → callback → trigger → portal)** — docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_luong_dang_nhap_google, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_route_login, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_login_button, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_route_auth_callback, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_handle_new_user, docs_superpowers_specs_2026_08_28_portal_dang_nhap_google_design_route_portal [EXTRACTED 1.00]

## Communities (50 total, 15 thin omitted)

### Community 0 - "admin-actions.ts"
Cohesion: 0.08
Nodes (60): lucide-react, GET(), AdminHomePage(), ApprovePendingPage(), AdminProjectDetailPage(), NewProjectPage(), AdminNav(), ApproveAssignForm() (+52 more)

### Community 1 - "requireAdmin() + resolveAdminAccess() (thuần)"
Cohesion: 0.08
Nodes (29): DAL dùng supabase.auth.getUser() xác thực JWT (không tin getSession server), resolveClientAccess(profile) (thuần), milestoneProgress({done,total}) — thuần, total<=0 → 0, src/app/portal/error.tsx (use client, prop retry), formatVnDate tự viết, không thêm dayjs/date-fns, formatVnDate(iso) — Intl.DateTimeFormat vi-VN, Asia/Ho_Chi_Minh, resolveProjectAccess(clientStatus, project) (thuần), seed.sql UPDATE done_at cho mốc done (trigger chỉ chạy before-update) (+21 more)

### Community 2 - "package.json"
Cohesion: 0.12
Nodes (14): name, private, version, eslint, eslint-config-next, react-dom, @supabase/supabase-js, tailwindcss (+6 more)

### Community 3 - "app/page.tsx"
Cohesion: 0.09
Nodes (22): framer-motion, react, About(), TODO: số liệu placeholder — thay bằng con số thật của DNK House trước khi…, STATS, CtaBanner(), Footer(), LINK_GROUPS (+14 more)

### Community 4 - "session.ts"
Cohesion: 0.10
Nodes (22): roleToScreen(role) (thuần), GET(), LoginPage(), PortalLayout(), LoginButton(), handleClick(), signOut(), AdminAccess (+14 more)

### Community 5 - "formatVnDate"
Cohesion: 0.13
Nodes (17): server-only, PortalPage(), ProjectDetailPage(), MilestoneList(), PendingNotice(), ProjectCard(), UpdatesFeed(), formatVnDate() (+9 more)

### Community 6 - "auth.spec.ts"
Cohesion: 0.20
Nodes (13): .env.local.example commit / .env.local gitignore, 4 user seed (admin/client-a/client-b/pending, mật khẩu portal-dev-123), tests/helpers/supabase.ts (signInAs, serviceClient, IDS), tests/e2e/helpers.ts (loginAs, EMAILS), playwright.config.ts (webServer next build+start, E2E_TEST_LOGIN=1), /auth/test-login (E2E seam, E2E_TEST_LOGIN=1, 404 nếu khác), Persona seed client-c@dnkhouse.test (client, 0 dự án) cho màn thông báo trống, Kịch bản E2E Playwright (mục 5.3) (+5 more)

### Community 7 - "Row Level Security (lớp 3, phòng thủ cuối ở DB)"
Cohesion: 0.11
Nodes (22): Migration 20260828000002_portal_functions_triggers.sql, Migration 20260828000003_portal_rls.sql, Migration 20260828000001_portal_schema.sql, Hàm helper RLS SECURITY DEFINER + set search_path (tránh đệ quy RLS), ProjectListItem interface, getProjectDetail(projectId), getProjectsForUser(), handle_new_user() trigger (+14 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "Postgres Triggers & RLS Helpers"
Cohesion: 0.12
Nodes (12): public.handle_new_user, public.prevent_role_self_change, public.set_milestone_done_at, public.set_updated_at, milestones_set_done_at, on_auth_user_created, profiles_prevent_role_self_change, projects_set_updated_at (+4 more)

### Community 10 - "weav.com Reference Layout Patterns"
Cohesion: 0.17
Nodes (16): Alternating Full-Bleed Color Section Bands, Latest From Blog Teaser Grid, Bold Short Sentence-Case Headlines, Cobalt Blue Primary Accent Color, weav.com as DNK House Design Reference (Style Only, Not Content), Dark-Themed Developer/Enterprise Section, Feature Section: Headline + Bullet Checklist + Visual, Final CTA Band + Multi-Column Footer (+8 more)

### Community 11 - "database.types.ts"
Cohesion: 0.14
Nodes (15): @supabase/ssr, CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json (+7 more)

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

### Community 16 - "dependencies"
Cohesion: 0.22
Nodes (9): dependencies, framer-motion, lucide-react, next, react, react-dom, server-only, @supabase/ssr (+1 more)

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

### Community 46 - "vitest"
Cohesion: 0.16
Nodes (12): Supabase local (Docker) cho test integration/E2E, vitest.config.ts (fileParallelism:false, node env, alias @/), Kịch bản test integration RLS (mục 5.2), vitest, MilestoneOrder, reorderMilestones(), EMAIL, IDS (+4 more)

### Community 47 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, dev, lint, start, test, test:e2e, test:watch

### Community 48 - "app/layout.tsx"
Cohesion: 0.29
Nodes (4): nextConfig, next, inter, metadata

### Community 49 - "Client Portal (DNK House)"
Cohesion: 0.10
Nodes (25): Slice 1 plan (8 task), Slice 2 plan (8 task), Slice 3 plan (6 task), Slice 4 plan (7 task), Giai đoạn 2 plan — khu quản trị /portal/admin, Phân rã 4 slice dọc tuần tự, Client Portal (DNK House), Giai đoạn 1 (auth + data model + dashboard khách) (+17 more)

## Knowledge Gaps
- **150 isolated node(s):** `ProjectFormProps`, `AdminProjectDetail`, `AdminProjectListItem`, `AssignableClient`, `ClientProfile` (+145 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 209 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `admin-actions.ts`, `package.json`, `session.ts`, `formatVnDate`, `database.types.ts`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Why does `requireAdmin() + resolveAdminAccess() (thuần)` connect `requireAdmin() + resolveAdminAccess() (thuần)` to `Client Portal (DNK House)`, `session.ts`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `admin-actions.ts` to `package.json`, `app/page.tsx`, `formatVnDate`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `weav.com Reference Screenshot (Full Page)` (e.g. with `weav.com as DNK House Design Reference (Style Only, Not Content)` and `Section Scroll-Reveal / whileInView Pattern`) actually correct?**
  _`weav.com Reference Screenshot (Full Page)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ProjectFormProps`, `AdminProjectDetail`, `AdminProjectListItem` to the rest of the system?**
  _150 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin-actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0759493670886076 - nodes in this community are weakly interconnected._
- **Should `requireAdmin() + resolveAdminAccess() (thuần)` be split into smaller, more focused modules?**
  _Cohesion score 0.07881773399014778 - nodes in this community are weakly interconnected._