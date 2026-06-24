const PROJECT_KEY = process.env.PROJECT_KEY;
const SONAR_TOKEN = process.env.SONAR_TOKEN;

if (!PROJECT_KEY || !SONAR_TOKEN) {
  console.error("Missing PROJECT_KEY or SONAR_TOKEN environment variables.");
  process.exit(1);
}

// Fetch open issues (max 10)
const URL = `https://sonarcloud.io/api/issues/search?componentKeys=${PROJECT_KEY}&statuses=OPEN&ps=10`;

async function fetchIssues() {
  try {
    const response = await fetch(URL, {
      headers: {
        'Authorization': `Bearer ${SONAR_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const issues = data.issues || [];
    const total = data.paging ? data.paging.total : issues.length;

    // Hidden HTML signature for the GitHub Action to identify the comment
    let markdown = `<!-- sonar-human-bot-comment -->\n`;

    if (total === 0) {
      markdown += `Hello! 👋 The SonarCloud bot has reviewed your code.\n\n`;
      markdown += `**Awesome job! No issues found in this analysis. 🎉**`;
    } else {
      markdown += `Hello! 👋 The SonarCloud bot has reviewed your code. Overall it looks good, but there are **${total}** open issues to look at. Here are the details:\n\n`;
      
      issues.forEach(issue => {
        // Strip the project key from the component path to make it cleaner
        const file = issue.component.replace(`${PROJECT_KEY}:`, '');
        const line = issue.line ? ` (line ${issue.line})` : '';
        markdown += `- In \`${file}\`${line}: *"${issue.message}"*\n`;
      });

      if (total > 10) {
        markdown += `\n*Note: We only listed the first 10 issues here to keep things tidy! To view the remaining ${total - 10} issues, please check out your [SonarCloud Dashboard](https://sonarcloud.io/dashboard?id=${PROJECT_KEY}).* ✨`;
      }
    }

    // Output for the workflow to capture
    console.log(markdown.trim());

  } catch (error) {
    console.error("Error fetching SonarCloud issues:", error);
    process.exit(1);
  }
}

fetchIssues();
