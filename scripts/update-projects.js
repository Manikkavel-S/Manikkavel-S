const fs = require('fs');
const path = require('path');

const USERNAME = process.env.GITHUB_USERNAME || 'Manikkavel-S';
const TOKEN = process.env.GITHUB_TOKEN || '';
const README_PATH = path.join(__dirname, '..', 'README.md');

// Fallback descriptions for repos that do not yet have a GitHub description set
const KNOWN_DESCRIPTIONS = {
  voterverify: 'Secure physical election student verification platform with instant lookup and double-voting prevention.',
  'medicare-pharmacy': 'Modern healthcare platform with prescription upload workflow and Gemini AI customer assistant.',
  'manikkavel-portfolio': 'Interactive 3D WebGL developer portfolio with Three.js, animations, and Supabase CMS.',
  healthcare: 'Lightweight healthcare management interface built with React 19, Vite, and Supabase.'
};

// Language color / icon mapping for shields.io badges
const LANGUAGE_BADGES = {
  JavaScript: { color: 'F7DF1E', logo: 'javascript', logoColor: 'black' },
  TypeScript: { color: '3178C6', logo: 'typescript', logoColor: 'white' },
  Python: { color: '3776AB', logo: 'python', logoColor: 'white' },
  HTML: { color: 'E34F26', logo: 'html5', logoColor: 'white' },
  CSS: { color: '1572B6', logo: 'css3', logoColor: 'white' },
  C: { color: 'A8B9CC', logo: 'c', logoColor: 'white' },
  'C++': { color: '00599C', logo: 'c%2B%2B', logoColor: 'white' },
  Java: { color: 'ED8B00', logo: 'openjdk', logoColor: 'white' },
  Rust: { color: '000000', logo: 'rust', logoColor: 'white' },
  Go: { color: '00ADD8', logo: 'go', logoColor: 'white' },
  Shell: { color: '89E051', logo: 'gnubash', logoColor: 'white' }
};

// Project emojis for clean visuals
const ICONS = ['🗳️', '💊', '🌐', '🏥', '🚀', '⚡', '🤖', '📊', '🛠️', '💡'];

async function fetchPublicRepos() {
  const url = `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed&direction=desc`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Node.js Auto-Readme-Updater)',
    Accept: 'application/vnd.github.v3+json'
  };
  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

function generateLanguageBadge(language) {
  if (!language) return '';
  const config = LANGUAGE_BADGES[language] || { color: '0ea5e9', logo: '', logoColor: 'white' };
  const logoParam = config.logo ? `&logo=${config.logo}&logoColor=${config.logoColor}` : '';
  const encodedLang = encodeURIComponent(language);
  return `<img src="https://img.shields.io/badge/${encodedLang}-${config.color}?style=flat-square${logoParam}" alt="${language}" />`;
}

function formatRepoCard(repo, index) {
  const icon = ICONS[index % ICONS.length];
  const langBadge = generateLanguageBadge(repo.language);
  const starsBadge = `<img src="https://img.shields.io/badge/⭐_Stars-${repo.stargazers_count}-0ea5e9?style=flat-square" alt="Stars" />`;
  const forksBadge = `<img src="https://img.shields.io/badge/🍴_Forks-${repo.forks_count}-10b981?style=flat-square" alt="Forks" />`;

  let description = '';
  if (repo.description && repo.description.trim().length > 0) {
    description = repo.description.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
  } else {
    description = KNOWN_DESCRIPTIONS[repo.name.toLowerCase()] || 'Dynamic application and software solution developed by Manikkavel S.';
  }

  let links = `<a href="${repo.html_url}" target="_blank">🔗 <b>Source Code</b></a>`;
  if (repo.homepage && repo.homepage.trim().length > 0) {
    links += ` &nbsp;•&nbsp; <a href="${repo.homepage}" target="_blank">🌐 <b>Live Demo</b></a>`;
  }

  return `    <td width="50%" valign="top">
      <h4>${icon} <a href="${repo.html_url}">${repo.name}</a></h4>
      <p>${description}</p>
      <p>
        ${langBadge}
        ${starsBadge}
        ${forksBadge}
      </p>
      <p>
        ${links}
      </p>
    </td>`;
}

function renderProjectsTable(repos) {
  if (!repos || repos.length === 0) {
    return `<p align="center"><i>No public projects found at this time.</i></p>`;
  }

  const rows = [];
  for (let i = 0; i < repos.length; i += 2) {
    const card1 = formatRepoCard(repos[i], i);
    const card2 = i + 1 < repos.length
      ? formatRepoCard(repos[i + 1], i + 1)
      : `    <td width="50%" valign="top"></td>`;

    rows.push(`  <tr>\n${card1}\n${card2}\n  </tr>`);
  }

  return `<table>\n${rows.join('\n')}\n</table>`;
}

async function main() {
  console.log(`[1/3] Fetching public repositories for ${USERNAME}...`);
  const rawRepos = await fetchPublicRepos();

  // Filter: exclude profile repo (Manikkavel-S), forks, and archived repos
  const validRepos = rawRepos.filter((r) => {
    const isProfileRepo = r.name.toLowerCase() === USERNAME.toLowerCase();
    const isFork = r.fork === true;
    const isArchived = r.archived === true;
    return !isProfileRepo && !isFork && !isArchived;
  });

  console.log(`[2/3] Filtered ${validRepos.length} active public project(s).`);

  const projectsHtml = renderProjectsTable(validRepos);
  const newProjectsSection = `<!-- PROJECTS:START -->\n${projectsHtml}\n<!-- PROJECTS:END -->`;

  if (!fs.existsSync(README_PATH)) {
    throw new Error(`README.md not found at ${README_PATH}`);
  }

  let readmeContent = fs.readFileSync(README_PATH, 'utf8');

  // Check if marker exists
  const markerRegex = /<!-- PROJECTS:START -->[\s\S]*?<!-- PROJECTS:END -->/;
  if (markerRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(markerRegex, newProjectsSection);
  } else {
    console.log('Markers <!-- PROJECTS:START --> not found. Inserting markers in Projects section...');
    const sectionHeadingRegex = /### 📂 More Real-World Projects[\s\S]*?(?=---\s*\n\s*### 📊 Dynamic GitHub Activity)/;
    if (sectionHeadingRegex.test(readmeContent)) {
      readmeContent = readmeContent.replace(
        sectionHeadingRegex,
        `### 📂 More Real-World Projects\n\n${newProjectsSection}\n\n`
      );
    } else {
      const statsMarker = '### 📊 Dynamic GitHub Activity';
      if (readmeContent.includes(statsMarker)) {
        readmeContent = readmeContent.replace(
          statsMarker,
          `### 📂 More Real-World Projects\n\n${newProjectsSection}\n\n---\n\n${statsMarker}`
        );
      } else {
        readmeContent += `\n\n### 📂 More Real-World Projects\n\n${newProjectsSection}\n`;
      }
    }
  }

  fs.writeFileSync(README_PATH, readmeContent, 'utf8');
  console.log('[3/3] Successfully updated README.md with latest verified projects!');
}

main().catch((err) => {
  console.error('Failed to update projects:', err);
  process.exit(1);
});
