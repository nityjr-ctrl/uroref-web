import { ecosystemProjects } from './ecosystem';

/**
 * Nity G — personal profile page configuration.
 * Single source of truth for /nity (and the /connect alias).
 * Edit titles, copy and links here; the page reads everything from this file.
 */

export const identity = {
  name: 'Nity G',
  role: 'ST5 Urology Registrar',
  strapline: 'Medical Educator · Digital Health Builder',
  creatorLine: 'Creator of the connected UroRef learning ecosystem',
  email: 'nity@uroref.com',
  website: 'https://uroref.com',
  profileUrl: 'https://uroref.com/nity',
  eyebrow: 'Urology · Education · Digital Innovation',
  description:
    'I build practical digital tools that make urology easier to understand, teach and navigate.',
  supportingLine: 'Explore the UroRef education and innovation ecosystem.',
  // Verified LinkedIn URL only — leave empty rather than guessing a username.
  linkedin: '',
};

export const meta = {
  title: 'Nity G | Urology, Education and Digital Innovation',
  description:
    'Meet Nity G, ST5 Urology Registrar and creator of UroRef, ProstateView, CalyxView, UrOops3D and Cystosight by UroRef.',
  ogImage: '/publicity/nity-g/nity-g-social-1200x630.png',
};

export const utm = 'utm_source=nity_profile&utm_medium=qr&utm_campaign=nity_publicity';

export interface Project {
  key: string;
  name: string;
  label: string;
  description: string;
  url: string;
  cta: string;
  /** Accent colour — from existing brand/token palette. */
  accent: string;
  /** Path to a genuine logo asset within this repo, if one exists. */
  logo?: string;
  logoAlt?: string;
}

export const projects: Project[] = ecosystemProjects
  .filter((project) => project.showOnProfile)
  .map((project) => ({
    key: project.id,
    name: project.name,
    label: project.category,
    description: project.description,
    url: project.href,
    cta: `Open ${project.name}`,
    accent: project.accent,
    logo: project.id === 'prostateview' ? '/prostateview/logo-symbol.png' : undefined,
    logoAlt: project.id === 'prostateview' ? 'ProstateView logo' : undefined,
  }));

export const publicity = {
  dir: '/publicity/nity-g',
  vcard: '/publicity/nity-g/Nity-G.vcf',
  qrAssets: [
    { file: 'nity-g-qr-black.svg', label: 'QR — black on white (SVG)' },
    { file: 'nity-g-qr-black-2048.png', label: 'QR — black on white (PNG 2048)' },
    { file: 'nity-g-qr-white.svg', label: 'QR — white on charcoal (SVG)' },
    { file: 'nity-g-qr-white-2048.png', label: 'QR — white on charcoal (PNG 2048)' },
    { file: 'nity-g-qr-transparent.svg', label: 'QR — black, transparent background (SVG)' },
    { file: 'nity-g-qr-transparent-2048.png', label: 'QR — black, transparent (PNG 2048)' },
    { file: 'nity-g-qr-business-card.svg', label: 'QR — business-card artwork (SVG)' },
    { file: 'nity-g-qr-lanyard.svg', label: 'QR — lanyard artwork (SVG)' },
  ],
};
