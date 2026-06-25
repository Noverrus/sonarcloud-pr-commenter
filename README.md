# SonarCloud PR Commenter

> SonarCloud PR Commenter is a zero-dependency CLI that fetches SonarCloud issues and automatically creates or updates a clean, human-readable comment on GitHub Pull Requests.

You can run this directly in any GitHub Action workflow via `npx` without needing to copy-paste scripts into your repository!

## ✨ Features

- **Zero dependencies**: Built entirely with native Node.js (`fetch` API).
- **Works with GitHub Actions**: Seamless integration into your CI/CD pipeline.
- **Automatically creates or updates PR comments**: Keeps your PRs clean without spamming new comments.
- **Converts SonarCloud issues into readable Markdown**: Makes it easy for developers to understand the issues.
- **Idempotent comment updates**: Finds the existing bot comment and updates it.
- **Easy to run**: Execute directly with `npx`.

## 📊 Example Output

Hello! 👋 The SonarCloud bot has reviewed your code. Overall it looks good, but there are **2** open issues to look at. Here are the details:

- In `src/index.ts` (line 42): *"Remove this unused variable"*
- In `src/utils/parser.ts` (line 15): *"Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed."*

---

## 🚀 Usage via GitHub Actions (NPX)

To use this bot, you don't need to clone or install anything locally. Just add this step to your GitHub Actions workflow (`.github/workflows/sonar-bot.yml`):

```yaml
name: SonarCloud Human PR Bot

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  sonar-bot:
    runs-on: ubuntu-latest
    # SECURITY: Prevent running on external forks to protect secrets
    if: github.event.pull_request.head.repo.full_name == github.repository
    
    steps:
      - name: Wait for SonarCloud Analysis (Optional)
        run: sleep 60
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Run PR Bot via NPX
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PROJECT_KEY: 'your_project_key_here'
        run: npx sonarcloud-pr-commenter
```

> **Note**: This CLI handles creating and updating the PR comment automatically using the GitHub API! No need for third-party comment actions.

## ⚙️ Configuration & Secrets

The bot relies on environment variables provided in the workflow:

- `SONAR_TOKEN`: Your SonarCloud token. Set this up in **GitHub Repository -> Settings -> Secrets and variables -> Actions**.
- `GITHUB_TOKEN`: This is automatically provided by GitHub Actions (`${{ secrets.GITHUB_TOKEN }}`).
- `PROJECT_KEY`: The key of your project in SonarCloud (e.g., `my-org_my-project`).

## 📦 Publishing to NPM

If you are the owner of this repository and want to publish it to the NPM registry so people can use `npx sonarcloud-pr-commenter`, follow these steps:

1. Create an account on [npmjs.com](https://www.npmjs.com/).
2. Run `npm login` in your terminal.
3. Run `npm publish`.

## 🛠️ Customizing the Bot's Vibe

If you want to modify the message or bot's tone before publishing your own version:
1. Open `bin/bot.js`.
2. Look for the `markdown +=` lines.
3. Edit the English templates to fit your team's personality!
