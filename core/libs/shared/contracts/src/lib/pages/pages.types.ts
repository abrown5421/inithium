import type { z } from 'zod';
import type {
  navLocationSchema,
  pageAnimationSchema,
  pageAudienceSchema,
  pageNavigationSchema,
  pageSchema,
  pageSeoSchema,
  pageStatusSchema,
  pageUpdateSchema,
  publicPageSchema,
} from './pages.schema';

export type PageStatus = z.infer<typeof pageStatusSchema>;
export type PageAudience = z.infer<typeof pageAudienceSchema>;
export type NavLocation = z.infer<typeof navLocationSchema>;
export type PageNavigation = z.infer<typeof pageNavigationSchema>;
export type PageSeo = z.infer<typeof pageSeoSchema>;
export type PageAnimation = z.infer<typeof pageAnimationSchema>;
export type Page = z.infer<typeof pageSchema>;
export type PublicPage = z.infer<typeof publicPageSchema>;
export type PageUpdate = z.infer<typeof pageUpdateSchema>;
