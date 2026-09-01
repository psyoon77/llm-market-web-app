# Repository Guidance

## Purpose

Maintain a concise, source-reviewable portfolio snapshot of an LLM-assisted marketplace. The public artifact is intentionally non-turnkey.

## Release vocabulary

Use only evidence-backed status language:

- `implemented` for source that exists;
- `private-runtime verified` for behavior exercised in the separate local runtime;
- `public-artifact verified` for checks repeatable from this repository;
- `not verified` for an untested environment;
- `excluded` for material intentionally outside this public snapshot.

Do not describe cloud infrastructure as live, current, or production-qualified without a fresh authorized check.

## Privacy and release boundary

Never add environment files or templates, credentials, personal names, email addresses, private domains, IP addresses, hostnames, machine paths, infrastructure notebooks, chat transcripts, seeded user records, or inherited repository history. Demo content must remain synthetic.

Do not add one-command runtime orchestration, database bootstrap, model-pull automation, cloud configuration, proxy rules, or deployment secrets. Preserve the distinction between assessable source and an operational deployment package.

## Validation

Before proposing a release, run a clean install, lint, production build, full dependency audit, production web-image build, documentation-link check, media validation, privacy scan, secret-pattern scan, and Git-history audit.
