# Post-Change Workflow Prompt

## Context

This prompt runs after every change.

## Task

When you complete any changes, automatically follow these steps:

### 1. Git Commit

1. **Check git status and changes**

   ```bash
   git status
   git diff
   ```

2. **Analyze changes and create commit**
   - Review all changes made
   - Create a descriptive commit message
   - Include the prompt name that was executed
   - Commit all changes

## Workflow Summary

1. **Commit changes**
   - Review with `git status` and `git diff`
   - Create descriptive commit with prompt name

## Important Notes

- Always include the prompt name in commit messages

## Example Commit Message

```feat: implement products API with Redux integration

- Added ProductsService API client
- Created Redux RTK Query slice for products
- Updated store configuration
- Added product-related types

> Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```
