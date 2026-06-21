# AGENTS.md

## Operational rules

- Use Docker for repository operations, builds, tests, and other project commands in this repo.
- Keep the runtime dependency surface as small as possible. Prefer implementing audio analysis and drawing locally instead of adding plotting, canvas, or DSP packages.
- When committing here, use `reaperkrew` as both author and committer, not Codex.
- After learning a repo-specific workflow preference or lesson, update AGENTS.md so future turns preserve it.
- This repo uses npm trusted publishing via GitHub Actions/OIDC; do not add NPM_TOKEN-based publishing unless the user explicitly asks.
- Before merging changes that should publish to npm, verify package.json and package-lock.json have a new version that is not already published; npm versions are immutable and republishing the same version will fail.

## Value system

- Use functional programming principles: pure functions, easily testable, push side-effects to the edge.
- `.ts` files must be no longer than 300 lines (excluding tests).
- Functions must be no longer than 20 lines (excluding tests).
- Never sacrifice code quality just to avoid hitting a length limit. Instead, prioritize refactoring into submodules immediately.
- Let the folder structure tell the story.
- Each sub-module should have its own README.
- Always ensure documentation is up-to-date when working on changes.
- Always use conventional commits when making changes. Commit your changes when you are finished with your task.
- Ensure proper version bumping occurs as per the changes made. This is an npm library, and it will be published upon merge to the default branch.
