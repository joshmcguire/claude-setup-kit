Research a topic using Claude.ai's web interface (which has more up-to-date knowledge and web search) and bring the results back as context.

## Instructions

Run the Playwright research script with the user's query. The script automates Claude.ai in a browser via xvfb (invisible), sends the query to Claude Opus, waits for the full response, and prints it to stdout.

1. Run this command and capture the output (give it up to 5 minutes — long research answers take time):
```
bash ~/.claude/research/run-research.sh $ARGUMENTS
```

2. If the command fails with "No auth.json found", tell the user they need to run auth setup first. They should type this in their terminal:
```
! node ~/.claude/research/setup-auth.js
```
This opens a visible browser window where they log into claude.ai once. After logging in and seeing the chat, they press Enter to save the session.

3. If the command fails with "Auth expired", same thing — re-run the setup-auth step above.

4. If the command fails for any other reason, read the debug screenshot at `~/.claude/research/debug-screenshot.png` to diagnose what went wrong on the page.

5. If successful, the stdout output IS the research result. Use it as context for the conversation. The full result is also saved at `~/.claude/research/output.md` for reference.

**Important:** The research query is: $ARGUMENTS
