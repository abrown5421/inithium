import type { ReactNode } from 'react';
import type { ContainerElement, ContentElement, CoreContentElement } from '@inithium/shared-contracts';
import { Button, Container, Divider, Icon, type IconName } from '@inithium/shared-ui-components';
import { useContentDecorators } from './content-decorators.context';
import { useContentLinks } from './content-links.context';
import { ImageElementView } from './image-element.component';
import { RichText } from './rich-text.component';

/** Draws one element (decision 0116) and, for a Container, everything inside it. */
export function ContentElementView({ element }: { element: ContentElement }) {
  const decorators = useContentDecorators();
  const drawn = element.type === 'container' ? <ContainerView element={element} /> : isCore(element) ? <ElementBox element={element} /> : null;
  return decorators.element ? decorators.element(element, drawn) : drawn;
}

type LeafElement = Exclude<CoreContentElement, ContainerElement>;

/**
 * Whether core draws it. A plugin's element is drawn by its plugin once the content elements slot exists (decision
 * 0116, step 7); until then, and whenever its plugin is inactive or ejected, it draws nothing.
 */
const isCore = (element: ContentElement): element is CoreContentElement => !element.type.startsWith('plugin-');

function ContainerView({ element }: { element: ContainerElement }) {
  const decorators = useContentDecorators();
  const { anchor, ...props } = element.props;
  const children = element.children.map((child) => <ContentElementView key={child.id} element={child} />);
  return (
    <Container {...props} id={anchor} data-element="container">
      {decorators.children ? decorators.children(element, children) : children}
    </Container>
  );
}

/**
 * Every element but Container sits in a box that takes its margin, its hiding at some sizes and its entrance, so
 * those work the same whether or not the component takes them itself.
 */
function ElementBox({ element }: { element: LeafElement }) {
  const { hidden, margin, animation } = element.props;
  return (
    <Container hidden={hidden} margin={margin} animation={animation} minWidth={0} data-element={element.type}>
      {elementBody(element)}
    </Container>
  );
}

function elementBody(element: LeafElement): ReactNode {
  switch (element.type) {
    case 'text': {
      const { doc, align, textColor, typography, headingTypography } = element.props;
      return <RichText doc={doc} align={align} textColor={textColor} typography={typography} headingTypography={headingTypography} />;
    }
    case 'image':
      return <ImageElementView props={element.props} />;
    case 'icon': {
      const { name, label, hidden: _hidden, margin: _margin, animation: _animation, ...style } = element.props;
      return <Icon {...style} name={name as IconName} label={label} />;
    }
    case 'button':
      return <ButtonView props={element.props} />;
    case 'divider': {
      const { label, labelAlign, hidden: _hidden, margin: _margin, animation: _animation, ...style } = element.props;
      return <Divider {...style} label={label} labelAlign={labelAlign} decorative={!label} />;
    }
  }
}

function ButtonView({ props }: { props: Extract<ContentElement, { type: 'button' }>['props'] }) {
  const resolve = useContentLinks();
  const { label, link, leadingIcon, trailingIcon, hidden: _hidden, margin: _margin, animation: _animation, ...style } = props;
  const target = resolve(link);
  return (
    <Button
      {...style}
      leadingIcon={leadingIcon as IconName | undefined}
      trailingIcon={(trailingIcon ?? (target.newTab ? 'external-link' : undefined)) as IconName | undefined}
      disabled={!target.href}
      onClick={target.follow}
    >
      {label}
    </Button>
  );
}
