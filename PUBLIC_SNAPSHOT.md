# Public Snapshot

## Status

This repository is a sanitized, intentionally non-turnkey portfolio evaluation snapshot of a functioning marketplace and local-LLM chat application.

## Included

- Product-facing Next.js and React application source
- NextAuth, Prisma, PostgreSQL data model, and validation logic
- Ollama integration code
- Production web Dockerfile
- Synthetic demonstration screenshot, GIF, and MP4
- Security, architecture, and verification notes

## Excluded

- `.env` files and environment-value templates
- Docker Compose and all one-command service orchestration
- Database bootstrap, model-pull automation, and seeded data
- Cloud deployment, reverse proxy, DNS, TLS, OAuth, SSH, VPN, and operator procedures
- Credentials, secrets, private addresses, personal data, machine paths, and private domains
- Historical notebooks, manuals, troubleshooting transcripts, backups, and source-repository history

## Evidence boundary

The complete application was run and browser-tested in a separate private local environment on Apple Silicon. This public artifact is validated as source and as a production web-image build; it is not a packaged runtime or a current audit of any hosted deployment. No cloud resource was started or modified to prepare it.
