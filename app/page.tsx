import { CheckCircle2, Code2, FolderTree, Github, Terminal, Info } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <Github className="w-4 h-4" />
            <span>DevOps Guide</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            SonarCloud PR Bot Integration
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
            Complete automated workflow setup to fetch SonarCloud analysis data and post it as a formatted Markdown comment on GitHub Pull Requests.
          </p>
        </header>

        {/* Directory Structure */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <FolderTree className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-semibold">Directory Structure</h2>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300 overflow-x-auto">
            <pre>
{`.
├── .github/
│   └── workflows/
│       ├── sonarcloud-analysis-and-comment.yml  # Possibility A
│       └── sonarcloud-comment-only.yml          # Possibility B
├── scripts/
│   └── sonar-metrics.js                         # Node.js Fetch & Builder
└── package.json`}
            </pre>
          </div>
        </section>

        {/* Node.js Environment Setup */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Terminal className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-semibold">1. Node.js Environment Setup</h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              We are utilizing the <strong>native fetch API</strong> available in Node.js 18+. Because GitHub Actions <code>setup-node@v4</code> allows us to use Node 20 natively, <strong>we don't need any external packages like axios.</strong>
            </p>
            <p>However, if your repository does not have a <code>package.json</code> at all, initialize one so the Node environment is standard:</p>
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-green-400">
              <pre>npm init -y</pre>
            </div>
            <p>No additional packages to install! Your script will run cleanly with zero dependencies.</p>
          </div>
        </section>

        {/* Github Secrets */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-semibold">2. GitHub Secrets Configuration</h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>You need to provide SonarCloud access to your GitHub Actions. Do not hardcode tokens in the script.</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log in to <a href="https://sonarcloud.io" className="text-blue-600 hover:underline">SonarCloud</a> and go to <strong>My Account &gt; Security</strong>.</li>
              <li>Generate a new Token. Copy this value.</li>
              <li>In your GitHub Repository, go to <strong>Settings &gt; Secrets and variables &gt; Actions</strong>.</li>
              <li>Click <strong>New repository secret</strong>.</li>
              <li>Name: <code>SONAR_TOKEN</code></li>
              <li>Value: <em>Paste the token you copied</em>.</li>
              <li>Click <strong>Add secret</strong>.</li>
            </ol>
          </div>
        </section>

        {/* Workflow Possibility A */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">3. Workflow: Possibility A</h2>
              <p className="text-sm text-slate-500 mt-1">Analysis runs first, followed immediately by the commenting script.</p>
            </div>
          </div>
          
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex gap-3 text-sm">
             <Info className="w-5 h-5 shrink-0" />
             <p>This workflow includes the critical <code>if: github.event.pull_request.head.repo.full_name == github.repository</code> condition to prevent it from running on external forks, thereby protecting your <code>SONAR_TOKEN</code> from unauthorized PRs.</p>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300 overflow-x-auto">
            <pre>
{`name: SonarCloud Analysis & PR Comment

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  sonarcloud-and-comment:
    name: SonarCloud Analysis and PR Comment
    runs-on: ubuntu-latest
    # Prevents running on external forks, protecting secrets
    if: github.event.pull_request.head.repo.full_name == github.repository
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Fetch Metrics and Generate Markdown
        id: generate-markdown
        env:
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
          PROJECT_KEY: 'your_project_key_here'
        run: |
          node scripts/sonar-metrics.js > sonar-report.md
          
      - name: Read Markdown File
        id: read-md
        run: |
          echo "REPORT_CONTENT<<EOF" >> $GITHUB_ENV
          cat sonar-report.md >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV

      - name: Find existing PR Comment
        uses: peter-evans/find-comment@v3
        id: fc
        with:
          issue-number: \${{ github.event.pull_request.number }}
          comment-author: 'github-actions[bot]'
          body-includes: '<!-- sonarcloud-metrics-bot -->'

      - name: Create or update comment
        uses: peter-evans/create-or-update-comment@v4
        with:
          comment-id: \${{ steps.fc.outputs.comment-id }}
          issue-number: \${{ github.event.pull_request.number }}
          body: |
            <!-- sonarcloud-metrics-bot -->
            \${{ env.REPORT_CONTENT }}
          edit-mode: replace`}
            </pre>
          </div>
        </section>

        {/* Workflow Possibility B */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">3. Workflow: Possibility B</h2>
              <p className="text-sm text-slate-500 mt-1">SonarCloud runs via Automatic Analysis; Action just fetches data and comments.</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm text-slate-300 overflow-x-auto">
            <pre>
{`name: SonarCloud PR Comment (External Analysis)

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  sonarcloud-comment:
    name: SonarCloud PR Comment
    runs-on: ubuntu-latest
    if: github.event.pull_request.head.repo.full_name == github.repository
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      # Add wait step if Automatic Analysis takes time to finish on SonarCloud's end
      - name: Wait for SonarCloud Analysis
        run: sleep 60
          
      - name: Fetch Metrics and Generate Markdown
        id: generate-markdown
        env:
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
          PROJECT_KEY: 'your_project_key_here'
        run: |
          node scripts/sonar-metrics.js > sonar-report.md
          
      - name: Read Markdown File
        id: read-md
        run: |
          echo "REPORT_CONTENT<<EOF" >> $GITHUB_ENV
          cat sonar-report.md >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV

      - name: Find existing PR Comment
        uses: peter-evans/find-comment@v3
        id: fc
        with:
          issue-number: \${{ github.event.pull_request.number }}
          comment-author: 'github-actions[bot]'
          body-includes: '<!-- sonarcloud-metrics-bot -->'

      - name: Create or update comment
        uses: peter-evans/create-or-update-comment@v4
        with:
          comment-id: \${{ steps.fc.outputs.comment-id }}
          issue-number: \${{ github.event.pull_request.number }}
          body: |
            <!-- sonarcloud-metrics-bot -->
            \${{ env.REPORT_CONTENT }}
          edit-mode: replace`}
            </pre>
          </div>
        </section>

        {/* Node.js Script */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">4. Node.js Script: sonar-metrics.js</h2>
              <p className="text-sm text-slate-500 mt-1">Fetches data from Sonar API and builds the Markdown table.</p>
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

const METRICS = 'bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density';
const URL = \`https://sonarcloud.io/api/measures/component?component=\${PROJECT_KEY}&metricKeys=\${METRICS}\`;

async function fetchMetrics() {
  try {
    // Using native fetch, available in Node 18+
    const response = await fetch(URL, {
      headers: {
        'Authorization': \`Bearer \${SONAR_TOKEN}\` 
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const data = await response.json();
    const measures = data.component.measures;

    let bugs = '0', vulns = '0', smells = '0', coverage = '0.0', dupes = '0.0';

    measures.forEach(m => {
      if (m.metric === 'bugs') bugs = m.value;
      if (m.metric === 'vulnerabilities') vulns = m.value;
      if (m.metric === 'code_smells') smells = m.value;
      if (m.metric === 'coverage') coverage = m.value;
      if (m.metric === 'duplicated_lines_density') dupes = m.value;
    });

    const getStatusEmoji = (metric, value) => {
        const num = parseFloat(value);
        if (metric === 'coverage') return num >= 80 ? '🟢 Pass' : (num >= 50 ? '🟡 Warning' : '🔴 Fail');
        if (metric === 'duplicated_lines_density') return num <= 3 ? '🟢 Pass' : (num <= 5 ? '🟡 Warning' : '🔴 Fail');
        return num === 0 ? '🟢 Pass' : '🔴 Fail';
    };

    const markdown = \`
### 📊 SonarCloud Code Analysis

| Metric | Value | Status |
| :--- | :--- | :--- |
| 🐛 Bugs | \${bugs} | \${getStatusEmoji('bugs', bugs)} |
| 🔓 Vulnerabilities | \${vulns} | \${getStatusEmoji('vulnerabilities', vulns)} |
| ☢️ Code Smells | \${smells} | \${getStatusEmoji('code_smells', smells)} |
| ☂️ Coverage | \${coverage}% | \${getStatusEmoji('coverage', coverage)} |
| 👯 Duplications | \${dupes}% | \${getStatusEmoji('duplicated_lines_density', dupes)} |

[View detailed report on SonarCloud](https://sonarcloud.io/dashboard?id=\${PROJECT_KEY})
\`;
    
    // Output the markdown so it can be captured by the workflow
    console.log(markdown.trim());

  } catch (error) {
    console.error("Error fetching SonarCloud metrics:", error);
    process.exit(1);
  }
}

fetchMetrics();`}
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}
