
export enum Category {
  LANDING_PAGE = 'Landing Pages',
  BLOGGING = 'Blogging',
  ECOMMERCE = 'E-commerce',
  PORTFOLIO = 'Portfolio',
  DASHBOARD = 'Dashboard'
}

export enum Tech {
  REACT = 'React',
  TAILWIND = 'Tailwind CSS',
  NEXTJS = 'Next.js',
  HTML_CSS = 'HTML/CSS',
  FIGMA = 'Figma',
  SUPABASE = 'Supabase'
}

export interface Template {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  techStack: Tech[];
  thumbnail: string;
  livePreviewUrl: string;
  downloadUrl: string;
  style: 'Minimal' | 'Modern' | 'Corporate' | 'Creative';
  createdAt: number;
}

export interface FilterState {
  search: string;
  category: Category | 'All';
  priceRange: [number, number];
  style: string | 'All';
}
