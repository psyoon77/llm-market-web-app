# Architecture

## Application components

1. A browser interacts with the Next.js application.
2. NextAuth credentials sessions protect account-specific product, profile, and chat operations.
3. Prisma reads and writes PostgreSQL records for users, listings, images, chat sessions, and messages.
4. The chat route calls an evaluator-supplied Ollama service through its OpenAI-compatible API.
5. The included multi-stage Dockerfile builds the web application only.

Runtime provisioning is deliberately out of scope. PostgreSQL, Ollama, secrets, initialization, networking, and model lifecycle are not packaged in this public snapshot.

## Trust boundaries

- Browser and API input is untrusted.
- Routes validate identity, ownership, text lengths, image shape, and request rate where relevant.
- Password hashes remain server-side and are not returned by profile or product APIs.
- Database and model services belong behind an evaluator-defined private network boundary.
- The Dockerfile does not define a production security perimeter by itself.

## Data lifecycle

PostgreSQL owns application persistence and Ollama owns model storage. Neither service nor its storage lifecycle is provisioned by this repository. A real operator must define retention, deletion, backup, restoration, and access policy before deployment.
