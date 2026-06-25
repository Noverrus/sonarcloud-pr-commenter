#!/usr/bin/env node

const fs = require('fs');

const PROJECT_KEY = process.env.PROJECT_KEY;
const SONAR_TOKEN = process.env.SONAR_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!PROJECT_KEY || !SONAR_TOKEN) {
  console.error("❌ Missing PROJECT_KEY or SONAR_TOKEN environment variables.");
  process.exit(1);
}

if (!GITHUB_TOKEN) {
  console.error("❌ Missing GITHUB_TOKEN environment variable. This is required to post comments.");
  process.exit(1);
}

// 1. Get PR number from GitHub Actions event payload
const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath || !fs.existsSync(eventPath)) {
  console.error("❌ Could not find GITHUB_EVENT_PATH. Are you running this in a GitHub Action on a Pull Request?");
  process.exit(1);
}

const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const prNumber = eventPayload.pull_request?.number;

if (!prNumber) {
  console.error("ℹ️ No pull request number found in the event payload. This tool only runs on pull_request events.");
  process.exit(0);
}

const repo = process.env.GITHUB_REPOSITORY; // format: owner/repo
const apiUrl = `https://api.github.com/repos/${repo}`;

const SIGNATURE = '<!-- sonar-human-bot-comment -->';

async function run() {
  try {
    // 2. Fetch SonarCloud Issues
    console.log(`🔍 Fetching SonarCloud issues for project: ${PROJECT_KEY}...`);
    const sonarUrl = `https://sonarcloud.io/api/issues/search?componentKeys=${PROJECT_KEY}&statuses=OPEN&ps=10`;
    
    const sonarRes = await fetch(sonarUrl, {
      headers: { 'Authorization': `Bearer ${SONAR_TOKEN}` }
    });

    if (!sonarRes.ok) {
      throw new Error(`SonarCloud API error! status: ${sonarRes.status}`);
    }

    const sonarData = await sonarRes.json();
    const issues = sonarData.issues || [];
    const total = sonarData.paging ? sonarData.paging.total : issues.length;

    // 3. Generate Markdown
    let markdown = `${SIGNATURE}\n`;

    if (total === 0) {
      markdown += `Hello! 👋 The SonarCloud bot has reviewed your code.\n\n`;
      markdown += `**Awesome job! No issues found in this analysis. 🎉**`;
    } else {
      markdown += `Hello! 👋 The SonarCloud bot has reviewed your code. Overall it looks good, but there are **${total}** open issues to look at. Here are the details:\n\n`;
      
      issues.forEach(issue => {
        const file = issue.component.replace(`${PROJECT_KEY}:`, '');
        const line = issue.line ? ` (line ${issue.line})` : '';
        markdown += `- In \`${file}\`${line}: *"${issue.message}"*\n`;
      });

      if (total > 10) {
        markdown += `\n*Note: We only listed the first 10 issues here to keep things tidy! To view the remaining ${total - 10} issues, please check out your [SonarCloud Dashboard](https://sonarcloud.io/dashboard?id=${PROJECT_KEY}).* ✨`;
      }
    }

    // 4. Post or Update GitHub Comment
    console.log(`💬 Preparing to post comment to PR #${prNumber} in ${repo}...`);
    
    // Find existing comment
    const commentsRes = await fetch(`${apiUrl}/issues/${prNumber}/comments`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'sonarcloud-human-pr-bot'
      }
    });

    if (!commentsRes.ok) {
        throw new Error(`GitHub API error! status: ${commentsRes.status}`);
    }

    const comments = await commentsRes.json();
    const existingComment = comments.find(c => c.body && c.body.includes(SIGNATURE));

    if (existingComment) {
      // Update existing
      console.log(`📝 Updating existing comment (ID: ${existingComment.id})...`);
      const updateRes = await fetch(`${apiUrl}/issues/comments/${existingComment.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'sonarcloud-human-pr-bot'
        },
        body: JSON.stringify({ body: markdown })
      });
      if (!updateRes.ok) throw new Error(`GitHub API update error! status: ${updateRes.status}`);
      console.log("✅ Comment updated successfully!");
    } else {
      // Create new
      console.log(`➕ Creating new comment...`);
      const createRes = await fetch(`${apiUrl}/issues/${prNumber}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'sonarcloud-human-pr-bot'
        },
        body: JSON.stringify({ body: markdown })
      });
      if (!createRes.ok) throw new Error(`GitHub API create error! status: ${createRes.status}`);
      console.log("✅ Comment created successfully!");
    }

  } catch (error) {
    console.error("❌ Error running bot:", error);
    process.exit(1);
  }
}

run();
