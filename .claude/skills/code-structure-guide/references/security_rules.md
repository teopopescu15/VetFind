# 🔒 Security Implementation Rules

## ALWAYS DO

### Authentication & Authorization
- **ALWAYS** store JWT tokens in httpOnly cookies (NEVER localStorage or sessionStorage)
- Implement proper token refresh logic
- Validate tokens on every protected endpoint
- Use bcrypt for password hashing (minimum 10 rounds)

### Input Validation
- Validate all user inputs on both frontend and backend
- Use express-validator for backend validation
- Sanitize inputs to prevent XSS attacks
- Validate email formats before processing
- Implement CSRF protection for state-changing operations

### Data Protection
- Never log sensitive data (passwords, tokens, PII)
- Use HTTPS in production
- Implement proper CORS configuration
- Sanitize error messages before sending to client

---

## ❌ NEVER DO - Anti-Patterns

### Security Anti-Patterns
- NEVER store passwords in plain text
- NEVER expose JWT secrets in client-side code
- NEVER skip input validation on backend (even if frontend validates)
- NEVER return detailed error messages to client in production
- NEVER use weak JWT secrets (minimum 32 characters)
- **NEVER store JWT tokens in localStorage or sessionStorage (ALWAYS use httpOnly cookies)**

---

## 🔑 Key Security Principles

1. **Defense in Depth**: Validate on both frontend AND backend
2. **Least Privilege**: Users only access what they need
3. **Fail Securely**: Errors should not expose system internals
4. **httpOnly Cookies**: The ONLY acceptable way to store JWT tokens
5. **Input Sanitization**: Never trust user input
6. **HTTPS Always**: Encrypt all data in transit
7. **Secrets Management**: Never hardcode secrets, use environment variables
