import { describe, expect, it } from 'vitest';
import { readContentDocument, upgradeContentV1 } from '@inithium/shared-contracts';
import { privacyPolicyContent, privacyPolicyContentV1 } from './privacy-policy.seed';

const options = { accessMinutes: 15, refreshDays: 30, today: new Date('2026-10-13T00:00:00Z') };
const policy = () => privacyPolicyContentV1(options);

describe('the privacy policy in version 2 content (decisions 0097, 0116)', () => {
  it('upgrades to valid content', () => {
    const v1 = policy();
    expect(readContentDocument(v1)).toEqual(upgradeContentV1(v1));
  });

  it('is seeded as version 2', () => {
    const seeded = privacyPolicyContent(options);
    expect(seeded.schemaVersion).toBe(2);
    expect(readContentDocument(seeded)).toEqual(seeded);
  });

  it('draws the same page: one padded band of its title, introduction, a rule and the policy', () => {
    const v1 = policy();
    const blocks = v1.sections[0]?.columns[0]?.blocks ?? [];
    const docOf = (index: number) => {
      const block = blocks[index];
      return block?.type === 'rich-text' ? block.doc : undefined;
    };
    const [band] = readContentDocument(v1)?.elements ?? [];
    expect(band).toMatchObject({
      type: 'container',
      props: { as: 'section', width: 'full', padding: { y: 48, x: 24 }, flex: { direction: 'column', gap: 20 } },
    });
    if (band?.type !== 'container') throw new Error('expected a Container');
    expect(band.children.map((element) => element.type)).toEqual(['text', 'text', 'divider', 'text']);
    const [title, intro, , body] = band.children;
    expect(title?.type === 'text' && title.props).toEqual({
      doc: { type: 'doc', content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Privacy policy' }] }] },
    });
    expect(intro?.type === 'text' && intro.props).toEqual({ doc: docOf(1) });
    // The policy starts with a heading, which rich text drew 8px down.
    expect(body?.type === 'text' && body.props).toEqual({ doc: docOf(3), margin: { top: 8 } });
  });
});
