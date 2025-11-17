---
name: code-structure-guide
description: |
  Comprehensive code structure and implementation rules guide for modular monolith architecture.

  **Auto-Activation Triggers:**
  - Before any code modification or refactoring
  - When creating new files or folders
  - When implementing new features
  - When fixing bugs that affect code structure

  **Purpose:**
  This skill ensures consistent code organization and adherence to architectural principles.
  Always consult this guide before making modifications to understand where code belongs
  and what patterns to follow.

tools: [Read, Write, Edit, Bash, Glob, Grep, TodoWrite]
---

# 🏗️ Code Structure & Implementation Guidee

## 📂 Project Structure Overview

This project follows a **modular monolith architecture** with clear separation between backend and frontend.

For detailed structure documentation, see:
- **Backend Structure**: `references/backend_structure.md`
- **Frontend Structure**: `references/frontend_structure.md`

For implementation rules, see:
- **Backend Rules**: `references/backend_rules.md`
- **Frontend Rules**: `references/frontend_rules.md`
- **Security Rules**: `references/security_rules.md`

---

## 🔄 Self-Update Protocol

When creating new files or folders, **automatically update the structure references** with the following format:

### Adding New Files:

```markdown
│   ├── [folder]/
│   │   └── [filename].ts    # Brief description of file purpose
```

### Adding New Folders:

```markdown
│   ├── [new-folder]/        # High-level purpose of this folder
│   │   └── [example-file].ts # Example file that belongs here
```

### Update Process:
1. Identify the modification (new file, new folder, refactor)
2. Update the appropriate structure reference file (Backend or Frontend)
3. Add brief description following existing format
4. Maintain alphabetical order within folders
5. Keep descriptions concise (one line maximum)

---

## ✅ Pre-Modification Checklist

Before making any code modifications, verify:

- [ ] I have reviewed the structure guide for the target folder
- [ ] I understand where the new code should be placed
- [ ] I am following the naming conventions (PascalCase/camelCase/lowercase)
- [ ] I am adhering to the layer separation (routes → controllers → repositories)
- [ ] I am following all ALWAYS DO rules for this file type
- [ ] I am avoiding all NEVER DO anti-patterns
- [ ] I am using httpOnly cookies for JWT tokens (NEVER localStorage)
- [ ] I will update structure references if creating new files/folders
- [ ] I have checked TypeScript type safety requirements
- [ ] I have planned proper error handling

---

## 🎯 Quick Reference

### Structure Files
- `references/backend_structure.md` - Complete backend folder structure
- `references/frontend_structure.md` - Complete frontend folder structure

### Rule Files
- `references/backend_rules.md` - Backend implementation patterns
- `references/frontend_rules.md` - Frontend implementation patterns
- `references/security_rules.md` - Security best practices

---

## 🎯 Remember

- **Structure First**: Always consult this guide before coding
- **Consistency**: Follow established patterns religiously
- **Security**: httpOnly cookies for tokens, validate all inputs, sanitize all outputs
- **Separation of Concerns**: Keep layers independent and focused
- **Type Safety**: Use TypeScript strict mode, no `any` types
- **Documentation**: Update structure references when changes occur

---

**Last Updated**: 2025-10-27
**Version**: 1.0.0
