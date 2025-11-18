# Security Policy

We take disclosure and handling of security issues seriously and ask that you follow the process below to keep MiniDex users safe.

## Supported Versions

Security fixes are applied to the `master` branch and released from there. Please stay up to date with the latest commit when deploying publicly.

## Reporting a Vulnerability

1. Open a private report via **GitHub Security Advisories** (`Security → Advisories → Report a vulnerability`). This keeps details out of public issues and pull requests.
2. If GitHub Advisories are not available for you, contact the maintainers privately via the email or contact method listed on the repository owner's profile and include the following:
   - Steps to reproduce
   - Expected vs. actual behaviour
   - Any proof-of-concept exploit code or logs
   - Suggested mitigations, if you have them
3. Please allow us reasonable time to investigate and remediate before disclosing publicly.

## Environment Secrets

- Copy `.env.example` to `.env` and keep it outside of source control. The Vapor server and Docker Compose stack both load database and admin credentials from this file via environment variables.
- Never commit real secrets. If something leaks, rotate the affected credentials immediately and purge any cached images that might contain them.
- When sharing reproduction steps, scrub credentials and replace them with placeholders to avoid accidental disclosure.

## Dependency & Secret Scanning

- Run `swift test`, `npm audit`, and `npm run lint` before opening pull requests to minimize the blast radius of issues.
- Automated secret scanning (see `.github/workflows/secret-scan.yml`) runs on every push/PR using Gitleaks. Treat failures as blocking and rotate anything that may have leaked.
- Prefer using password managers or sealed secrets when deploying to production infrastructure; do not paste secrets directly into CI logs or issue trackers.

Thank you for helping keep MiniDex safe!
