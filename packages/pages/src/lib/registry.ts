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
    component: React.lazy(
      () => import('./pages/privacy-policy/privacy-policy')
    ),
    navigation: { label: 'Privacy Policy', location: 'footer', order: 1 },
  },
  {
    key: 'login',
    path: '/auth/login',
    entry: 'fadeInUp',
    exit: 'fadeOutDown',
    bg: 'surface4',
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
    navigation: {
      label: 'Profile',
      location: 'profile',
      order: 1,
      authenticated: true,
      resolveNavPath: (user) => `/profile/${user._id}`,
    },
  },
  {
    key: 'settings',
    path: '/settings/:userId',
    entry: 'fadeIn',
    exit: 'fadeOut',
    bg: 'surface',
    component: React.lazy(() => import('./pages/settings/settings')),
    navigation: {
      label: 'Settings',
      location: 'profile',
      order: 2,
      authenticated: true,
      resolveNavPath: (user) => `/settings/${user._id}`,
    },
  },
  {
    key: 'signup',
    path: '/auth/signup',
    entry: 'fadeInUp',
    exit: 'fadeOutDown',
    bg: 'surface4',
    color: 'surface',
    centered: true,
    component: React.lazy(() => import('./pages/sign-up/sign-up')),
  },
  {
    key: 'not-found',
    path: '/404',
    entry: 'fadeInUp',
    exit: 'fadeOutDown',
    bg: 'danger',
    isErrorPage: true,
    centered: true,
    component: React.lazy(
      () => import('./pages/page-error/not-found/not-found')
    ),
  },
  {
    key: 'error',
    path: '/error',
    entry: 'fadeInUp',
    exit: 'fadeOutDown',
    bg: 'danger',
    isErrorPage: true,
    centered: true,
    component: React.lazy(() => import('./pages/page-error/error/error')),
  },
];

export const getPageByKey = (key: string) =>
  PAGE_REGISTRY.find((p) => p.key === key);

export const getPageByPath = (path: string) =>
  PAGE_REGISTRY.find((p) => p.path === path);
