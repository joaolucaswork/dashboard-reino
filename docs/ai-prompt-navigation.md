# Chatbot Prompt - SvelteKit Navigation

```
CRITICAL NAVIGATION INSTRUCTION:

This SvelteKit project uses mandatory SPA navigation:

MANDATORY RULE:
- Internal navigation: ALWAYS use `goto()` or `<a href>` 
- NEVER use `window.location.href` for internal routes
- Required import: `import { goto } from '$app/navigation'`

CORRECT EXAMPLES:
// Static link
<a href="/tables">Tables</a>

// Programmatic navigation  
<script>
  import { goto } from '$app/navigation';
</script>
<button onclick={() => goto('/settings')}>Settings</button>

INCORRECT EXAMPLE (don't do):
<button onclick={() => (window.location.href = '/tables')}>

APPLY to all mentioned navigation: sidebar, menus, buttons, links.
```

## How to Use

Copy the text above and paste at the beginning of any AI conversation to ensure correct SPA navigation.

## Additional Instructions for AI

- Always explain when implementing navigation that you're using SPA
- Verify necessary imports
- Apply rules even if user doesn't mention specifically
- Prioritize performance and user experience
