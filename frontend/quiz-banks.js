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
    count: 24,
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
  }
];
