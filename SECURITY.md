# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability within SAVE ISMAEL, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Send an email to the repository owner with:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge your report within 48 hours
- **Assessment**: We will assess the vulnerability and its impact
- **Update**: We will keep you informed of our progress
- **Resolution**: Once fixed, we will release a patch and credit you (unless you prefer anonymity)

## Security Measures

This project implements several security measures:

### Server-Side Security

- **Helmet.js**: Secure HTTP headers including Content Security Policy
- **Rate Limiting**: API endpoints are rate-limited (100 requests per 15 minutes)
- **Input Validation**: All user inputs are validated
- **CORS Configuration**: Configurable Cross-Origin Resource Sharing
- **Payload Size Limits**: Request body size is limited to prevent DoS

### Client-Side Security

- **Content Security Policy**: Restricts script execution to trusted sources
- **No Sensitive Data Storage**: Game progress uses localStorage with no sensitive data
- **PWA Security**: Service workers follow security best practices

### Infrastructure

- **Docker**: Multi-stage builds minimize attack surface
- **Health Checks**: Continuous health monitoring
- **Dependabot**: Automated security updates for dependencies

## Best Practices for Contributors

1. Never commit secrets or API keys
2. Use environment variables for sensitive configuration
3. Keep dependencies up to date
4. Follow the principle of least privilege
5. Validate and sanitize all user inputs

## Known Security Considerations

### Development Environment Only

The following are acceptable in development but should be reviewed for production:

- `'unsafe-inline'` and `'unsafe-eval'` in CSP (required for Babylon.js)
- CORS with `*` origin (should be restricted in production)

### Production Recommendations

1. Set specific `CORS_ORIGIN` environment variable
2. Use HTTPS exclusively
3. Enable rate limiting
4. Monitor server logs for suspicious activity
5. Keep all dependencies updated

## Third-Party Dependencies

This project depends on several third-party packages. We:

- Regularly run `npm audit` to check for vulnerabilities
- Use Dependabot for automated security updates
- Review critical dependencies before major version upgrades

## Questions?

For security-related questions that don't require private disclosure, feel free to open a GitHub Discussion.
