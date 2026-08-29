/* ============================================================================
 * quiz-banks.js — the DevHub exam MANIFEST (metadata only, no questions).
 *
 * Single source of truth describing every practice exam. The readiness
 * dashboard (exam-readiness.html) and future learning-paths page read this to
 * list exams, link to them, and aggregate localStorage attempt history.
 *
 * Each exam page still inlines its own full question bank (so it works
 * standalone); this file only carries the metadata needed to *find* and
 * *summarise* them. Keep `id`, `passPct` and `count` in sync with the page.
 *
 * available:false → not built yet; the dashboard shows it as "coming soon"
 * so the menu doubles as a roadmap.
 * ========================================================================== */
window.DEVHUB_EXAMS = [
  {
    id: 'aws-developer',
    title: 'AWS Certified Developer – Associate',
    cert: 'DVA-C02',
    file: 'exam-aws-developer.html',
    track: 'Cloud — AWS',
    passPct: 72,
    count: 40,
    available: true
  },
  {
    id: 'java-ocp',
    title: 'Java SE 21 Developer (OCP)',
    cert: '1Z0-830',
    file: 'exam-java-ocp.html',
    track: 'Java — OOP & Language',
    passPct: 68,
    count: 20,
    available: true
  },
  {
    id: 'aws-practitioner',
    title: 'AWS Certified Cloud Practitioner',
    cert: 'CLF-C02 · entry level',
    file: 'exam-aws-practitioner.html',
    track: 'Cloud — AWS',
    passPct: 70,
    count: 41,
    available: true
  },
  {
    id: 'aws-sa-associate',
    title: 'AWS Solutions Architect – Associate',
    cert: 'SAA-C03',
    file: 'exam-aws-sa-associate.html',
    track: 'Cloud — AWS',
    passPct: 72,
    count: 37,
    available: true
  },
  {
    id: 'azure-developer',
    title: 'Azure Developer Associate',
    cert: 'AZ-204',
    file: 'exam-azure-developer.html',
    track: 'Cloud — Azure',
    passPct: 72,
    count: 28,
    available: true
  },
  {
    id: 'spring-professional',
    title: 'Spring Professional',
    cert: 'Spring Certified',
    file: 'exam-spring-professional.html',
    track: 'Spring Boot',
    passPct: 76,
    count: 41,
    available: true
  },
  {
    id: 'dsa-interview',
    title: 'Coding Interview — Data Structures & Algorithms',
    cert: 'interview prep',
    file: 'exam-dsa-interview.html',
    track: 'Data Structures & Algorithms',
    passPct: 70,
    count: 40,
    available: true
  },
  {
    id: 'identity-access',
    title: 'Identity & Access — OAuth 2.0 / OIDC / JWT',
    cert: 'CIAM · identity foundations',
    file: 'exam-identity-access.html',
    track: 'Identity & Security',
    passPct: 75,
    count: 32,
    available: true
  },
  {
    id: 'angular',
    title: 'Angular — Modern (v17+)',
    cert: 'Angular',
    file: 'exam-angular.html',
    track: 'Web & Frameworks',
    passPct: 72,
    count: 27,
    available: true
  },
  {
    id: 'typescript',
    title: 'TypeScript',
    cert: 'TypeScript',
    file: 'exam-typescript.html',
    track: 'Web & Frameworks',
    passPct: 70,
    count: 25,
    available: true
  },
  {
    id: 'git',
    title: 'Git',
    cert: 'Git',
    file: 'exam-git.html',
    track: 'Developer Tools',
    passPct: 70,
    count: 24,
    available: true
  },
  {
    id: 'docker',
    title: 'Docker',
    cert: 'Docker',
    file: 'exam-docker.html',
    track: 'Containers & DevOps',
    passPct: 70,
    count: 21,
    available: true
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes',
    cert: 'Kubernetes',
    file: 'exam-kubernetes.html',
    track: 'Containers & DevOps',
    passPct: 72,
    count: 21,
    available: true
  },
  {
    id: 'sql',
    title: 'SQL',
    cert: 'SQL',
    file: 'exam-sql.html',
    track: 'Databases',
    passPct: 70,
    count: 30,
    available: true
  },
  {
    id: 'http-rest',
    title: 'HTTP & REST APIs',
    cert: 'HTTP / REST',
    file: 'exam-http-rest.html',
    track: 'Web & Frameworks',
    passPct: 70,
    count: 21,
    available: true
  },
  {
    id: 'gcp-ace',
    title: 'Google Cloud Associate Cloud Engineer',
    cert: 'ACE',
    file: 'exam-gcp-ace.html',
    track: 'Cloud — GCP',
    passPct: 70,
    count: 28,
    available: true
  },
  {
    id: 'web-fundamentals',
    title: 'Web Fundamentals',
    cert: 'HTML/CSS/JS',
    file: 'exam-web-fundamentals.html',
    track: 'Web Fundamentals',
    passPct: 70,
    count: 26,
    available: true
  },
  {
    id: 'data-science',
    title: 'Data Science & ML',
    cert: 'DS/ML',
    file: 'exam-data-science.html',
    track: 'Data Science & ML',
    passPct: 70,
    count: 30,
    available: true
  },
  {
    id: 'ai-engineering',
    title: 'AI / LLM Engineering',
    cert: 'GenAI',
    file: 'exam-ai-engineering.html',
    track: 'AI / LLM Engineering',
    passPct: 70,
    count: 28,
    available: true
  }
];
