<div align="center">

<br />

```
██╗███╗   ██╗██╗████████╗██╗  ██╗██╗██╗   ██╗███╗   ███╗
██║████╗  ██║██║╚══██╔══╝██║  ██║██║██║   ██║████╗ ████║
██║██╔██╗ ██║██║   ██║   ███████║██║██║   ██║██╔████╔██║
██║██║╚██╗██║██║   ██║   ██╔══██║██║██║   ██║██║╚██╔╝██║
██║██║ ╚████║██║   ██║   ██║  ██║██║╚██████╔╝██║ ╚═╝ ██║
╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝     ╚═╝
```

### A fully-featured, scalable monorepo starter for modern web applications.

<br />

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![NX](https://img.shields.io/badge/NX-Monorepo-143157?style=for-the-badge&logo=nx&logoColor=white)

<br />

![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Headless UI](https://img.shields.io/badge/Headless-UI-66E3FF?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)

<br />

> **Inithium** provides a standardized architecture that lets your team skip the boilerplate and go straight to building features — with type safety, shared business logic, a full design system, and centralized authentication baked in from day one.

<br />

</div>

---

## Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [Architecture Deep Dive](#architecture-deep-dive)
- [Package: `@inithium/shared`](#package-inithiumshared)
  - [Types](#types)
  - [Constants](#constants)
  - [Utility Functions](#utility-functions)
- [Package: `@inithium/ui`](#package-inithiumui)
  - [Theme System](#theme-system)
  - [Component Library](#component-library)
  - [Dark Mode](#dark-mode)
- [Package: `@inithium/auth`](#package-inithiumauth)
  - [useAuth Composable](#useauth-composable)
  - [Validators](#validators)
  - [Token Storage](#token-storage)
- [Package: `@inithium/api-client`](#package-inithiumapi-client)
  - [ApiClient Class](#apiclient-class)
  - [Endpoint Groups](#endpoint-groups)
  - [Extending the Client](#extending-the-client)
- [App: `@inithium/api` — Express Backend](#app-inithiumapi--express-backend)
  - [Database Connection](#database-connection)
  - [User Model](#user-model)
  - [Auth Routes](#auth-routes)
  - [Middleware](#middleware)
  - [Extending the API](#extending-the-api)
- [App: `@inithium/web` — Vue Frontend](#app-inithiumweb--vue-frontend)
  - [Routing & Guards](#routing--guards)
  - [Auth Integration](#auth-integration)
  - [Theming Integration](#theming-integration)
- [Getting Started](#getting-started)
- [Adding New Packages](#adding-new-packages)
- [Adding New Apps](#adding-new-apps)
- [Environment Variables](#environment-variables)
- [Scripts Reference](#scripts-reference)

---

## Overview

![Architecture](https://img.shields.io/badge/Pattern-Monorepo-blueviolet?style=flat-square)
![Build](https://img.shields.io/badge/Build_System-NX-143157?style=flat-square&logo=nx)
![Design](https://img.shields.io/badge/Design-Token_Based_Theme-FF6B6B?style=flat-square)

Inithium is a production-ready monorepo starter. Its central philosophy is **one source of truth for everything that matters**: types, business logic, design tokens, authentication, and API communication. Every app you add to this repo immediately inherits the full stack of shared infrastructure without writing a single line of setup code.

The architecture is built around four core principles:

- **Type safety everywhere.** Every package exports strict TypeScript interfaces. Your editor will catch mismatches between the frontend, backend, and shared layer before the code ever runs.
- **No repeated logic.** Validation, error handling, formatting, and auth live once in shared packages and are consumed everywhere.
- **Modularity over coupling.** Apps are thin consumers. Business logic, UI, auth, and HTTP communication are packages that apps plug into — not logic that lives inside the app itself.
- **Extensibility by default.** The architecture is designed so that adding a new app, a new API route, or a new UI component is a mechanical process that follows a well-worn path — not a design problem you have to solve from scratch.

---

## Repository Structure

```
inithium/
├── apps/
│   ├── api/                        # Express/Node.js REST API
│   │   └── src/
│   │       ├── main.ts             # Entry point — bootstraps DB + server
│   │       ├── app/index.ts        # Express app factory
│   │       ├── lib/
│   │       │   ├── db.ts           # MongoDB Atlas connection
│   │       │   └── jwt.ts          # Token signing & verification
│   │       ├── models/
│   │       │   └── User.ts         # Mongoose user model
│   │       ├── controllers/
│   │       │   └── auth.controller.ts
│   │       ├── routes/
│   │       │   └── auth.routes.ts
│   │       └── middleware/
│   │           └── authenticate.ts # JWT auth guard + role guard
│   │
│   └── web/                        # Vue 3 frontend
│       └── src/
│           ├── main.ts             # App bootstrap + session restore
│           ├── app/App.vue         # Root component w/ ThemeProvider
│           ├── router/index.ts     # Vue Router + nav guards
│           ├── lib/api.ts          # Singleton API client instance
│           ├── layouts/            # DefaultLayout, AuthLayout
│           └── pages/              # HomePage, LoginPage, RegisterPage, DashboardPage
│
├── packages/
│   ├── shared/                     # @inithium/shared — pure framework-agnostic logic
│   │   └── src/
│   │       ├── types/              # user.ts, auth.ts, api.ts
│   │       ├── constants/          # Routes, status codes, token keys
│   │       └── utils/              # validation, formatting, colors, errors
│   │
│   ├── ui/                         # @inithium/ui — Vue design system
│   │   └── src/
│   │       ├── theme/              # tokens.ts, ThemeProvider.ts, ThemeProvider.vue
│   │       └── components/         # IText, IBox, IButton, IInput, IDialog, IMenu, ...
│   │
│   ├── auth/                       # @inithium/auth — auth composable + validators
│   │   └── src/
│   │       ├── useAuth.ts          # Singleton reactive auth state
│   │       ├── validators.ts       # Login/register form validation
│   │       └── storage.ts          # localStorage token management
│   │
│   └── api-client/                 # @inithium/api-client — typed HTTP bridge
│       └── src/
│           ├── client.ts           # Base ApiClient class
│           ├── createApiClient.ts  # Factory that assembles endpoint groups
│           └── endpoints/          # auth.ts, users.ts
│
├── nx.json
├── tsconfig.base.json              # Path aliases for all packages
└── package.json
```

---

## Architecture Deep Dive

```
┌─────────────────────────────────────────────────────────┐
│                        APPS LAYER                        │
│                                                          │
│   ┌──────────────────┐        ┌──────────────────────┐  │
│   │   apps/web       │        │      apps/api        │  │
│   │   (Vue 3 SPA)    │◄──────►│  (Express REST API)  │  │
│   └────────┬─────────┘  HTTP  └──────────┬───────────┘  │
│            │                             │               │
└────────────┼─────────────────────────────┼───────────────┘
             │                             │
┌────────────▼─────────────────────────────▼───────────────┐
│                      PACKAGES LAYER                       │
│                                                           │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ @inithium/  │  │@inithium/│  │   @inithium/ui       │ │
│  │ api-client  │  │   auth   │  │  (Theme + Components) │ │
│  └──────┬──────┘  └────┬─────┘  └──────────────────────┘ │
│         │              │                                   │
│         └──────┬───────┘                                   │
│                │                                           │
│  ┌─────────────▼────────────────────────────────────────┐ │
│  │                  @inithium/shared                    │ │
│  │       (Types · Constants · Utils — pure TS)          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
             │
┌────────────▼───────────────────────┐
│         DATA LAYER                 │
│   MongoDB Atlas (Cloud Cluster)    │
└────────────────────────────────────┘
```

The dependency graph flows in one direction: **apps → packages → shared**. `shared` has zero internal dependencies. `ui` and `auth` can each depend on `shared`. `api-client` depends on `shared` and `auth`. Apps sit at the top and consume whatever packages they need.

This strict layering means you can always answer "where does this live?" without ambiguity:

| Concern                                | Lives in               |
| -------------------------------------- | ---------------------- |
| TypeScript types & interfaces          | `@inithium/shared`     |
| Business logic, validation, utils      | `@inithium/shared`     |
| Design tokens, theme configuration     | `@inithium/ui`         |
| Vue component library                  | `@inithium/ui`         |
| Auth state, login/logout/persist logic | `@inithium/auth`       |
| HTTP calls to the backend              | `@inithium/api-client` |
| Database models, JWT, route handlers   | `apps/api`             |
| Pages, layouts, routing                | `apps/web`             |

---

## Package: `@inithium/shared`

![Pure TS](https://img.shields.io/badge/Pure-TypeScript-3178C6?style=flat-square&logo=typescript)
![No Runtime Deps](https://img.shields.io/badge/Runtime_Deps-Zero-brightgreen?style=flat-square)
![Framework Agnostic](https://img.shields.io/badge/Framework-Agnostic-lightgrey?style=flat-square)

`@inithium/shared` is the foundation of the entire monorepo. It contains no framework code — no Vue, no Express, no React. Everything here is pure TypeScript logic that can run in any environment: browser, Node server, test runner, or a future mobile app.

The golden rule of this package: **if you're thinking about where to put a type, a constant, or a utility function, it probably belongs here.**

### Types

All TypeScript interfaces and types are centralized here so the frontend and backend always agree on the shape of data.

#### `User` and `UserProfile`

```typescript
import type { User, UserProfile, UserRole } from '@inithium/shared';

// Core user — what the API always returns
const user: User = {
  id: '64abc...',
  email: 'jane@example.com',
  displayName: 'Jane Smith',
  role: 'member', // 'admin' | 'member' | 'guest'
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

// Extended profile — optional fields for richer display
const profile: UserProfile = {
  ...user,
  avatarUrl: 'https://cdn.example.com/avatar.png',
  bio: 'Product designer & occasional developer.',
};
```

`UserRole` is a union type (`'admin' | 'member' | 'guest'`) that is shared between the backend's Mongoose schema, the JWT payload, and the frontend's role-based conditional rendering — all from one definition.

#### Auth Types

```typescript
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthTokens,
  JwtPayload,
} from '@inithium/shared';

// What you send to POST /api/auth/login
const loginPayload: LoginCredentials = {
  email: 'jane@example.com',
  password: 'SecurePass1',
};

// What you send to POST /api/auth/register
const registerPayload: RegisterCredentials = {
  email: 'jane@example.com',
  password: 'SecurePass1',
  displayName: 'Jane Smith',
};

// The decoded shape of a JWT — available anywhere you call verifyToken()
const payload: JwtPayload = {
  sub: '64abc...', // user ID
  email: 'jane@example.com',
  role: 'member',
  iat: 1705312200,
  exp: 1705917000,
};
```

#### API Response Types

All API responses — success and error — conform to a discriminated union, making it trivial to narrow types on either side of a `fetch` call.

```typescript
import type { ApiResponse, ApiSuccess, ApiError, PaginatedResponse } from '@inithium/shared';

// Discriminated union — check success to narrow the type
async function fetchUser(id: string): Promise<User | null> {
  const response: ApiResponse<User> = await api.users.getById(id);

  if (response.success) {
    // TypeScript knows this is ApiSuccess<User> here
    return response.data;
  } else {
    // TypeScript knows this is ApiError here
    console.error(response.error, response.statusCode);
    return null;
  }
}

// Paginated list response
const page: PaginatedResponse<User> = {
  items:      [...],
  total:      87,
  page:       1,
  pageSize:   20,
  totalPages: 5,
};
```

---

### Constants

Constants eliminate magic strings and numbers. Import them anywhere rather than duplicating literals.

#### `API_ROUTES`

```typescript
import { API_ROUTES } from '@inithium/shared';

// Static routes
API_ROUTES.AUTH.REGISTER; // '/api/auth/register'
API_ROUTES.AUTH.LOGIN; // '/api/auth/login'
API_ROUTES.AUTH.LOGOUT; // '/api/auth/logout'
API_ROUTES.AUTH.ME; // '/api/auth/me'
API_ROUTES.AUTH.REFRESH; // '/api/auth/refresh'
API_ROUTES.USERS.BASE; // '/api/users'

// Dynamic routes — call as a function
API_ROUTES.USERS.BY_ID('64abc...'); // '/api/users/64abc...'
```

Used by `@inithium/api-client`'s endpoint definitions to ensure the frontend always requests exactly the paths the backend registers — no typos, no drift.

#### `HTTP_STATUS`

```typescript
import { HTTP_STATUS } from '@inithium/shared';

// In Express controllers
res.status(HTTP_STATUS.CREATED).json({ success: true, data: user });
res
  .status(HTTP_STATUS.UNAUTHORIZED)
  .json({ success: false, error: 'Invalid credentials' });

// In frontend error handling
if (response.statusCode === HTTP_STATUS.CONFLICT) {
  showError('That email is already registered.');
}
```

#### `USER_ROLES`

```typescript
import { USER_ROLES } from '@inithium/shared';

USER_ROLES.ADMIN; // 'admin'
USER_ROLES.MEMBER; // 'member'
USER_ROLES.GUEST; // 'guest'

// Use with the requireRole middleware
router.delete(
  '/users/:id',
  authenticate,
  requireRole(USER_ROLES.ADMIN),
  deleteUser
);

// Use in Vue templates for conditional rendering
<template>
  <AdminPanel v-if="user.role === USER_ROLES.ADMIN" />
</template>;
```

#### `TOKEN_KEY` and `REFRESH_TOKEN_KEY`

```typescript
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@inithium/shared';

// TOKEN_KEY = 'inithium_access_token'
// REFRESH_TOKEN_KEY = 'inithium_refresh_token'

// The auth package uses these internally — but if you ever need
// to access the token directly (e.g. in a third-party SDK setup):
const token = localStorage.getItem(TOKEN_KEY);
```

#### Other Constants

```typescript
import { APP_NAME, DEFAULT_PAGE_SIZE } from '@inithium/shared';

APP_NAME; // 'Inithium' — use in page titles, headers, emails
DEFAULT_PAGE_SIZE; // 20 — default for all paginated API requests
```

---

### Utility Functions

#### Validation — `utils/validation.ts`

```typescript
import {
  isValidEmail,
  isStrongPassword,
  isNonEmptyString,
} from '@inithium/shared';

isValidEmail('jane@example.com'); // true
isValidEmail('not-an-email'); // false

// Enforces: 8+ chars, at least one uppercase, one lowercase, one digit
isStrongPassword('SecurePass1'); // true
isStrongPassword('weak'); // false

// Type guard — narrows unknown to string
isNonEmptyString(''); // false
isNonEmptyString('   '); // false (trims before checking)
isNonEmptyString('hello'); // true
```

These are used in `@inithium/auth`'s validators and in the Express controllers to enforce consistent rules across both the frontend (immediate feedback) and backend (server-side enforcement).

---

#### Formatting — `utils/formatting.ts`

```typescript
import { formatDate, truncate, slugify, caseConverter } from '@inithium/shared';

// Locale-aware date formatting
formatDate('2024-01-15T10:30:00Z'); // 'Jan 15, 2024'
formatDate('2024-01-15T10:30:00Z', 'fr-FR'); // '15 janv. 2024'

// Smart truncation
truncate('Hello, world! This is a long string.', 20); // 'Hello, world! This...'

// URL-safe slug generation
slugify('Hello World! My Post Title'); // 'hello-world-my-post-title'
slugify('  Multiple   Spaces  '); // 'multiple-spaces'

// Multi-target case converter
caseConverter('hello world example', 'camel'); // 'helloWorldExample'
caseConverter('hello world example', 'pascal'); // 'HelloWorldExample'
caseConverter('hello world example', 'snake'); // 'hello_world_example'
caseConverter('hello world example', 'kebab'); // 'hello-world-example'
caseConverter('hello world example', 'sentence'); // 'Hello world example'
caseConverter('hello world example', 'upper'); // 'HELLO WORLD EXAMPLE'
caseConverter('hello world example', 'lower'); // 'hello world example'

// caseConverter handles camelCase input too
caseConverter('myVariableName', 'kebab'); // 'my-variable-name'
caseConverter('MyPascalCase', 'snake'); // 'my_pascal_case'
```

`CaseType` is exported as a union type so you can type props or parameters that accept a case format:

```typescript
import type { CaseType } from '@inithium/shared';

function transformLabel(value: string, format: CaseType): string {
  return caseConverter(value, format);
}
```

---

#### Color Utilities — `utils/colors.ts`

```typescript
import {
  hexToRgba,
  rgbaToHex,
  getLightOrDark,
  lighten,
  darken,
} from '@inithium/shared';

// Convert hex to rgba with optional alpha
hexToRgba('#6366f1'); // 'rgba(99, 102, 241, 1)'
hexToRgba('#6366f1', 0.5); // 'rgba(99, 102, 241, 0.5)'
hexToRgba('#fff', 0.8); // supports 3-char shorthand → 'rgba(255, 255, 255, 0.8)'

// Convert rgba back to hex
rgbaToHex('rgba(99, 102, 241, 1)'); // '#6363f1'

// Determine perceived luminance of a color
getLightOrDark('#ffffff'); // 'light'
getLightOrDark('#000000'); // 'dark'
getLightOrDark('#6366f1'); // 'dark'  ← use white text on this background

// Lighten or darken a hex color by a raw RGB channel amount (0–255)
lighten('#6366f1', 40); // brightened indigo
darken('#6366f1', 40); // deepened indigo
```

`getLightOrDark` implements the WCAG relative luminance formula, making it a reliable accessibility tool for dynamically choosing contrasting text colors on top of any background, even colors you don't know in advance (e.g. user-set brand colors).

---

#### Error Utilities — `utils/errors.ts`

```typescript
import { AppError, isAppError, toApiError } from '@inithium/shared';

// Throw structured errors anywhere in the codebase
throw new AppError('Email already registered', 409);
throw new AppError('Validation failed', 400, {
  email: ['Must be a valid email address'],
  password: ['Must be at least 8 characters'],
});

// Type guard — useful in catch blocks
try {
  await doSomething();
} catch (err) {
  if (isAppError(err)) {
    // err.message, err.statusCode, err.details are all typed
    res.status(err.statusCode).json({ success: false, error: err.message });
  } else {
    res.status(500).json({ success: false, error: 'Unknown error' });
  }
}

// Convert any thrown value to a plain serializable error object
const { error, statusCode } = toApiError(unknownCaughtValue);
res.status(statusCode).json({ success: false, error });
```

`toApiError` is used in Express controllers as a catch-all — it gracefully handles `AppError` instances, native `Error` objects, and completely unknown thrown values, always returning a serializable `{ error, statusCode }` pair.

---

## Package: `@inithium/ui`

![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vue.js)
![Headless UI](https://img.shields.io/badge/Headless-UI-66E3FF?style=flat-square)
![Token Based](https://img.shields.io/badge/Theme-Token_Based-FF6B6B?style=flat-square)
![Dark Mode](https://img.shields.io/badge/Dark_Mode-Per_User-8B5CF6?style=flat-square)
![Accessible](https://img.shields.io/badge/WCAG-Accessible-green?style=flat-square)

`@inithium/ui` is the design system for the monorepo. It provides two things: a highly configurable **theme system** that acts as the single source of truth for all visual decisions, and a **component library** built by extending [Headless UI](https://headlessui.com/) — fully accessible, completely unstyled primitives — with theme-aware styles and Inithium-specific APIs.

### Theme System

The theme is **token-based**. This means every visual property in every component comes from a named token — never a hardcoded hex value or a magic number. This allows the entire look and feel of an application to be changed by swapping or extending the token set, not by hunting through component files.

#### How Tokens Are Structured

Tokens are organized into layers:

**1. Color Primitives** (private — internal to the token file)

Raw palette values like `palette.indigo[600]` or `palette.gray[200]`. Never imported directly by components.

**2. Semantic Color Tokens** (public — what components and consumers use)

Semantic tokens express _intent_ rather than _appearance_. Instead of `'#6366f1'`, you reference `colors.primary.bg`. This decouples your components from specific color values — swapping a brand color only requires changing the token, not every component that uses it.

Each semantic token is a `ColorToken` object:

```typescript
interface ColorToken {
  bg: string; // background
  fg: string; // foreground — guaranteed to contrast with bg (WCAG)
  subtle: string; // tinted background for hover states, chips, etc.
  emphasis: string; // stronger background for active states
  border: string; // matching border color
}
```

The available semantic tokens are:

| Token            | Purpose                                                 |
| ---------------- | ------------------------------------------------------- |
| `surface`        | Primary page/card background                            |
| `surfaceAlt`     | Alternate background (navbars, sidebars, table headers) |
| `primary`        | Brand color — buttons, links, active indicators         |
| `success`        | Positive feedback — confirmations, success toasts       |
| `warning`        | Cautionary feedback — alerts, warnings                  |
| `danger`         | Destructive actions, error states                       |
| `info`           | Informational highlights                                |
| `text.primary`   | Main body text                                          |
| `text.secondary` | Supporting/muted text                                   |
| `text.disabled`  | Disabled control text                                   |
| `text.inverse`   | Text on dark backgrounds                                |

**3. Typography, Spacing, Radius, and Shadow Tokens**

```typescript
// Font families
fontFamily.sans; // Inter — primary UI font
fontFamily.mono; // Fira Code — code blocks, monospace
fontFamily.serif; // Merriweather — editorial / long-form content

// Font sizes (xs → 4xl)
fontSize.xs; // 0.75rem
fontSize.sm; // 0.875rem
fontSize.base; // 1rem
fontSize.lg; // 1.125rem
// ...up to 4xl

// Font weights
fontWeight.normal; // 400
fontWeight.medium; // 500
fontWeight.semibold; // 600
fontWeight.bold; // 700

// Spacing scale (0 → 32)
spacing[0]; // '0px'
spacing[1]; // '0.25rem'
spacing[2]; // '0.5rem'
spacing[4]; // '1rem'
spacing[8]; // '2rem'
// ...

// Border radius
borderRadius.sm; // 0.125rem
borderRadius.md; // 0.375rem
borderRadius.lg; // 0.5rem
borderRadius.xl; // 0.75rem
borderRadius.full; // 9999px (pill)

// Box shadows
shadow.sm; // subtle lift
shadow.base; // card shadow
shadow.md; // dropdown shadow
shadow.lg; // modal shadow
shadow.xl; // overlay shadow
```

#### ThemeProvider

The `ThemeProvider` component creates a Vue `provide` context that makes the active theme available to every descendant component without prop drilling. Wrap your entire application once at the root:

```vue
<!-- apps/web/src/app/App.vue -->
<script setup lang="ts">
import { ThemeProvider } from '@inithium/ui';
</script>

<template>
  <ThemeProvider initial-mode="light">
    <RouterView />
  </ThemeProvider>
</template>
```

#### `useTheme()` Composable

Any component within the provider can call `useTheme()` to access or control the active theme:

```vue
<script setup lang="ts">
import { useTheme } from '@inithium/ui';

const { theme, isDark, toggleMode, setMode } = useTheme();

// theme     — Ref<Theme>       — the full active theme object
// isDark    — Ref<boolean>     — true when dark mode is active
// toggleMode — () => void      — toggle between light and dark
// setMode   — (mode) => void   — explicitly set 'light' or 'dark'
</script>

<template>
  <button @click="toggleMode">
    {{ isDark ? 'Switch to Light' : 'Switch to Dark' }}
  </button>
</template>
```

#### Extending the Theme

To customize the theme for your project, don't edit `tokens.ts` directly. Instead, create a new token set that extends the defaults:

```typescript
// your-app/src/theme/customTheme.ts
import { lightTheme, type Theme } from '@inithium/ui';

export const myTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: {
      bg: '#10b981', // emerald green brand color
      fg: '#ffffff',
      subtle: '#ecfdf5',
      emphasis: '#059669',
      border: '#6ee7b7',
    },
  },
};
```

Then provide it directly to `provideTheme` if you need full custom control:

```typescript
import { provideTheme } from '@inithium/ui';
provideTheme('light'); // or extend provideTheme to accept a custom theme object
```

---

### Component Library

All components are prefixed with `I` (for Inithium) to avoid naming collisions with native HTML elements or other libraries. Every component accepts theme-semantic props — never raw hex values or pixel values.

#### `IText`

The primary typography primitive. Renders as any HTML element via the `as` prop.

```vue
<IText as="h1" size="3xl" weight="bold" color="primary">Page Title</IText>
<IText as="p" size="base" color="secondary">Supporting description text.</IText>
<IText as="span" size="sm" color="danger">Error message</IText>
<IText as="label" size="sm" weight="medium" family="mono">Code label</IText>

<!-- Truncate long strings with ellipsis -->
<IText truncate size="sm" color="secondary" style="max-width: 200px">
  A very long string that will be cut off with an ellipsis
</IText>
```

| Prop       | Type         | Default     | Description                                                                                                    |
| ---------- | ------------ | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `as`       | `string`     | `'span'`    | HTML element to render                                                                                         |
| `size`     | `FontSize`   | `'base'`    | Token-based font size                                                                                          |
| `weight`   | `FontWeight` | `'normal'`  | Token-based font weight                                                                                        |
| `family`   | `FontFamily` | `'sans'`    | Font family: `sans`, `mono`, `serif`                                                                           |
| `color`    | `TextColor`  | `'primary'` | Semantic color: `primary`, `secondary`, `disabled`, `inverse`, `brand`, `success`, `warning`, `danger`, `info` |
| `truncate` | `boolean`    | `false`     | Clip overflow with ellipsis                                                                                    |

---

#### `IBox`

The layout and surface container primitive. Handles backgrounds, padding, margin, borders, radius, and shadow — all via tokens.

```vue
<!-- A card -->
<IBox surface="surface" p="6" radius="xl" shadow="md" border>
  Card content here
</IBox>

<!-- An alternate surface (e.g. sidebar) -->
<IBox surface="surfaceAlt" px="4" py="3" border>
  Sidebar content
</IBox>

<!-- A danger/error banner -->
<IBox surface="danger" p="4" radius="md">
  <IText color="inverse">Something went wrong!</IText>
</IBox>

<!-- Using as a semantic element -->
<IBox as="section" surface="surface" p="8">
  <IBox as="header" surface="surfaceAlt" p="4" border>...</IBox>
</IBox>
```

| Prop                  | Type           | Default     | Description               |
| --------------------- | -------------- | ----------- | ------------------------- |
| `as`                  | `string`       | `'div'`     | HTML element to render    |
| `surface`             | `Surface`      | `'surface'` | Semantic surface color    |
| `p/px/py/pt/pb/pl/pr` | `Spacing`      | —           | Token-based padding       |
| `m/mx/my`             | `Spacing`      | —           | Token-based margin        |
| `radius`              | `BorderRadius` | `'none'`    | Token-based border radius |
| `shadow`              | `Shadow`       | `'none'`    | Token-based box shadow    |
| `border`              | `boolean`      | `false`     | Apply semantic border     |
| `fullWidth`           | `boolean`      | `false`     | Set `width: 100%`         |

---

#### `IButton`

```vue
<!-- Variants -->
<IButton variant="solid" intent="primary">Save Changes</IButton>
<IButton variant="outline" intent="danger">Delete Account</IButton>
<IButton variant="ghost" intent="info">Learn More</IButton>

<!-- Sizes -->
<IButton size="sm">Small</IButton>
<IButton size="md">Medium</IButton>
<IButton size="lg">Large</IButton>

<!-- States -->
<IButton :loading="isSubmitting">Submitting...</IButton>
<IButton :disabled="!formValid">Submit</IButton>
<IButton full-width>Full Width</IButton>
```

| Prop        | Type                                                        | Default     | Description                   |
| ----------- | ----------------------------------------------------------- | ----------- | ----------------------------- |
| `variant`   | `'solid' \| 'outline' \| 'ghost'`                           | `'solid'`   | Visual style                  |
| `intent`    | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'` | Semantic color intent         |
| `size`      | `'sm' \| 'md' \| 'lg'`                                      | `'md'`      | Size variant                  |
| `loading`   | `boolean`                                                   | `false`     | Shows spinner, disables click |
| `disabled`  | `boolean`                                                   | `false`     | Disables the button           |
| `fullWidth` | `boolean`                                                   | `false`     | Set `width: 100%`             |

---

#### `IInput`

Supports `v-model`, labels, hints, validation errors, and all standard input types.

```vue
<IInput
  v-model="email"
  id="email"
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  :error="errors.email"
  required
/>

<IInput
  v-model="password"
  type="password"
  label="Password"
  hint="At least 8 characters with uppercase, lowercase, and a number"
/>
```

---

#### Headless UI Components

The following components wrap Headless UI primitives (fully keyboard-navigable and screen-reader accessible) with Inithium theme styles applied.

**`IDialog`** — Modal dialog with backdrop blur, transition animations, and theme-aware panel.

```vue
<script setup lang="ts">
const isOpen = ref(false);
</script>

<template>
  <IButton @click="isOpen = true">Open Dialog</IButton>

  <IDialog :open="isOpen" title="Confirm Action" @close="isOpen = false">
    <IText color="secondary" style="margin-top: 0.5rem">
      Are you sure you want to proceed? This cannot be undone.
    </IText>
    <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem">
      <IButton intent="danger" @click="confirmAction">Confirm</IButton>
      <IButton variant="outline" @click="isOpen = false">Cancel</IButton>
    </div>
  </IDialog>
</template>
```

**`IMenu`** — Accessible dropdown menu from a trigger slot.

```vue
<IMenu
  :items="[
    { label: 'Edit Profile', onClick: () => router.push('/profile') },
    { label: 'Settings', onClick: () => router.push('/settings') },
    { label: 'Delete Account', onClick: handleDelete, danger: true },
    { label: 'Disabled Option', onClick: () => {}, disabled: true },
  ]"
>
  <template #trigger>
    <IButton variant="ghost">Options ▾</IButton>
  </template>
</IMenu>
```

**`IDisclosure`** — Accessible accordion/collapsible panel.

```vue
<IDisclosure title="What is Inithium?" :default-open="false">
  <IText color="secondary" style="padding: 1rem 0">
    Inithium is a monorepo starter with a Vue frontend and Express backend...
  </IText>
</IDisclosure>
```

**`ISwitch`** — Accessible toggle switch, bindable with `v-model`.

```vue
<ISwitch v-model="notificationsEnabled" label="Enable notifications" />
<ISwitch v-model="darkMode" label="Dark mode" />
```

**`IListbox`** — Accessible styled select/listbox, bindable with `v-model`.

```vue
<script setup lang="ts">
import type { ListboxItem } from '@inithium/ui';
const selected = ref<ListboxItem | null>(null);
const options: ListboxItem[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'member', label: 'Member' },
  { value: 'guest', label: 'Guest', disabled: true },
];
</script>

<template>
  <IListbox
    v-model="selected"
    :items="options"
    label="User Role"
    placeholder="Select a role..."
  />
</template>
```

---

### Dark Mode

Dark mode in Inithium is **per-user**, not per-system. The user's preference is stored in `localStorage` and restored on the next visit. The `ThemeProvider` controls which token set (`lightTheme` vs `darkTheme`) is active, and every component reactively updates because all styles derive from the injected theme `ref`.

```vue
<!-- App.vue — restore preference on load -->
<script setup lang="ts">
import { ThemeProvider } from '@inithium/ui';
const savedMode =
  (localStorage.getItem('theme-mode') as 'light' | 'dark') || 'light';
</script>

<template>
  <ThemeProvider :initial-mode="savedMode">
    <RouterView />
  </ThemeProvider>
</template>
```

```vue
<!-- Any component — toggle and persist preference -->
<script setup lang="ts">
import { useTheme } from '@inithium/ui';
const { isDark, toggleMode } = useTheme();

function toggle() {
  toggleMode();
  localStorage.setItem('theme-mode', isDark.value ? 'dark' : 'light');
}
</script>

<template>
  <IButton variant="ghost" @click="toggle">
    {{ isDark ? '☀️ Light Mode' : '🌙 Dark Mode' }}
  </IButton>
</template>
```

Because the theme system uses semantic tokens (not Tailwind's `dark:` class variants), dark mode works even in inline styles and does not require any Tailwind configuration — it's a pure Vue reactivity problem solved entirely by the token layer.

---

## Package: `@inithium/auth`

![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=flat-square&logo=jsonwebtokens)
![Singleton State](https://img.shields.io/badge/State-Singleton_Reactive-4FC08D?style=flat-square)
![Cookie + LocalStorage](https://img.shields.io/badge/Storage-Cookie_+_LocalStorage-orange?style=flat-square)

`@inithium/auth` is the centralized authentication layer for the monorepo. It provides a Vue composable, form validators, and token storage utilities — the complete auth lifecycle from form submission to session persistence across page refreshes.

### `useAuth()` Composable

`useAuth()` manages **singleton reactive state** — meaning the `currentUser`, `token`, `loading`, and `error` refs are created once at the module level and shared across every component that calls `useAuth()`. You never get out-of-sync auth state between two different parts of the UI.

```typescript
import { useAuth } from '@inithium/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const {
  user, // Readonly<Ref<User | null>>
  token, // Readonly<Ref<string | null>>
  loading, // Readonly<Ref<boolean>>
  error, // Readonly<Ref<string | null>>
  isAuthenticated, // ComputedRef<boolean>
  isAdmin, // ComputedRef<boolean>
  register,
  login,
  logout,
  initializeAuth,
} = useAuth(API_URL);
```

#### `register(credentials)`

Validates the form client-side, then calls `POST /api/auth/register`. On success, stores the JWT and sets reactive user state.

```typescript
const result = await register({
  email: 'jane@example.com',
  password: 'SecurePass1',
  displayName: 'Jane Smith',
});

if (result.success) {
  router.push({ name: 'Dashboard' });
} else {
  // result.error — server error message
  // result.errors — field-level validation errors object
}
```

#### `login(credentials)`

Validates client-side, calls `POST /api/auth/login`. On success, stores JWT and sets reactive state. The backend also sets an `HttpOnly` cookie for added security.

```typescript
const result = await login({
  email: 'jane@example.com',
  password: 'SecurePass1',
});

if (result.success) {
  router.push({ name: 'Dashboard' });
}
```

#### `logout()`

Calls `POST /api/auth/logout` (which clears the server-side cookie), then clears localStorage and resets reactive state to null.

```typescript
await logout();
router.push({ name: 'Login' });
```

#### `initializeAuth()`

Call this **once at application startup**, before mounting. It checks localStorage for a stored token, validates it isn't expired, and if valid, calls `GET /api/auth/me` to restore the full user object into reactive state. This is what makes sessions persist across page refreshes without requiring a new login.

```typescript
// apps/web/src/main.ts
const { initializeAuth } = useAuth(API_URL);
await initializeAuth();

app.mount('#app');
```

If the stored token is expired or the `/me` request fails, the tokens are cleared silently and the user starts unauthenticated — they'll be redirected to login by the router guard if they try to access a protected route.

#### Reactive State

Because state is singleton and reactive, the navbar, the dashboard, the router guard, and any other component all stay in sync automatically:

```vue
<script setup lang="ts">
const { user, isAuthenticated, isAdmin } = useAuth(API_URL);
</script>

<template>
  <nav>
    <span v-if="isAuthenticated">Welcome, {{ user?.displayName }}</span>
    <RouterLink v-if="isAdmin" to="/admin">Admin Panel</RouterLink>
    <IButton v-if="isAuthenticated" @click="logout">Logout</IButton>
  </nav>
</template>
```

---

### Validators

`@inithium/auth` exports form validators built on top of `@inithium/shared`'s validation utilities. They return a discriminated union that's easy to check and display.

```typescript
import { validateLogin, validateRegister } from '@inithium/auth';
import type { ValidationResult } from '@inithium/auth';

const result: ValidationResult = validateRegister({
  email: 'not-an-email',
  password: 'weak',
  displayName: 'J',
});

if (!result.valid) {
  result.errors.email; // 'Please enter a valid email address.'
  result.errors.password; // 'Password must be at least 8 characters...'
  result.errors.displayName; // 'Display name must be at least 2 characters.'
}
```

These validators run **before** any network request is made, giving users immediate feedback and avoiding unnecessary API calls for clearly invalid input.

---

### Token Storage

The storage utilities handle all `localStorage` interaction for tokens. They're used internally by `useAuth()` but are exported for advanced use cases.

```typescript
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  isTokenExpired,
} from '@inithium/auth';

const token = getStoredToken(); // returns string | null
setStoredToken('eyJhbGc...'); // stores under TOKEN_KEY
clearStoredToken(); // removes both access + refresh token keys

// Check expiry without making a network call
// Decodes the JWT payload and compares exp to Date.now()
isTokenExpired('eyJhbGc...'); // true if expired, true if malformed
```

---

## Package: `@inithium/api-client`

![Typed](https://img.shields.io/badge/Typed-HTTP_Bridge-3178C6?style=flat-square&logo=typescript)
![Auto Auth](https://img.shields.io/badge/Auth-Auto_Token_Injection-FB015B?style=flat-square)
![Extensible](https://img.shields.io/badge/Design-Extensible_Endpoint_Groups-brightgreen?style=flat-square)

`@inithium/api-client` is the typed communication layer between frontend apps and the Express backend. It centralizes all HTTP calls — no raw `fetch` calls scattered across Vue components. Every request is typed, every response is typed, and authentication tokens are attached automatically.

### `ApiClient` Class

The base class handles the `fetch` mechanics: attaching the `Authorization` header from `getStoredToken()`, sending credentials cookies, setting `Content-Type`, and returning a typed `ApiResponse<T>`.

```typescript
import { ApiClient } from '@inithium/api-client';

const client = new ApiClient('http://localhost:5000');

// Generic request method
const response = await client.request<User>('/api/users/123', {
  method: 'GET',
});

// Shorthand methods
const getRes = await client.get<User>('/api/users/123');
const postRes = await client.post<User>('/api/users', newUserData);
const putRes = await client.put<User>('/api/users/123', updatedData);
const patchRes = await client.patch<User>('/api/users/123', partialData);
const deleteRes = await client.delete<null>('/api/users/123');
```

### `createApiClient()` Factory

In practice, you never use `ApiClient` directly in app code. Instead, call `createApiClient()` once and import the singleton instance. This factory assembles all endpoint groups onto a single object.

```typescript
// apps/web/src/lib/api.ts
import { createApiClient } from '@inithium/api-client';
export const api = createApiClient(import.meta.env.VITE_API_URL);
```

```typescript
// Anywhere in the app:
import { api } from '@/lib/api';

// Auth endpoints
await api.auth.register({ email, password, displayName });
await api.auth.login({ email, password });
await api.auth.logout();
const { data } = await api.auth.me();

// User endpoints
const usersPage = await api.users.list({ page: 1, pageSize: 20 });
const user = await api.users.getById('64abc...');
await api.users.update('64abc...', { displayName: 'New Name' });
await api.users.delete('64abc...');
```

### Endpoint Groups

Endpoint groups are plain functions that take a `client` instance and return a typed object of API methods. Each method uses the `API_ROUTES` constants from `@inithium/shared` for its path and is typed end-to-end.

```typescript
// packages/api-client/src/endpoints/auth.ts
export function createAuthEndpoints(client: ApiClient) {
  return {
    register: (credentials: RegisterCredentials) =>
      client.post<{ user: User; token: string }>(
        API_ROUTES.AUTH.REGISTER,
        credentials
      ),

    login: (credentials: LoginCredentials) =>
      client.post<{ user: User; token: string }>(
        API_ROUTES.AUTH.LOGIN,
        credentials
      ),
    // ...
  };
}
```

### Extending the Client

Adding support for a new backend resource — say, a `posts` resource — is a four-step process:

**Step 1:** Add the routes to `API_ROUTES` in `@inithium/shared`:

```typescript
// packages/shared/src/constants/index.ts
export const API_ROUTES = {
  // ...existing routes
  POSTS: {
    BASE: '/api/posts',
    BY_ID: (id: string) => `/api/posts/${id}`,
    BY_SLUG: (slug: string) => `/api/posts/slug/${slug}`,
  },
} as const;
```

**Step 2:** Add the types in `@inithium/shared`:

```typescript
// packages/shared/src/types/post.ts
export interface Post {
  id: string;
  title: string;
  slug: string;
  body: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title: string;
  body: string;
}
```

**Step 3:** Create the endpoint group in `@inithium/api-client`:

```typescript
// packages/api-client/src/endpoints/posts.ts
import type { ApiClient } from '../client';
import type {
  Post,
  CreatePostInput,
  PaginatedResponse,
} from '@inithium/shared';
import { API_ROUTES } from '@inithium/shared';

export function createPostEndpoints(client: ApiClient) {
  return {
    list: () => client.get<PaginatedResponse<Post>>(API_ROUTES.POSTS.BASE),
    getById: (id: string) => client.get<Post>(API_ROUTES.POSTS.BY_ID(id)),
    getBySlug: (slug: string) =>
      client.get<Post>(API_ROUTES.POSTS.BY_SLUG(slug)),
    create: (data: CreatePostInput) =>
      client.post<Post>(API_ROUTES.POSTS.BASE, data),
    update: (id: string, data: Partial<CreatePostInput>) =>
      client.patch<Post>(API_ROUTES.POSTS.BY_ID(id), data),
    delete: (id: string) => client.delete<null>(API_ROUTES.POSTS.BY_ID(id)),
  };
}
```

**Step 4:** Register it in `createApiClient.ts`:

```typescript
import { createPostEndpoints } from './endpoints/posts';

export function createApiClient(baseUrl: string) {
  const client = new ApiClient(baseUrl);
  return {
    auth: createAuthEndpoints(client),
    users: createUserEndpoints(client),
    posts: createPostEndpoints(client), // ← new
    _client: client,
  };
}
```

That's it. `api.posts.create(...)`, `api.posts.list()`, and all other post endpoints are now fully typed and available across every app in the monorepo.

---

## App: `@inithium/api` — Express Backend

![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-HttpOnly_Cookie-FB015B?style=flat-square)
![Bcrypt](https://img.shields.io/badge/Passwords-Bcrypt_x12-red?style=flat-square)

### Database Connection

`apps/api/src/lib/db.ts` wraps the Mongoose connection in a singleton guard — calling `connectDB()` multiple times is safe and idempotent, which is important when hot-reloading in development.

### User Model

The Mongoose `User` model (`apps/api/src/models/User.ts`) automatically hashes passwords before save using a `pre('save')` hook with bcrypt at 12 salt rounds. The `password` field is excluded from queries by default (`select: false`) — you must explicitly opt into retrieving it:

```typescript
// In auth controller — only when you need to compare passwords
const user = await User.findOne({ email }).select('+password');
const isValid = await user.comparePassword(candidatePassword);
```

The model also overrides `toJSON` to strip the password from any serialized response, so it's impossible to accidentally leak it.

### Auth Routes

| Method | Path                 | Auth Required | Description                        |
| ------ | -------------------- | ------------- | ---------------------------------- |
| `POST` | `/api/auth/register` | No            | Register new user, returns JWT     |
| `POST` | `/api/auth/login`    | No            | Login, returns JWT + sets cookie   |
| `POST` | `/api/auth/logout`   | No            | Clears session cookie              |
| `GET`  | `/api/auth/me`       | Yes           | Returns current authenticated user |

JWTs are issued with a **7-day expiry** and are delivered both in the response body (for localStorage) and as an `HttpOnly`, `SameSite=strict` cookie (for cookie-based auth). This dual approach means `useAuth()` can use either mechanism.

### Middleware

#### `authenticate`

Guards any route that requires a logged-in user. Checks the `Authorization: Bearer <token>` header first, then falls back to the `token` cookie.

```typescript
import { authenticate } from '../middleware/authenticate';

// Apply to a single route
router.get('/api/profile', authenticate, getProfile);

// Apply to all routes in a router
router.use(authenticate);
```

On success, attaches the decoded `JwtPayload` to `req.user`, making the user's `id`, `email`, and `role` available in every subsequent handler.

#### `requireRole`

Role-based access control middleware. Applied after `authenticate`.

```typescript
import { authenticate, requireRole } from '../middleware/authenticate';
import { USER_ROLES } from '@inithium/shared';

// Admin-only route
router.delete(
  '/api/users/:id',
  authenticate,
  requireRole(USER_ROLES.ADMIN),
  deleteUser
);

// Multi-role route (admin OR member)
router.post(
  '/api/posts',
  authenticate,
  requireRole(USER_ROLES.ADMIN, USER_ROLES.MEMBER),
  createPost
);
```

### Extending the API

To add a new resource to the backend, follow this pattern:

**1. Create the Mongoose model** in `apps/api/src/models/`:

```typescript
// apps/api/src/models/Post.ts
import { Schema, model, Document } from 'mongoose';

export interface IPostDocument extends Document {
  title: string;
  body: string;
  authorId: string;
}

const PostSchema = new Schema<IPostDocument>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    authorId: { type: String, required: true, ref: 'User' },
  },
  { timestamps: true }
);

export const Post = model<IPostDocument>('Post', PostSchema);
```

**2. Create the controller** in `apps/api/src/controllers/`:

```typescript
// apps/api/src/controllers/post.controller.ts
import { Request, Response } from 'express';
import { Post } from '../models/Post';
import { AppError, toApiError } from '@inithium/shared';

export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const { title, body } = req.body;
    if (!title || !body) throw new AppError('Title and body are required', 400);

    const post = await Post.create({ title, body, authorId: req.user!.sub });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    const { error, statusCode } = toApiError(err);
    res.status(statusCode).json({ success: false, error });
  }
}
```

**3. Create the router** and register it in `apps/api/src/app/index.ts`:

```typescript
// apps/api/src/routes/post.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { createPost } from '../controllers/post.controller';

const router = Router();
router.post('/', authenticate, createPost);
export default router;

// In apps/api/src/app/index.ts:
import postRoutes from '../routes/post.routes';
app.use('/api/posts', postRoutes);
```

---

## App: `@inithium/web` — Vue Frontend

![Vue 3](https://img.shields.io/badge/Vue-3_Composition_API-4FC08D?style=flat-square&logo=vue.js)
![Vue Router](https://img.shields.io/badge/Vue_Router-4.x-4FC08D?style=flat-square)

### Routing & Guards

The router uses `createWebHistory()` and a `beforeEach` navigation guard that checks `isAuthenticated` before allowing access to any route marked with `meta: { requiresAuth: true }`:

```typescript
router.beforeEach((to) => {
  const { isAuthenticated } = useAuth(API_URL);
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Preserve the intended destination for redirect after login
    return { name: 'Login', query: { redirect: to.fullPath } };
  }
});
```

After a successful login, the app reads `route.query.redirect` and returns the user to where they were trying to go:

```typescript
const redirect = route.query.redirect as string | undefined;
router.push(redirect ?? { name: 'Dashboard' });
```

### Auth Integration

The frontend app uses `useAuth()` for all auth interactions. The singleton pattern means the navbar, the page guard, and the login form all share the exact same reactive state — log in on the form, and the navbar updates instantly without any event bus or Pinia store.

### Theming Integration

The entire app is wrapped in `<ThemeProvider>` at the root (`App.vue`). Any component — including those from `@inithium/ui` — can call `useTheme()` to read tokens or trigger mode switches. Persisting the user's preference is done with `localStorage` in the toggle handler.

---

## Getting Started

![Prerequisites](https://img.shields.io/badge/Requires-Node_20+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/Requires-MongoDB_Atlas-47A248?style=flat-square&logo=mongodb)

### Prerequisites

- Node.js 20+
- An active MongoDB Atlas cluster (or local MongoDB instance)
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/inithium.git
cd inithium

# Install all dependencies (workspaces)
npm install
```

### Environment Setup

Create a `.env` file in the root (or in `apps/api/`):

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_secure_random_secret_here
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/inithium?appName=Cluster0
```

Create a `.env` in `apps/web/`:

```env
VITE_API_URL=http://localhost:5000
```

### Running the Project

```bash
# Build all packages first (required on first run)
npm run build:libs

# Start both API and web in parallel
npm run dev

# Or run individually
npm run dev:api   # http://localhost:5000
npm run dev:web   # http://localhost:5173
```

### Health Check

```
GET http://localhost:5000/health
→ { "status": "ok" }
```

---

## Adding New Packages

![NX](https://img.shields.io/badge/NX_Generator-@nx/js:library-143157?style=flat-square&logo=nx)

```bash
# JavaScript/TypeScript library
npx nx g @nx/js:library packages/my-package \
  --importPath=@inithium/my-package \
  --buildable=true

# Vue component library
npx nx g @nx/vue:library packages/my-vue-package \
  --importPath=@inithium/my-vue-package \
  --buildable=true
```

After generating, add the path alias to `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@inithium/my-package": ["packages/my-package/src/index.ts"]
    }
  }
}
```

Then export your public API from `packages/my-package/src/index.ts` and import it in any app or package:

```typescript
import { myUtil } from '@inithium/my-package';
```

NX's `"dependsOn": ["^build"]` config in `nx.json` ensures the package is always built before any app that consumes it.

---

## Adding New Apps

![NX](https://img.shields.io/badge/NX_Generator-@nx/vue:app-143157?style=flat-square&logo=nx)

```bash
# Vue app (e.g. an admin panel)
npx nx g @nx/vue:app apps/admin

# Node app (e.g. a background worker)
npx nx g @nx/node:app apps/worker
```

Every new app immediately has access to the full package ecosystem — import `@inithium/shared`, `@inithium/ui`, `@inithium/auth`, and `@inithium/api-client` without any additional configuration. The path aliases in `tsconfig.base.json` and NX's dependency graph handle the rest.

For a new Vue app, the minimal setup to get auth and theming working:

```typescript
// apps/admin/src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { useAuth } from '@inithium/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function bootstrap() {
  const { initializeAuth } = useAuth(API_URL);
  await initializeAuth(); // restore session before mount

  createApp(App).mount('#app');
}

bootstrap();
```

```vue
<!-- apps/admin/src/App.vue -->
<script setup lang="ts">
import { ThemeProvider } from '@inithium/ui';
</script>

<template>
  <ThemeProvider initial-mode="light">
    <!-- Your admin app here — full theme + auth available immediately -->
  </ThemeProvider>
</template>
```

---

## Environment Variables

| Variable       | Location        | Description                                            |
| -------------- | --------------- | ------------------------------------------------------ |
| `NODE_ENV`     | `apps/api/.env` | `development` or `production`                          |
| `PORT`         | `apps/api/.env` | Express server port (default: `5000`)                  |
| `JWT_SECRET`   | `apps/api/.env` | Secret key for signing/verifying JWTs                  |
| `MONGO_URI`    | `apps/api/.env` | MongoDB Atlas connection string                        |
| `CORS_ORIGIN`  | `apps/api/.env` | Allowed CORS origin (default: `http://localhost:5173`) |
| `VITE_API_URL` | `apps/web/.env` | Base URL for API calls from the frontend               |

---

## Scripts Reference

Run all scripts from the **monorepo root**.

| Command              | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `npm run dev`        | Start both API and web in parallel                         |
| `npm run dev:api`    | Start the Express API only                                 |
| `npm run dev:web`    | Start the Vue frontend only                                |
| `npm run build`      | Build all apps and packages                                |
| `npm run build:libs` | Build packages only (`shared`, `ui`, `auth`, `api-client`) |
| `npm run lint`       | Lint all projects                                          |
| `npm run test`       | Run all tests                                              |
| `npm run typecheck`  | TypeScript type-check all projects                         |

NX's affected commands let you scope work to only what changed:

```bash
# Only build/test what's affected by your changes
npx nx affected:build
npx nx affected:test
npx nx affected:lint
```

NX also caches build outputs — repeated builds of unchanged packages are instant.

---

<div align="center">

<br />

Built with the belief that a great foundation makes great products inevitable.

<br />

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![NX](https://img.shields.io/badge/NX-143157?style=for-the-badge&logo=nx&logoColor=white)

</div>
