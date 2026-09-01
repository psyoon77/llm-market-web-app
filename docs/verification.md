# Verification

## Public-artifact checks

From `web/`:

```bash
npm ci
npm run lint
npm run build
npm audit
docker build -t llm-market-web-app-review .
```

These checks validate dependency resolution, lint, strict production compilation, dependency advisories, and the production web-image build. Runtime services are intentionally not included in the public artifact.

## Private-runtime acceptance evidence

The following checks were completed with synthetic data in the separate private local test environment before the release boundary was applied:

1. Create an account, sign in, sign out, and verify account-only redirects.
2. Create listings with and without images, then edit and delete them as their owner.
3. Search with matching single- and multi-word title prefixes and a nonmatching term.
4. Update a synthetic profile and view its public seller page.
5. Confirm another signed-in user cannot access listing edit or delete controls.
6. Send local-LLM prompts as both a guest and a signed-in user.
7. Reload and confirm saved messages remain.
8. Create and delete a second chat session.
9. Confirm one saved chat must remain, five are allowed, and a sixth is rejected.
10. Confirm unauthenticated writes are rejected and invalid or oversized inputs fail safely.
11. Confirm public product responses expose only the owner's ID, name, and username.

## September 2, 2026 result

The complete private runtime passed account, marketplace, image, profile, ownership, session, and local-LLM chat acceptance on an Apple Silicon Mac. The final public artifact separately passed clean install, lint, strict production build, full dependency audit with zero reported vulnerabilities, Docker image build, documentation-link validation, media validation, privacy and secret-pattern scans, and a one-commit history audit.

This evidence does not claim that the public artifact is turnkey or that any hosted deployment is currently operating.
