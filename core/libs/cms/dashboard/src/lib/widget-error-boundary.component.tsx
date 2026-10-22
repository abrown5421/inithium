import { Component, type ReactNode } from 'react';
import { Container, Icon, Text } from '@inithium/shared-ui-components';

type Props = { label: string; children: ReactNode };
type State = { failed: boolean };

/** Keeps a widget that throws inside its own card (decision 0120): the rest of the dashboard carries on. */
export class WidgetErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error) {
    console.error(`[ dashboard ] the ${this.props.label} widget failed: ${error.message}`);
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Container flex={{ direction: 'column', align: 'center', justify: 'center', gap: 8 }} height="full" padding={{ all: 16 }}>
        <Icon name="triangle-alert" size={28} textColor={{ color: 'red', intensity: 600 }} />
        <Text as="p" align="center" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
          This widget couldn’t load. Refresh the page, or remove it from its menu.
        </Text>
      </Container>
    );
  }
}
