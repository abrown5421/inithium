import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { Container, Text } from '@inithium/shared-ui-components';
import { AnimationPage } from './animation-page.component';
import { ContainerPage } from './container-page.component';
import { IconPage } from './icon-page.component';
import { TextPage } from './text-page.component';
import { ThemePage } from './theme-page.component';

// Development-only gallery (/ui) with a page per part of the UI library. Every new component, composite and
// layout adds a page here alongside its docs page, so it can be browser-tested in isolation.

const pages = [
  { path: 'theme', label: 'Theme', element: <ThemePage /> },
  { path: 'animation', label: 'Animation', element: <AnimationPage /> },
  { path: 'container', label: 'Container', element: <ContainerPage /> },
  { path: 'icon', label: 'Icon', element: <IconPage /> },
  { path: 'text', label: 'Text', element: <TextPage /> },
];

export function UiGallery() {
  return (
    <Container bgColor={{ color: 'surface', intensity: 100 }} minHeight="screen" flex={{ direction: { base: 'column', md: 'row' } }}>
      <Container
        as="nav"
        aria-label="UI gallery"
        flex={{ direction: { base: 'row', md: 'column' }, wrap: 'wrap', gap: 4 }}
        width={{ base: 'full', md: 200 }}
        padding={{ all: 16 }}
        position={{ type: { base: 'static', md: 'sticky' }, top: 0 }}
        height={{ base: 'auto', md: 'screen' }}
        bgColor={{ color: 'surface', intensity: 50 }}
        borderWidth={{ base: { bottom: 1 }, md: { right: 1 } }}
        borderColor={{ color: 'surface', intensity: 500, opacity: 40 }}
      >
        <Text as="span" fontFamily="display" fontSize={18} textColor="primary" padding={{ x: 8, bottom: 8 }} width="full">
          UI gallery
        </Text>
        {pages.map((page) => (
          <NavLink key={page.path} to={page.path}>
            {({ isActive }) => (
              <Text
                as="span"
                padding={{ x: 8, y: 6 }}
                radius={{ all: 6 }}
                fontWeight={isActive ? 700 : 400}
                bgColor={isActive ? { color: 'primary', intensity: 100 } : { base: 'transparent', hover: { color: 'surface', intensity: 200 } }}
                textColor={isActive ? { color: 'primary', intensity: 800 } : { color: 'surface', intensity: 800 }}
              >
                {page.label}
              </Text>
            )}
          </NavLink>
        ))}
      </Container>

      <Container as="main" flexItem={{ grow: 1 }} minWidth={0} padding={{ base: { x: 16, y: 24 }, md: { x: 40, y: 40 } }}>
        <Container maxWidth={1040}>
          <Routes>
            <Route index element={<Navigate to="theme" replace />} />
            {pages.map((page) => (
              <Route key={page.path} path={page.path} element={page.element} />
            ))}
          </Routes>
        </Container>
      </Container>
    </Container>
  );
}
