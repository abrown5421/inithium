import { Router, type Request, type Response } from 'express';
import { findFontFamily, listFontFamilies, toFontFamily } from '@inithium/api-fonts';
import { fontFamilyCreateSchema, fontFamilyUpdateSchema, type FontFamilyRecord } from '@inithium/shared-contracts';
import { requirePermission } from '@inithium/api-auth';
import { createFontFamily, deleteFontFamily, updateFontFamily } from './font-families.service';

const notFound = (res: Response) => res.status(404).send({ message: 'Font family not found' });
const param = (req: Request, name: string) => String(req.params[name]);
const invalid = (res: Response, issues: unknown) => res.status(400).send({ message: 'Check the highlighted fields and try again', issues });

/** Mounted at /api/fonts (decision 0111): the font library, managed by anyone who may upload files. */
export const fontFamiliesRouter = Router();

/** Every family in the library, by name. */
fontFamiliesRouter.get('/', ...requirePermission('assets.upload'), async (_req, res) => {
  const body: FontFamilyRecord[] = (await listFontFamilies()).map(toFontFamily);
  res.send(body);
});

/** Adds a family from uploaded font files; 409 once the library holds six. */
fontFamiliesRouter.post('/', ...requirePermission('assets.upload'), async (req, res) => {
  const parsed = fontFamilyCreateSchema.safeParse(req.body);
  if (!parsed.success) return void invalid(res, parsed.error.issues);
  const body: FontFamilyRecord = toFontFamily(await createFontFamily(parsed.data));
  res.status(201).send(body);
});

/** Changes a family's name, fallback or files. */
fontFamiliesRouter.patch('/:id', ...requirePermission('assets.upload'), async (req, res) => {
  const parsed = fontFamilyUpdateSchema.safeParse(req.body);
  if (!parsed.success) return void invalid(res, parsed.error.issues);
  const family = await findFontFamily(param(req, 'id'));
  if (!family) return void notFound(res);
  const body: FontFamilyRecord = toFontFamily(await updateFontFamily(family, parsed.data));
  res.send(body);
});

/** Removes a family; its files stay in Media. */
fontFamiliesRouter.delete('/:id', ...requirePermission('assets.upload'), async (req, res) => {
  const family = await findFontFamily(param(req, 'id'));
  if (!family) return void notFound(res);
  await deleteFontFamily(family);
  res.status(204).end();
});
