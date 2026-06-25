# SonarCloud Human-Readable PR Bot

A friendly, zero-dependency CLI bot that fetches SonarCloud open issues and translates them into a conversational English summary on your internal Pull Requests.

You can run this directly in any GitHub Action workflow via `npx` without needing to copy-paste scripts into your repository!

## Usage via GitHub Actions (NPX)

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
        run: npx sonarcloud-human-pr-bot
```

> **Note**: This CLI handles creating and updating the PR comment automatically using the GitHub API! No need for third-party comment actions.

## Configuration & Secrets

The bot relies on environment variables provided in the workflow:

- `SONAR_TOKEN`: Your SonarCloud token. Set this up in **GitHub Repository -> Settings -> Secrets and variables -> Actions**.
- `GITHUB_TOKEN`: This is automatically provided by GitHub Actions (`${{ secrets.GITHUB_TOKEN }}`).
- `PROJECT_KEY`: The key of your project in SonarCloud (e.g., `my-org_my-project`).

## Publishing to NPM

If you are the owner of this repository and want to publish it to the NPM registry so people can use `npx sonarcloud-human-pr-bot`, follow these steps:

1. Create an account on [npmjs.com](https://www.npmjs.com/).
2. Run `npm login` in your terminal.
3. Run `npm publish`.

## Customizing the Bot's Vibe

If you want to modify the message or bot's tone before publishing your own version:
1. Open `bin/bot.js`.
2. Look for the `markdown +=` lines.
3. Edit the English templates to fit your team's personality!
