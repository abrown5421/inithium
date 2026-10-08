import { NavLink } from 'react-router-dom';
import { Container, Text } from '@inithium/shared-ui-components';
import { navigation, type NavNode } from '../manual/manual.service';

function NavItem({ node, depth }: { node: NavNode; depth: number }) {
  const isSection = node.children.length > 0 || node.page.isIndex;
  const isTopLevel = depth === 0;

  return (
    <Container as="li" flex={{ direction: 'column', gap: 2 }}>
      <NavLink to={`/${node.page.slug}`} end>
        {({ isActive }) => (
          <Text
            as="span"
            padding={{ left: 10 + depth * 12, right: 10, y: 6 }}
            radius={{ all: 6 }}
            fontSize={isTopLevel ? 13 : 14}
            letterSpacing={isTopLevel ? 1 : 0}
            fontWeight={isActive || isTopLevel ? 700 : isSection ? 600 : 400}
            bgColor={isActive ? { color: 'primary', intensity: 100 } : { base: 'transparent', hover: { color: 'surface', intensity: 200 } }}
            textColor={
              isActive ? { color: 'primary', intensity: 800 } : isTopLevel ? { color: 'surface', intensity: 950 } : { color: 'surface', intensity: 800 }
            }
          >
            {isTopLevel ? node.page.title.toUpperCase() : node.page.title}
          </Text>
        )}
      </NavLink>
      {node.children.length > 0 && (
        <Container as="ul" flex={{ direction: 'column', gap: 2 }}>
          {node.children.map((child) => (
            <NavItem key={child.page.slug} node={child} depth={depth + 1} />
          ))}
        </Container>
      )}
    </Container>
  );
}

/** The manual's sections and pages, built from the docs/ folders and each page's order. */
export function SidebarNav() {
  return (
    <Container as="nav" aria-label="Manual">
      <Container as="ul" flex={{ direction: 'column', gap: 16 }}>
        {navigation.map((node) => (
          <NavItem key={node.page.slug} node={node} depth={0} />
        ))}
      </Container>
    </Container>
  );
}
