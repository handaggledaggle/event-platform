# next16-frontend-pack

Validated frontend starter pack for Daggle web product codegen.

## Baseline

- Next.js 16.1.6 App Router
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- TanStack Query 5
- Zustand 5
- shadcn-style UI primitives
- package manager: `pnpm@10.28.2`

## Intended Use

Use this pack as the frontend foundation layer.

- Copy the pack into a new worktree
- Exclude runtime/build artifacts listed in [`.templateignore`](./.templateignore)
- Keep framework/config/tooling files from the pack as the baseline
- Generate only application-specific UI, routes, and feature slices on top

## Validation

Canonical validation commands:

```bash
pnpm lint
pnpm build
```

## Notes

- This pack is frontend-only.
- `pnpm-lock.yaml` is the canonical lockfile.
- Yarn-specific runtime files are not part of the template baseline.
