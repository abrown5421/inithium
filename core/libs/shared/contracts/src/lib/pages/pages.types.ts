import type { z } from 'zod';
import type {
  navLocationSchema,
  pageAnimationSchema,
  pageCreateSchema,
  pageDuplicateSchema,
  pageAudienceSchema,
  pageNavigationSchema,
  contentLockRequestSchema,
  pageEditingSchema,
  pageSchema,
  pageUsageSchema,
  pageSeoSchema,
  pageStatusSchema,
  pageUpdateSchema,
  publicPageSchema,
  reusableTemplateSchema,
} from './pages.schema';

export type PageStatus = z.infer<typeof pageStatusSchema>;
export type PageAudience = z.infer<typeof pageAudienceSchema>;
export type NavLocation = z.infer<typeof navLocationSchema>;
export type PageNavigation = z.infer<typeof pageNavigationSchema>;
export type PageSeo = z.infer<typeof pageSeoSchema>;
export type PageAnimation = z.infer<typeof pageAnimationSchema>;
export type Page = z.infer<typeof pageSchema>;
export type PageEditing = z.infer<typeof pageEditingSchema>;
export type PageUsage = z.infer<typeof pageUsageSchema>;
export type ContentLockRequest = z.infer<typeof contentLockRequestSchema>;
export type PublicPage = z.infer<typeof publicPageSchema>;
export type PageUpdate = z.infer<typeof pageUpdateSchema>;
export type PageCreate = z.infer<typeof pageCreateSchema>;
export type PageDuplicate = z.infer<typeof pageDuplicateSchema>;
export type ReusableTemplate = z.infer<typeof reusableTemplateSchema>;
