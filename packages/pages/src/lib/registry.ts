import React from 'react';
import type { PageDefinition } from '@inithium/types';

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
    bg: 'surface-contrast',
    color: 'surface',
    centered: true,
    component: React.lazy(() => import('./pages/login/login')),
  },
  {
    key: 'profile',
    path: '/profile/:userId',
    entry: 'fadeIn',
    exit: 'fadeOut',
    bg: 'surface',
    component: React.lazy(() => import('./pages/profile/profile')),
  },
  {
    key: 'signup',
    path: '/auth/signup',
    entry: 'fadeInUp',
    exit: 'fadeOutDown',
    bg: 'surface-contrast',
    color: 'surface',
    centered: true,
    component: React.lazy(() => import('./pages/sign-up/sign-up')),
  },
];

export const getPageByKey = (key: string) =>
  PAGE_REGISTRY.find((p) => p.key === key);

export const getPageByPath = (path: string) =>
  PAGE_REGISTRY.find((p) => p.path === path);