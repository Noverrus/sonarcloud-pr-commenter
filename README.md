# SonarCloud Human-Readable PR Bot

A friendly, open-source GitHub Actions bot that fetches SonarCloud open issues and translates them into a conversational English summary on your internal Pull Requests.

## Directory Structure

```text
.
├── .github/
│   └── workflows/
│       └── sonar-human-bot.yml   # The GitHub Actions Workflow
├── scripts/
│   └── sonar-issues.js           # Node.js Fetch & Templating Script
├── package.json                  # Node.js configuration
└── README.md                     # Documentation
```

## 1. Environment Setup

This bot uses the native `fetch` API available in Node.js 18+. Because the GitHub Action uses `setup-node@v4` with Node 20, **you do not need to install `axios` or any other external dependencies.**

If you are adding this to an existing repository, no additional packages are required. If you are starting a fresh repository, initialize `package.json` by running:

```bash
npm init -y
```

> **Note:** No other `npm install` commands are needed! The script relies entirely on built-in modules.

## 2. Configuration & Secrets

To keep your SonarCloud token secure, it must be added to GitHub Secrets, not hardcoded in the codebase. The workflow restricts execution to internal branches using the `if: github.event.pull_request.head.repo.full_name == github.repository` condition, protecting your token from being exposed to malicious external PRs.

### Setting up SONAR_TOKEN

1. Go to **SonarCloud** -> **My Account** -> **Security** and generate a token.
2. Go to your **GitHub Repository** -> **Settings** -> **Secrets and variables** -> **Actions**.
3. Click **New repository secret**.
4. Name: `SONAR_TOKEN`
5. Paste the token value and save.

## 3. Customizing the Bot's Vibe

You can easily customize the English string templates inside `scripts/sonar-issues.js` to match your team's personality. 

Look for the `markdown +=` lines inside the `fetchIssues()` function. For example, to make it more professional, change:

```javascript
"Hello! 👋 The SonarCloud bot has reviewed your code..."
```

to something like:

```javascript
"The automated SonarCloud analysis has completed..."
```
