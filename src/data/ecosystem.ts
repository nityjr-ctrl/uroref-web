export const LINK_CHECKED_LABEL = 'Links checked 27 Aug 2026';
export const CONTENT_VERSION = '2026.08.27';

export type ProjectStage = 'deployed' | 'prototype' | 'research' | 'in-development';

export interface DemoLink {
  label: string;
  href: string;
  note?: string;
}

export interface EcosystemProject {
  id: string;
  name: string;
  mark: string;
  logo: string;
  logoAlt: string;
  category: string;
  description: string;
  longDescription: string;
  stage: ProjectStage;
  stageLabel: string;
  href: string;
  localHref?: string;
  external: boolean;
  featured: boolean;
  showOnProfile: boolean;
  accent: string;
  safetyNotice: string;
  demoLinks?: DemoLink[];
  searchTerms: string[];
}

export const ecosystemProjects: EcosystemProject[] = [
  {
    id: 'uroref',
    name: 'UroRef',
    mark: 'UR',
    logo: '/brand/logo-kit/presentation/uroref-mark.svg',
    logoAlt: 'UroRef logo',
    category: 'Quick reference and evidence',
    description: 'The navigation layer for concise trainee reference, current resources and direct routes back to original sources.',
    longDescription:
      'A quick-reference publication and app for common real-world urology questions, designed to orient a learner and make the original source easier to reach.',
    stage: 'deployed',
    stageLabel: 'Deployed · education only',
    href: 'https://uroref.com/',
    localHref: '/',
    external: false,
    featured: true,
    showOnProfile: true,
    accent: '#00D4C8',
    safetyNotice:
      'Follow local policy, senior advice and clinical judgement. Do not enter patient-identifiable information into connected features.',
    demoLinks: [
      { label: 'Open the app overview', href: '/app' },
      { label: 'Browse evidence-led Deep Dives', href: '/deep-dives' },
    ],
    searchTerms: ['on call', 'guidelines', 'deep dives', 'clinical reference', 'trainee', 'Ariadne'],
  },
  {
    id: 'prostateview',
    name: 'ProstateView',
    mark: 'PV',
    logo: '/brand/logo-kit/presentation/prostateview-mark.svg',
    logoAlt: 'ProstateView logo',
    category: 'MRI and spatial anatomy',
    description: 'Public Prostate158 assets become rotatable teaching models, report visualisers and spatial-learning drills.',
    longDescription:
      'A public-research-data teaching prototype that connects MRI slices, sector anatomy, mental rotation and browser-based 3D exploration.',
    stage: 'prototype',
    stageLabel: 'Live teaching prototype',
    href: 'https://prostateview.com/v2/',
    localHref: '/prostateview/v2/',
    external: true,
    featured: true,
    showOnProfile: true,
    accent: '#F6C453',
    safetyNotice:
      'Teaching only. Not for diagnosis, PI-RADS assignment, biopsy planning or navigation. Respect the QA status shown on each case.',
    demoLinks: [
      { label: 'Open the report visualiser', href: '/prostateview/v2/template-report-visualiser/' },
      { label: 'Try Mental Rotation', href: '/prostateview/v2/learn/mental-rotation/' },
      { label: 'Open an orientation-checked case', href: '/prostateview/v2/case/pv-case-001/' },
    ],
    searchTerms: ['prostate', 'MRI', '3D', 'AR', 'mental rotation', 'sector map', 'Prostate158'],
  },
  {
    id: 'calyxview',
    name: 'CalyxView',
    mark: 'CV',
    logo: '/brand/logo-kit/presentation/calyxview-mark.svg',
    logoAlt: 'CalyxView logo',
    category: 'Renal anatomy and stones',
    description: 'A de-identified CT-derived teaching prototype with a simulated scope route and calyceal search.',
    longDescription:
      'A spatial teaching experience for discussing collecting-system orientation, calyceal search and endourology anatomy without using it to plan a real procedure.',
    stage: 'research',
    stageLabel: 'Research / education prototype',
    href: 'https://calyxview.com/',
    external: true,
    featured: true,
    showOnProfile: true,
    accent: '#6EE7B7',
    safetyNotice: 'Not for diagnosis, treatment selection, patient-specific surgical planning or intra-operative guidance.',
    searchTerms: ['kidney', 'renal', 'calyx', 'stone', 'ureteroscopy', 'PCNL', 'collecting system'],
  },
  {
    id: 'uroops3d',
    name: 'UrOops3D',
    mark: 'U3',
    logo: '/brand/logo-kit/presentation/uroops3d-mark.svg',
    logoAlt: 'UrOops3D logo',
    category: 'Operative rehearsal',
    description: 'A browser-based operative and complications atlas using stylised 3D scenes, danger zones and active recall.',
    longDescription:
      'A teaching atlas that helps a learner rehearse anatomy, complications and first-response thinking before a viva or supervised procedure.',
    stage: 'prototype',
    stageLabel: 'Live teaching project',
    href: 'https://uroops3d.com/',
    external: true,
    featured: true,
    showOnProfile: true,
    accent: '#B8A4FF',
    safetyNotice: 'Schematic anatomy for teaching only. Review status varies by item and remains visible in the project.',
    searchTerms: ['URS', 'PCNL', 'operative', 'complications', 'danger zones', 'FRCS', 'viva'],
  },
  {
    id: 'cystosight',
    name: 'Cystosight by UroRef',
    mark: 'CS',
    logo: '/brand/logo-kit/presentation/cystosight-mark.svg',
    logoAlt: 'Cystosight by UroRef logo',
    category: 'Bladder vision and cystoscopy',
    description: 'Browser-based exercises for spatial bladder and cystoscopy practice using schematic teaching meshes.',
    longDescription:
      'A visual training prototype for recognising, describing and rehearsing cystoscopic views without patient imaging or patient data.',
    stage: 'prototype',
    stageLabel: 'Educational prototype',
    href: 'https://cystosight.netlify.app/',
    external: true,
    featured: true,
    showOnProfile: true,
    accent: '#8FC7FF',
    safetyNotice: 'No patient imaging or data. Simplified teaching pathways do not replace current guidance or local policy.',
    searchTerms: ['bladder', 'cystoscopy', 'visual recognition', 'spatial training'],
  },
];

export interface EvidenceResource {
  id: string;
  issuer: string;
  type: string;
  jurisdiction: string;
  access: string;
  title: string;
  summary: string;
  href: string;
  dateLabel: string;
  boundary: string;
  topics: string[];
}

export const evidenceResources: EvidenceResource[] = [
  {
    id: 'nice-ng118',
    issuer: 'NICE',
    type: 'Guideline',
    jurisdiction: 'England',
    access: 'Public',
    title: 'Renal and ureteric stones: assessment and management (NG118)',
    summary: 'Assessment and management guidance spanning imaging, analgesia, intervention choices, metabolic testing and recurrence prevention.',
    href: 'https://www.nice.org.uk/guidance/ng118',
    dateLabel: 'Published Jan 2019 · reviewed Feb 2021 · minor update May 2026',
    boundary: 'NG118 expressly does not cover the infected obstructed kidney.',
    topics: ['stones', 'renal colic', 'URS', 'PCNL', 'SWL'],
  },
  {
    id: 'eau-urolithiasis',
    issuer: 'EAU',
    type: 'Professional guideline',
    jurisdiction: 'Europe',
    access: 'Public',
    title: 'EAU Guidelines on Urolithiasis 2026',
    summary: 'Current professional guidance covering renal colic, stone removal, URS, PCNL, SWL and recurrence prevention.',
    href: 'https://uroweb.org/guidelines/urolithiasis',
    dateLabel: '2026 edition',
    boundary: 'European professional guidance, not a UK mandate; local policy and clinical expertise remain necessary.',
    topics: ['stones', 'urolithiasis', 'URS', 'PCNL', 'SWL', 'emergency'],
  },
  {
    id: 'girft-emergency-urology',
    issuer: 'NHS England / GIRFT',
    type: 'Service guide',
    jurisdiction: 'England',
    access: 'Public PDF',
    title: 'Urgent and emergency urology care and SDEC',
    summary: 'Service guidance, pathways and checklists for urgent urology, ambulatory care and multidisciplinary delivery.',
    href: 'https://gettingitrightfirsttime.co.uk/wp-content/uploads/2025/03/FINAL-GIRFT-Urology-guide-to-UEC-and-SDEC-March-2025.pdf',
    dateLabel: 'Published Mar 2025',
    boundary: 'NHS England service guidance; local emergency pathways govern.',
    topics: ['emergency', 'SDEC', 'renal colic', 'training'],
  },
  {
    id: 'baus-stones',
    issuer: 'BAUS',
    type: 'Patient information',
    jurisdiction: 'UK',
    access: 'Public',
    title: 'Kidney stones and stone-procedure information',
    summary: 'Patient-facing explanations and procedure information, linked directly to the BAUS originals.',
    href: 'https://www.baus.org.uk/patients/information_leaflets/category/10/stone_procedures',
    dateLabel: 'Link checked 27 Aug 2026',
    boundary: 'Patient information, not a clinician decision pathway.',
    topics: ['patient information', 'stones', 'leaflets', 'URS', 'PCNL'],
  },
  {
    id: 'baus-stents-audit',
    issuer: 'BAUS',
    type: 'National audit notice',
    jurisdiction: 'UK',
    access: 'Member submission',
    title: 'STENTS snapshot audit',
    summary: 'Stent Time in Endourology audit with a scheduled submission window from 1 to 30 September 2026.',
    href: 'https://www.baus.org.uk/professionals/baus_business/baus_snapshot_audits.aspx',
    dateLabel: 'Submission window 1–30 Sep 2026',
    boundary: 'An audit initiative, not clinical guidance.',
    topics: ['audit', 'stents', 'endourology', 'quality improvement'],
  },
  {
    id: 'baus-strategy',
    issuer: 'BAUS',
    type: 'Strategic plan',
    jurisdiction: 'UK and Ireland',
    access: 'Public',
    title: 'BAUS Strategic Plan 2026–31',
    summary: 'Published priorities spanning patient care, membership, education and research, advocacy and digital transformation.',
    href: 'https://www.baus.org.uk/professionals/baus_business/news/314/baus_strategic_plan_2026_2031/',
    dateLabel: 'Published 6 Aug 2026',
    boundary: 'UroRef is presented for discussion; inclusion here is not BAUS endorsement or partnership.',
    topics: ['BAUS', 'strategy', 'education', 'digital transformation'],
  },
];

export interface TechnologyCapability {
  id: string;
  name: string;
  status: 'integrated' | 'quality-gate' | 'connection-ready' | 'governance-gated';
  statusLabel: string;
  summary: string;
  implementation: string;
  href: string;
}

export const technologyCapabilities: TechnologyCapability[] = [
  {
    id: 'pagefind',
    name: 'Pagefind',
    status: 'integrated',
    statusLabel: 'Integrated',
    summary: 'Private, static search across the built UroRef hub.',
    implementation: 'Indexed after every production build; navigation and footer noise are excluded automatically.',
    href: 'https://github.com/Pagefind/pagefind',
  },
  {
    id: 'model-viewer',
    name: 'Google model-viewer',
    status: 'integrated',
    statusLabel: 'Integrated',
    summary: 'Local GLB and USDZ teaching-model display with an independent static fallback.',
    implementation: 'Used only with a public teaching asset; interaction is loaded on demand and remains education-only.',
    href: 'https://github.com/google/model-viewer',
  },
  {
    id: 'pwa',
    name: 'Offline presentation pack',
    status: 'quality-gate',
    statusLabel: 'Safe local pack',
    summary: 'The complete static build, search index and selected local 3D asset can be served without external APIs.',
    implementation: 'A root service worker remains gated until the mirrored ProstateView registration conflict is removed and stale-content controls are agreed.',
    href: 'https://github.com/vite-pwa/vite-plugin-pwa',
  },
  {
    id: 'promptfoo',
    name: 'Promptfoo',
    status: 'quality-gate',
    statusLabel: 'Eval harness installed',
    summary: 'Regression cases for citation presence, abstention and patient-data boundaries.',
    implementation: 'Fixtures run in CI; a real Ariadne endpoint must be explicitly configured before results can describe live-model behaviour.',
    href: 'https://github.com/promptfoo/promptfoo',
  },
  {
    id: 'ohif',
    name: 'OHIF + Cornerstone3D',
    status: 'connection-ready',
    statusLabel: 'Synthetic interface staged',
    summary: 'A clearly separated imaging-lab boundary for future DICOMweb teaching studies.',
    implementation: 'No DICOM server, patient study or clinical workflow is connected in this public site.',
    href: 'https://github.com/OHIF/Viewers',
  },
  {
    id: 'monai',
    name: 'MONAI',
    status: 'governance-gated',
    statusLabel: 'Research provenance',
    summary: 'Imaging-pipeline provenance for public-research-data teaching assets.',
    implementation: 'Inference is not run in the public website and outputs remain outside clinical use.',
    href: 'https://github.com/Project-MONAI/MONAI',
  },
  {
    id: 'axe',
    name: 'axe-core',
    status: 'quality-gate',
    statusLabel: 'Automated gate',
    summary: 'Automated WCAG-oriented checks for the homepage, showcase and core content routes.',
    implementation: 'Runs alongside manual keyboard, zoom, motion and contrast review; passing automation is not claimed as full conformance.',
    href: 'https://github.com/dequelabs/axe-core',
  },
  {
    id: 'umami',
    name: 'Umami',
    status: 'connection-ready',
    statusLabel: 'Privacy-safe wiring ready',
    summary: 'Optional aggregate event measurement without search text, patient information or session replay.',
    implementation: 'Disabled until a self-hosted endpoint and site identifier are configured. Demo figures are never substituted.',
    href: 'https://github.com/umami-software/umami',
  },
];

export const searchFallback = [
  ...ecosystemProjects.map((project) => ({
    title: project.name,
    url: `/showcase#${project.id}`,
    excerpt: project.description,
    meta: project.stageLabel,
    audience: ['trainees', 'trainers', 'leaders'],
    topics: project.searchTerms.map((term) => term.toLowerCase()),
    contentType: 'project',
    terms: [project.name, project.category, project.description, ...project.searchTerms].join(' ').toLowerCase(),
  })),
  ...evidenceResources.map((resource) => ({
    title: resource.title,
    url: resource.href,
    excerpt: resource.summary,
    meta: `${resource.issuer} · ${resource.jurisdiction}`,
    audience: ['trainees', 'trainers', 'leaders', 'patients and public'],
    topics: resource.topics.map((topic) => topic.toLowerCase()),
    contentType: 'source',
    terms: [resource.title, resource.issuer, resource.summary, ...resource.topics].join(' ').toLowerCase(),
  })),
];
