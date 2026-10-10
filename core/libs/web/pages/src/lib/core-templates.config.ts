import type { PageTemplate } from '@inithium/web-shell';
import { HomePage } from './home-page.component';
import { LoginPage } from './login-page.component';
import { NotFoundPage } from './not-found-page.component';
import { ProfilePage } from './profile-page.component';
import { SignUpPage } from './sign-up-page.component';

// Sign-in pages: the card rises in from the dark backdrop and sinks away (until the CMS sets their own look).
const SIGN_IN_DEFAULTS: PageTemplate['defaults'] = {
  bgColor: { color: 'surface', intensity: 950 },
  animation: { entrance: { name: 'fadeInUp', speed: 'fast' }, exit: { name: 'fadeOutDown', speed: 'fast' } },
};

/** Core's page templates (decision 0078), matching the pages `@inithium/api-pages` seeds. */
export const coreTemplates: PageTemplate[] = [
  { key: 'home', component: HomePage, singleUse: true, layouts: ['default'] },
  { key: 'profile', component: ProfilePage, singleUse: true, layouts: ['default'] },
  { key: 'login', component: LoginPage, singleUse: true, layouts: ['bare'], defaults: SIGN_IN_DEFAULTS },
  { key: 'sign-up', component: SignUpPage, singleUse: true, layouts: ['bare'], defaults: SIGN_IN_DEFAULTS },
  { key: 'not-found', component: NotFoundPage, singleUse: true, layouts: ['default'] },
];
