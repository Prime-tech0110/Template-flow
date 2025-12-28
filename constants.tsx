
import { Category, Tech, Template } from './types';

export const MOCK_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Nexus SaaS Landing Page',
    description: 'A ultra-modern dark mode landing page for high-growth SaaS companies. Features glassmorphism and smooth animations.',
    price: 29,
    category: Category.LANDING_PAGE,
    techStack: [Tech.REACT, Tech.TAILWIND, Tech.NEXTJS],
    thumbnail: 'https://picsum.photos/seed/saas/800/600',
    livePreviewUrl: '#',
    downloadUrl: '#',
    style: 'Modern',
    createdAt: Date.now() - 86400000
  },
  {
    id: '2',
    title: 'Inkwell Blog Theme',
    description: 'Clean, typography-focused blogging template perfect for writers and developers. Optimized for SEO and readability.',
    price: 0,
    category: Category.BLOGGING,
    techStack: [Tech.HTML_CSS, Tech.TAILWIND],
    thumbnail: 'https://picsum.photos/seed/blog/800/600',
    livePreviewUrl: '#',
    downloadUrl: '#',
    style: 'Minimal',
    createdAt: Date.now() - 172800000
  },
  {
    id: '3',
    title: 'Vogue E-Commerce',
    description: 'A high-end fashion storefront with integrated product grids, cart animations, and mobile-first navigation.',
    price: 49,
    category: Category.ECOMMERCE,
    techStack: [Tech.NEXTJS, Tech.TAILWIND, Tech.SUPABASE],
    thumbnail: 'https://picsum.photos/seed/shop/800/600',
    livePreviewUrl: '#',
    downloadUrl: '#',
    style: 'Corporate',
    createdAt: Date.now() - 259200000
  },
  {
    id: '4',
    title: 'Zenfolio Creative Portfolio',
    description: 'Minimalist portfolio template for designers and photographers. Highlights visual content with bold imagery.',
    price: 15,
    category: Category.PORTFOLIO,
    techStack: [Tech.FIGMA, Tech.REACT],
    thumbnail: 'https://picsum.photos/seed/portfolio/800/600',
    livePreviewUrl: '#',
    downloadUrl: '#',
    style: 'Creative',
    createdAt: Date.now() - 345600000
  },
  {
    id: '5',
    title: 'AdminPro Dashboard',
    description: 'Feature-rich dashboard for managing complex data. Includes 50+ UI components and light/dark themes.',
    price: 59,
    category: Category.DASHBOARD,
    techStack: [Tech.REACT, Tech.TAILWIND],
    thumbnail: 'https://picsum.photos/seed/dash/800/600',
    livePreviewUrl: '#',
    downloadUrl: '#',
    style: 'Corporate',
    createdAt: Date.now() - 432000000
  }
];
