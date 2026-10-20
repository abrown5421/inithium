import type { PluginElement } from '@inithium/shared-contracts';
import { Container, Input, Text } from '@inithium/shared-ui-components';
import { contentElementEditor, type PluginElementPropertiesProps } from './content-element-editors.service';

/**
 * A plugin's element's properties (decision 0116): its name in the Layers, then the plugin's own panel. An element whose
 * plugin isn't registered (inactive or ejected) says so; it can still be moved or deleted.
 */
export function PluginElementProperties(props: PluginElementPropertiesProps) {
  const { element, onChange } = props;
  const editor = contentElementEditor(element.type);
  const Panel = editor?.properties;
  const rename = (label: string) => {
    const next: PluginElement = { ...element, label: label || undefined };
    if (!label) delete next.label;
    onChange(next);
  };
  return (
    <Container flex={{ direction: 'column', gap: 16 }}>
      <Input label="Name in the Layers" value={element.label ?? ''} maxLength={60} onValueChange={rename} error={props.problems['label']} />
      {!editor ? (
        <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
          Its plugin isn’t installed or is switched off, so the site leaves it out. You can still move or delete it.
        </Text>
      ) : Panel ? (
        <Panel {...props} />
      ) : (
        <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
          It has no settings.
        </Text>
      )}
    </Container>
  );
}
