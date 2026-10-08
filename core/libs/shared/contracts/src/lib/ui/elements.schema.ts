import { z } from 'zod';

/** Elements Container can render (decision 0045). */
export const containerElementSchema = z.enum([
  'div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'ul', 'ol', 'li',
]);

/** Elements Text can render (decision 0045). */
export const textElementSchema = z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label']);
