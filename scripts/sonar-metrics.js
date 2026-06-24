const PROJECT_KEY = process.env.PROJECT_KEY;
const SONAR_TOKEN = process.env.SONAR_TOKEN;

if (!PROJECT_KEY || !SONAR_TOKEN) {
  console.error("Missing PROJECT_KEY or SONAR_TOKEN environment variables.");
  process.exit(1);
}

const METRICS = 'bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density';
const URL = `https://sonarcloud.io/api/measures/component?component=${PROJECT_KEY}&metricKeys=${METRICS}`;

async function fetchMetrics() {
  try {
    // Using native fetch, available in Node 18+
    const response = await fetch(URL, {
      headers: {
        'Authorization': `Bearer ${SONAR_TOKEN}` // SonarCloud typically uses Bearer or Basic Base64(token + ':')
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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

    const getStatusEmoji = (metric, value, isPercentage = false) => {
        const num = parseFloat(value);
        if (metric === 'coverage') return num >= 80 ? '🟢 Pass' : (num >= 50 ? '🟡 Warning' : '🔴 Fail');
        if (metric === 'duplicated_lines_density') return num <= 3 ? '🟢 Pass' : (num <= 5 ? '🟡 Warning' : '🔴 Fail');
        return num === 0 ? '🟢 Pass' : '🔴 Fail';
    };

    const markdown = `
### 📊 SonarCloud Code Analysis

| Metric | Value | Status |
| :--- | :--- | :--- |
| 🐛 Bugs | ${bugs} | ${getStatusEmoji('bugs', bugs)} |
| 🔓 Vulnerabilities | ${vulns} | ${getStatusEmoji('vulnerabilities', vulns)} |
| ☢️ Code Smells | ${smells} | ${getStatusEmoji('code_smells', smells)} |
| ☂️ Coverage | ${coverage}% | ${getStatusEmoji('coverage', coverage, true)} |
| 👯 Duplications | ${dupes}% | ${getStatusEmoji('duplicated_lines_density', dupes, true)} |

[View detailed report on SonarCloud](https://sonarcloud.io/dashboard?id=${PROJECT_KEY})
`;
    // Output the markdown so it can be captured by the workflow
    console.log(markdown.trim());

  } catch (error) {
    console.error("Error fetching SonarCloud metrics:", error);
    process.exit(1);
  }
}

fetchMetrics();
