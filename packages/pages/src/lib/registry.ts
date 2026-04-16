import React from 'react';
import type { PageDefinition } from '@inithium/types';//Module '"@inithium/types"' has no exported member 'PageDefinition'.ts(2305)

export const PAGE_REGISTRY: PageDefinition[] = [
  {
    key: 'home',
    path: '/',
    entry: 'fadeIn',
    exit: 'fadeOut',
    bg: 'surface',
    component: React.lazy(() => import('./pages/home/home')),
    navigation: { label: 'Home', location: 'main', order: 1 },
  },
  {
    key: 'documentation',
    path: '/documentation',
    entry: 'fadeIn',
    exit: 'fadeOut',
    bg: 'surface',
    component: React.lazy(() => import('./pages/documentation/documentation')),
    navigation: { label: 'Documentation', location: 'main', order: 2 },
  },
  {
    key: 'privacy-policy',
    path: '/privacy-policy',
    entry: 'fadeIn',
    exit: 'fadeOut',
    bg: 'surface',
    component: React.lazy(() => import('./pages/privacy-policy/privacy-policy')),
    navigation: { label: 'Privacy Policy', location: 'footer', order: 1 },
  },
  {
    key: 'login',
    path: '/auth/login',
    entry: 'fadeInUp',
    exit: 'fadeOutDown',
    bg: 'surface2',
    component: React.lazy(() => import('./pages/login/login')),
  },
  {
    key: 'signup',
    path: '/auth/signup',
    entry: 'fadeInUp',
    exit: 'fadeOutDown',
    bg: 'surface2',
    component: React.lazy(() => import('./pages/sign-up/sign-up')),
  },
];

// Lookup helpers
export const getPageByKey = (key: string) =>
  PAGE_REGISTRY.find((p) => p.key === key);

export const getPageByPath = (path: string) =>
  PAGE_REGISTRY.find((p) => p.path === path);