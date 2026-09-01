# Security

## Supported scope

This snapshot supports source review, dependency review, and web-image build evaluation. It intentionally does not supply a ready-to-run service topology, environment template, secrets, database initialization, model provisioning, or public deployment configuration.

## Reporting

Please use GitHub's private vulnerability reporting feature for security-sensitive findings. Do not include credentials, private data, or active exploit traffic in a public issue.

## Evaluator responsibilities

- Supply independent PostgreSQL and Ollama services only in an isolated test environment.
- Generate new secrets rather than reusing credentials from another system.
- Define database initialization, network exposure, and model policy explicitly.
- Run only trusted models and application changes.
- Keep container tooling and host software patched.
- Review dependency and container-image findings before deployment.

## Public deployment boundary

Do not expose this source directly to the internet without adding production secrets, TLS termination, distributed rate limiting, monitoring, backups, content controls, and a deployment-specific threat review. The included Dockerfile demonstrates a web build; it is not a complete deployment specification.
