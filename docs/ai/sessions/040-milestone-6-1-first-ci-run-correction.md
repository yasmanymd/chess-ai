# Session 040 — M6.1 First CI Run Correction

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Date         | 2026-08-26                                                 |
| Milestone    | M6.1 — CI and Reproducible Release Build                   |
| Participants | Yasmany (decision owner), Codex (implementation assistant) |
| Status       | Corrected locally; pending a new GitHub Actions run        |

## Trigger

The first GitHub Actions run for commit `e2754b4` failed in three jobs. The browser accessibility job passed.

## Observed Failures

1. The static-quality and PostgreSQL integration jobs failed while `pnpm/action-setup@v4` attempted to self-install pnpm.
   - The runner log reported use of an older Node runtime and a permission failure while attempting to create `/pnpm`.
2. The reproducible release-build job failed while compiling `@chess-ai/server`.
   - TypeScript reported that the common source directory required an explicit `rootDir`.

## Diagnosis

- The workflow installed pnpm before setting up the project Node version. This made the workflow depend on the action's self-installer behavior instead of the project-pinned runtime.
- The server compiler configuration relied on TypeScript inferring the source root. The current TypeScript version requires that source root to be stated explicitly for this compilation layout.

## Corrective Decisions and Changes

- Replaced `pnpm/action-setup@v4` in the static and integration jobs with an explicit sequence:
  1. `actions/setup-node@v5` with Node `24.16.0`.
  2. `npm install --global pnpm@11.22.0`.
  3. `pnpm install --frozen-lockfile`.
- Added `"rootDir": "src"` to `apps/server/tsconfig.json`.

## Verification

- Rebuilt the Docker `release-build` target from scratch with `--no-cache`.
- The server TypeScript build and the web production build completed successfully.
- The previously passing browser accessibility job was not changed by these corrections.

## Follow-up Correction

The second remote run reached Node `24.16.0`, but `actions/setup-node@v5` attempted its automatic package-manager cache before the explicit pnpm installation step. The cache setup could not find the pnpm executable and stopped both Node-based jobs.

- Disabled setup-node's automatic package-manager cache in the static and integration jobs.
- Retained the explicit, version-pinned pnpm installation immediately after Node setup.
- The Docker release build and browser accessibility jobs passed in this remote run, narrowing the remaining issue to this workflow initialization behavior.

## Learning Record

The initial workflow proposal was incomplete because it did not account for the action self-installer's runtime and filesystem assumptions. The correction removes that hidden dependency and aligns CI installation with the Docker build's explicit pnpm version.

## Next Step

Commit and push the correction, then confirm the next GitHub Actions run is green across all four jobs.
