---
name: app-tester
description: DELEGATION SKILL - Immediately invoke @agent-general-purpose to test the Haufe Hackathon application. This skill's ONLY purpose is to delegate testing work. Do NOT execute any tests, check containers, or use Playwright tools directly. Triggered by requests like "test the implementation", "verify the features work", "check if everything is working".
---

# App Tester Skill

**⚠️ DELEGATION ONLY - This skill does NOT execute tests. It ONLY invokes @agent-general-purpose.**

## Purpose

Immediately delegate ALL testing of the Haufe Hackathon application to @agent-general-purpose. Do NOT execute any testing yourself.

## When to Use This Skill

Use this skill when the user requests:
- Testing implemented features or components
- Verifying responsiveness across devices
- Checking if the application works correctly
- Running end-to-end tests
- Validating UI/UX consistency

## How to Use This Skill

### 🚨 MANDATORY FIRST ACTION 🚨

**IMMEDIATELY invoke @agent-general-purpose with the template below.**

Do NOT do anything else first. Do NOT check containers. Do NOT use Playwright. Do NOT execute tests.

Your ONLY action is to invoke @agent-general-purpose.

### Step-by-Step Process

1. **IMMEDIATELY invoke @agent-general-purpose** - Use the template below, customize the USER REQUEST field

2. **Wait for @agent-general-purpose** - Let it handle ALL testing work

3. **Relay results to user** - Share the test report from @agent-general-purpose

### Agent Invocation Template

When this skill is triggered, immediately invoke @agent-general-purpose with this exact pattern:

```
@agent-general-purpose

You are tasked with comprehensive testing of the Haufe Hackathon application.

USER REQUEST: [Insert the user's specific testing request]

APPLICATION DETAILS:
- URL: https://app.hackathon-haufe-teo.com
- Test Credentials:
  - Email: teopopescu15@gmail.com
  - Password: TeoHack$44

DOCKER CONTAINERS:
- haufe-frontend (port 5179) - React + Vite
- haufe-backend (port 8000) - Node.js + Express
- haufe-postgres (port 5432) - PostgreSQL 16

TESTING REQUIREMENTS:

1. PRE-TESTING:
   - Check Docker container health: sudo docker compose ps
   - Verify all 3 containers are running
   - If not running, ask user to start them

2. AUTHENTICATION:
   - Navigate to: https://app.hackathon-haufe-teo.com
   - Enter credentials and submit
   - Verify successful authentication
   - Check browser console and backend logs for errors

3. TEST EXECUTION:
   [Customize based on user request - examples below]

   For RESPONSIVE testing:
   - Test at viewports: 1920x1080, 1366x768, 768x1024, 414x896, 375x667
   - Check for layout breaks, text overflow, horizontal scrolling
   - Verify buttons are tappable (min 44x44px on mobile)
   - Verify navigation adapts (hamburger menu on mobile)

   For COMPONENT testing:
   - Test all interactive elements (buttons, forms, links)
   - Verify data flows correctly (frontend → backend → database)
   - Check styling consistency

   For AUTHENTICATION testing:
   - Test login flow
   - Verify cookies/tokens set correctly
   - Test logout
   - Test protected routes

4. ERROR MONITORING:
   - Check browser console: browser_console_messages
   - Check network requests: browser_network_requests
   - Check container logs:
     - sudo docker compose logs --tail=50 frontend
     - sudo docker compose logs --tail=50 backend
     - sudo docker compose logs --tail=50 postgres

5. SCREENSHOT MANAGEMENT:
   - Store screenshots in .playwright-mcp/ directory
   - If ALL tests PASS: delete screenshots with: rm -f /home/ubuntu/teo-simulare/.playwright-mcp/*.png
   - If ANY tests FAIL: preserve screenshots as evidence

6. REPORTING:
   Generate comprehensive report with:
   - Test summary (total, passed, failed)
   - Container health status
   - Detailed test results
   - Error analysis (full error messages, logs, screenshots)
   - Root cause analysis
   - Recommendations

TOOLS AVAILABLE:
- mcp__playwright__browser_navigate
- mcp__playwright__browser_snapshot
- mcp__playwright__browser_resize
- mcp__playwright__browser_console_messages
- mcp__playwright__browser_network_requests
- mcp__playwright__browser_type
- mcp__playwright__browser_click
- mcp__playwright__browser_take_screenshot
- Bash for Docker commands

CRITICAL RULES:
- NEVER modify application code
- NEVER simplify errors - provide full details
- ALWAYS check all 3 container logs
- Document everything comprehensively

Execute this testing plan and provide a complete report.
```

### Example Invocations

**For responsive testing:**
```
@agent-general-purpose

You are tasked with comprehensive testing of the Haufe Hackathon application.

USER REQUEST: Test if all pages are responsive

[Include full template above with responsive testing requirements highlighted]
```

**For authentication testing:**
```
@agent-general-purpose

You are tasked with comprehensive testing of the Haufe Hackathon application.

USER REQUEST: Test the authentication flow

[Include full template above with authentication testing requirements highlighted]
```

## What NOT to Do

When this skill is invoked, do NOT:

- ❌ Run `sudo docker compose ps` yourself
- ❌ Use `mcp__playwright__browser_navigate` yourself
- ❌ Use `mcp__playwright__browser_snapshot` yourself
- ❌ Use `mcp__playwright__browser_resize` yourself
- ❌ Take screenshots yourself
- ❌ Check logs yourself
- ❌ Execute ANY testing commands yourself
- ❌ Use the native Task tool

**If you find yourself using ANY Playwright tools or Docker commands directly, STOP. You should be invoking @agent-general-purpose instead.**

## Additional Resources

For detailed testing procedures, standards, and checklists, see:
- `references/testing-checklist.md` - Comprehensive testing standards
- `scripts/check_containers.sh` - Container health check script

These resources are for @agent-general-purpose to use, NOT for this skill to execute directly.

## Summary

This skill has ONE job: invoke @agent-general-purpose with the testing prompt template. Everything else happens in the agent instance.
