import React from 'react';
import type { AnimateEntry, AnimateExit, AnimateSpeed } from '@inithium/types';
import type { ThemeColor } from '@inithium/types';

export interface PageDefinition {
  key: string;
  path: string;
  entry: AnimateEntry;
  exit: AnimateExit;
  entrySpeed?: AnimateSpeed;
  exitSpeed?: AnimateSpeed;
  bg: ThemeColor;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

export const PAGE_REGISTRY: PageDefinition[] = [
  {
    key: 'home',
    path: '/',
    entry: 'fadeIn',
    exit: 'fadeOut',
    bg: 'surface',
    component: React.lazy(() => import('./pages/home/home')),
  },
  {
    key: 'documentation',
    path: '/documentation',
    entry: 'fadeIn',
    exit: 'fadeOut',
    bg: 'surface',
    component: React.lazy(() => import('./pages/documentation/documentation')),
  },
  {
    key: 'privacy-policy',
    path: '/privacy-policy',
    entry: 'fadeIn',
    exit: 'fadeOut',
    bg: 'surface',
    component: React.lazy(() => import('./pages/privacy-policy/privacy-policy')),
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