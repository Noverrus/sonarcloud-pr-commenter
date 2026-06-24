import { CheckCircle2, Code2, FolderTree, Github, Terminal, Info, MessageSquare, Settings } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <Github className="w-4 h-4" />
            <span>Open Source PR Bot</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            SonarCloud Human-Readable PR Bot
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
            A friendly GitHub Actions bot that fetches SonarCloud open issues and translates them into a conversational English summary on your internal Pull Requests.
          </p>
        </header>

        {/* 1. Environment Setup */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Terminal className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-semibold">1. Environment Setup</h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              This bot uses the native <code>fetch</code> API available in Node.js 18+. Because the GitHub Action uses <code>setup-node@v4</code> with Node 20, <strong>you do not need to install <code>axios</code> or any other external dependencies.</strong>
            </p>
            <p>To initialize the environment in your repository (if you don't have one), run:</p>
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-green-400">
              <pre>npm init -y</pre>
            </div>
            <p className="text-sm bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 flex gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>No other <code>npm install</code> commands are needed! The script relies entirely on built-in modules.</span>
            </p>
          </div>
        </section>

        {/* 2. Node.js Script */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">2. Data Fetching & Templating</h2>
              <p className="text-sm text-slate-500 mt-1">Save this file as <code>scripts/sonar-issues.js</code></p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300 overflow-x-auto">
            <pre>
{`const PROJECT_KEY = process.env.PROJECT_KEY;
const SONAR_TOKEN = process.env.SONAR_TOKEN;

if (!PROJECT_KEY || !SONAR_TOKEN) {
  console.error("Missing PROJECT_KEY or SONAR_TOKEN environment variables.");
  process.exit(1);
}

// Fetch open issues (max 10)
const URL = \`https://sonarcloud.io/api/issues/search?componentKeys=\${PROJECT_KEY}&statuses=OPEN&ps=10\`;

async function fetchIssues() {
  try {
    const response = await fetch(URL, {
      headers: {
        'Authorization': \`Bearer \${SONAR_TOKEN}\`
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    const issues = data.issues || [];
    const total = data.paging ? data.paging.total : issues.length;

    // Hidden HTML signature for the GitHub Action to identify the comment
    let markdown = \`<!-- sonar-human-bot-comment -->\\n\`;

    if (total === 0) {
      markdown += \`Hello! 👋 The SonarCloud bot has reviewed your code.\\n\\n\`;
      markdown += \`**Awesome job! No issues found in this analysis. 🎉**\`;
    } else {
      markdown += \`Hello! 👋 The SonarCloud bot has reviewed your code. Overall it looks good, but there are **\${total}** open issues to look at. Here are the details:\\n\\n\`;
      
      issues.forEach(issue => {
        // Strip the project key from the component path to make it cleaner
        const file = issue.component.replace(\`\${PROJECT_KEY}:\`, '');
        const line = issue.line ? \` (line \${issue.line})\` : '';
        markdown += \`- In \\\`\${file}\\\`\${line}: *"\${issue.message}"*\\n\`;
      });

      if (total > 10) {
        markdown += \`\\n*Note: We only listed the first 10 issues here to keep things tidy! To view the remaining \${total - 10} issues, please check out your [SonarCloud Dashboard](https://sonarcloud.io/dashboard?id=\${PROJECT_KEY}).* ✨\`;
      }
    }

    // Output for the workflow to capture
    console.log(markdown.trim());

  } catch (error) {
    console.error("Error fetching SonarCloud issues:", error);
    process.exit(1);
  }
}

fetchIssues();`}
            </pre>
          </div>
        </section>

        {/* 3. GitHub Actions Workflow */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">3. GitHub Actions Workflow</h2>
              <p className="text-sm text-slate-500 mt-1">Save this file as <code>.github/workflows/sonar-human-bot.yml</code></p>
            </div>
          </div>
          
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
             <Info className="w-5 h-5 shrink-0" />
             <p>This workflow restricts execution to internal branches using the <code>if: github.event.pull_request.head.repo.full_name == github.repository</code> condition. This protects your <code>SONAR_TOKEN</code> from being exposed to malicious external PRs.</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300 overflow-x-auto">
            <pre>
{`name: SonarCloud Human-Readable PR Bot

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  sonar-human-bot:
    name: SonarCloud Friendly Summary
    runs-on: ubuntu-latest
    
    # SECURITY: Prevent running on external forks
    if: github.event.pull_request.head.repo.full_name == github.repository
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      # If relying on Sonar Automatic Analysis, wait for it to finish.
      # If you run analysis via CLI in this workflow, put that step here instead.
      - name: Wait for SonarCloud Analysis
        run: sleep 60
          
      - name: Fetch Issues and Generate Summary
        id: generate-summary
        env:
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
          PROJECT_KEY: 'your_project_key_here'
        run: |
          node scripts/sonar-issues.js > sonar-summary.md
          
      - name: Read Markdown File
        id: read-md
        run: |
          echo "REPORT_CONTENT<<EOF" >> $GITHUB_ENV
          cat sonar-summary.md >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV

      - name: Find existing PR Comment
        uses: peter-evans/find-comment@v3
        id: fc
        with:
          issue-number: \${{ github.event.pull_request.number }}
          comment-author: 'github-actions[bot]'
          body-includes: '<!-- sonar-human-bot-comment -->'

      - name: Create or update comment
        uses: peter-evans/create-or-update-comment@v4
        with:
          comment-id: \${{ steps.fc.outputs.comment-id }}
          issue-number: \${{ github.event.pull_request.number }}
          body: \${{ env.REPORT_CONTENT }}
          edit-mode: replace`}
            </pre>
          </div>
        </section>

        {/* 4. Documentation */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-semibold">4. Documentation & Configuration</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 pt-2">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Setting up SONAR_TOKEN
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To keep your SonarCloud token secure, it must be added to GitHub Secrets, not hardcoded in the codebase:
              </p>
              <ol className="list-decimal pl-4 text-sm text-slate-600 space-y-2">
                <li>Go to <strong>SonarCloud</strong> &rarr; <strong>My Account</strong> &rarr; <strong>Security</strong> and generate a token.</li>
                <li>Go to your <strong>GitHub Repository</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Secrets and variables</strong> &rarr; <strong>Actions</strong>.</li>
                <li>Click <strong>New repository secret</strong>.</li>
                <li>Name: <code>SONAR_TOKEN</code></li>
                <li>Paste the token value and save.</li>
              </ol>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Customizing the Bot's Vibe
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                You can easily customize the English string templates inside <code>scripts/sonar-issues.js</code> to match your team's personality.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Look for the <code>markdown +=</code> lines inside the <code>fetchIssues()</code> function. For example, to make it more professional, change:
              </p>
              <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300">
                "Hello! 👋 The SonarCloud bot has reviewed..."
              </div>
              <p className="text-slate-600 text-sm mt-2">to something like:</p>
              <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300">
                "The automated SonarCloud analysis has completed..."
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
