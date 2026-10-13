import {
  contentDocumentSchema,
  createContentId,
  CONTENT_SCHEMA_VERSION,
  type ContentDocument,
  type RichTextInline,
  type RichTextNode,
} from '@inithium/shared-contracts';

// Small builders for the policy's rich text.
type Run = string | { bold: string };
const inline = (...runs: Run[]): RichTextInline[] =>
  runs.map((run) => (typeof run === 'string' ? { type: 'text', text: run } : { type: 'text', text: run.bold, marks: [{ type: 'bold' }] }));
const p = (...runs: Run[]): RichTextNode => ({ type: 'paragraph', content: inline(...runs) });
const h2 = (text: string): RichTextNode => ({ type: 'heading', attrs: { level: 2 }, content: inline(text) });
const bullets = (...items: Run[][]): RichTextNode => ({
  type: 'bulletList',
  content: items.map((runs) => ({ type: 'listItem', content: [{ type: 'paragraph', content: inline(...runs) }] })),
});

export type PrivacyPolicyOptions = {
  /** How long the sign-in cookies last, from the api's settings. */
  accessMinutes: number;
  refreshDays: number;
  /** The date the policy is first written, e.g. 13 October 2026. */
  today: Date;
};

/**
 * Core's starting privacy policy (decisions 0093, 0097): basic, plain-English coverage of what core itself collects
 * (account and profile details, sign-in sessions) and its only cookies (the two essential sign-in cookies). It's a
 * starting point each site's owner edits in the CMS, not legal advice.
 */
export function privacyPolicyContent({ accessMinutes, refreshDays, today }: PrivacyPolicyOptions): ContentDocument {
  const updated = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const doc: ContentDocument = {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    sections: [
      {
        id: createContentId(),
        layout: 'one',
        padding: { y: 48, x: 24 },
        columns: [
          {
            id: createContentId(),
            blocks: [
              { id: createContentId(), type: 'heading', level: 1, text: 'Privacy policy' },
              {
                id: createContentId(),
                type: 'rich-text',
                doc: {
                  type: 'doc',
                  content: [
                    p({ bold: 'Last updated:' }, ` ${updated}`),
                    p(
                      'This policy explains what information this site collects when you visit it or create an account, why we collect it, and the choices you have. We collect only what the site needs to work.',
                    ),
                  ],
                },
              },
              { id: createContentId(), type: 'divider' },
              {
                id: createContentId(),
                type: 'rich-text',
                doc: {
                  type: 'doc',
                  content: [
                    h2('What we collect'),
                    bullets(
                      [
                        { bold: 'Account details.' },
                        ' When you sign up, we store your email address, your first and last name, and your password. Your password is stored only as a one-way scrambled form (a hash) that nobody, including us, can turn back into the password.',
                      ],
                      [
                        { bold: 'Your profile.' },
                        ' Anything you add to your profile, such as a short bio and the designs of your avatar and banner, along with the date you joined. Your name, bio, avatar, banner and join date appear on your public profile. Your email address is never shown to other people.',
                      ],
                      [
                        { bold: 'Sign-in sessions.' },
                        ' A record of each device you’re signed in on, so you stay signed in and can be signed out everywhere when you change your password.',
                      ],
                      [
                        { bold: 'Basic technical information.' },
                        ' To protect accounts from repeated failed sign-in attempts, the site briefly keeps count of attempts from your IP address. The services that host the site may also keep standard technical logs.',
                      ],
                    ),

                    h2('Cookies'),
                    p(
                      'We use only essential cookies: the ones that keep you signed in. We don’t use advertising, analytics or tracking cookies, and we don’t let other companies set cookies through this site.',
                    ),
                    bullets(
                      [
                        { bold: 'inithium_access' },
                        ` keeps you signed in while you use the site. It lasts ${accessMinutes} minutes and is renewed automatically while you’re signed in.`,
                      ],
                      [
                        { bold: 'inithium_refresh' },
                        ` lets the site renew your sign-in without asking for your password again. It lasts ${refreshDays} days, or until you sign out.`,
                      ],
                    ),
                    p(
                      'Both are set only when you sign in or create an account. They can’t be read by scripts on the page and are sent only to this site. Because the site can’t keep you signed in without them, they’re set without asking for consent. You can block or delete them in your browser, but you won’t be able to stay signed in.',
                    ),

                    h2('How we use your information'),
                    bullets(
                      ['To create and run your account, and to keep you signed in.'],
                      ['To show your public profile to other visitors.'],
                      ['To keep the site and your account secure, for example by limiting repeated failed sign-in attempts.'],
                    ),
                    p('We don’t sell your information, and we don’t use it for advertising.'),

                    h2('Who we share it with'),
                    p(
                      'We use service providers to host the site and store its data. They handle your information only to run the site for us. Otherwise we share it only if the law requires us to.',
                    ),

                    h2('How long we keep it'),
                    p(
                      `We keep your account and profile details for as long as your account exists. Sign-in sessions end after ${refreshDays} days, or sooner when you sign out or change your password.`,
                    ),

                    h2('Your choices and rights'),
                    bullets(
                      ['You can see and change your name, bio, avatar and banner on your profile, and change your password at any time.'],
                      ['You can ask us for a copy of the information we hold about you, or ask us to correct or delete it.'],
                    ),
                    p('To make a request or ask a question about this policy, contact the owner of this site.'),

                    h2('Changes to this policy'),
                    p('If we change this policy, we’ll update it on this page and change the date at the top.'),
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  };
  // The policy must always be valid content; a mistake here should fail loudly at startup.
  return contentDocumentSchema.parse(doc);
}
