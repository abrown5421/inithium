import { useState, type ReactNode } from 'react';
import { contentBlockTypes, sectionLayouts, type ContentBlockType, type ContentDocument, type SectionLayout } from '@inithium/shared-contracts';
import { Button, Container, Icon, Select, Text, Tooltip, type IconName } from '@inithium/shared-ui-components';
import { BLOCK_TYPES, LAYOUT_LABELS, blockSummary, type EditorSelection } from './content-document.service';

export type StructurePanelProps = {
  doc: ContentDocument;
  selection: EditorSelection;
  onSelect: (selection: EditorSelection) => void;
  /** Ids of sections and blocks with problems, marked in the tree. */
  invalid: ReadonlySet<string>;
  onMoveSection: (sectionId: string, by: -1 | 1) => void;
  onDuplicateSection: (sectionId: string) => void;
  onRemoveSection: (sectionId: string) => void;
  onAddSection: (layout: SectionLayout) => void;
  onMoveBlock: (blockId: string, by: -1 | 1) => void;
  onDuplicateBlock: (blockId: string) => void;
  onRemoveBlock: (blockId: string) => void;
  /** Adds a block to the column chosen (after the selected block, if one is). */
  onAddBlock: (columnId: string, type: ContentBlockType) => void;
};

function Action({ label, icon, onClick, disabled }: { label: string; icon: IconName; onClick: () => void; disabled?: boolean }) {
  return (
    <Tooltip content={label}>
      <Button variant="ghost" color={{ color: 'surface', intensity: 800 }} leadingIcon={icon} aria-label={label} padding={{ x: 4 }} disabled={disabled} onClick={onClick} />
    </Tooltip>
  );
}

/** One row of the tree: an icon and a label that select it, then its actions. */
function Row({
  icon,
  label,
  detail,
  selected,
  invalid,
  indent,
  onSelect,
  children,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  selected: boolean;
  invalid: boolean;
  indent: number;
  onSelect: () => void;
  children?: ReactNode;
}) {
  return (
    <Container
      as="li"
      flex={{ direction: 'row', align: 'center', gap: 2 }}
      padding={{ left: indent, right: 2 }}
      radius={{ all: 6 }}
      bgColor={selected ? { color: 'primary', intensity: 100 } : { base: 'transparent', hover: { color: 'surface', intensity: 200 } }}
    >
      <Container flexItem={{ grow: 1, basis: 0 }} minWidth={0}>
        <Button
          variant="ghost"
          color={{ color: selected ? 'primary' : 'surface', intensity: selected ? 700 : 900 }}
          leadingIcon={icon}
          aria-pressed={selected}
          onClick={onSelect}
          width="full"
          minWidth={0}
          padding={{ x: 6 }}
        >
          <Text as="span" truncate={1} fontWeight={selected ? 600 : 500}>
            {label}
            {detail && (
              <Text as="span" fontWeight={400} textColor={{ color: 'surface', intensity: 600 }}>
                {' '}
                · {detail}
              </Text>
            )}
          </Text>
        </Button>
      </Container>
      {invalid && (
        <Tooltip content="This has problems to fix before it can be saved">
          <Container flex={{ align: 'center' }} textColor={{ color: 'red', intensity: 600 }} tabIndex={0} aria-label="Has problems">
            <Icon name="circle-alert" size={16} />
          </Container>
        </Tooltip>
      )}
      {children && (
        <Container flex={{ direction: 'row' }} flexItem={{ shrink: 0 }}>
          {children}
        </Container>
      )}
    </Container>
  );
}

/**
 * The editor's left panel (decision 0093): the page's sections, their columns and blocks as a tree to select from,
 * with move, duplicate and delete on each; then the blocks to add to the selected column; then a new section.
 */
export function StructurePanel(props: StructurePanelProps) {
  const { doc, selection, onSelect, invalid } = props;
  const [layout, setLayout] = useState<SectionLayout>('one');

  // Blocks are added to the selected block's column, or the selected section's first column.
  const target = (() => {
    if (!selection) return undefined;
    const section = doc.sections.find((candidate) => candidate.id === selection.sectionId);
    if (!section) return undefined;
    const columnId = selection.kind === 'block' ? selection.columnId : section.columns[0]?.id;
    const index = section.columns.findIndex((column) => column.id === columnId);
    return columnId ? { columnId, label: section.columns.length > 1 ? `column ${index + 1}` : 'the section' } : undefined;
  })();

  return (
    <Container flex={{ direction: 'column', gap: 20 }}>
      <Container flex={{ direction: 'column', gap: 6 }}>
        <Text as="h2" fontSize={13} fontWeight={600} letterSpacing={0.5} textColor={{ color: 'surface', intensity: 700 }}>
          STRUCTURE
        </Text>
        {doc.sections.length === 0 && (
          <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
            No sections yet. Add one below.
          </Text>
        )}
        <Container as="ul" flex={{ direction: 'column', gap: 2 }} aria-label="Page structure">
          {doc.sections.map((section, sectionIndex) => (
            <Container as="li" key={section.id} flex={{ direction: 'column', gap: 2 }}>
              <Container as="ul" flex={{ direction: 'column', gap: 2 }}>
                <Row
                  icon="rows-3"
                  label={`Section ${sectionIndex + 1}`}
                  detail={LAYOUT_LABELS[section.layout]}
                  selected={selection?.kind === 'section' && selection.sectionId === section.id}
                  invalid={invalid.has(section.id)}
                  indent={0}
                  onSelect={() => onSelect({ kind: 'section', sectionId: section.id })}
                >
                  <Action label="Move section up" icon="arrow-up" disabled={sectionIndex === 0} onClick={() => props.onMoveSection(section.id, -1)} />
                  <Action label="Move section down" icon="arrow-down" disabled={sectionIndex === doc.sections.length - 1} onClick={() => props.onMoveSection(section.id, 1)} />
                  <Action label="Duplicate section" icon="copy" onClick={() => props.onDuplicateSection(section.id)} />
                  <Action label="Delete section" icon="trash-2" onClick={() => props.onRemoveSection(section.id)} />
                </Row>
                {section.columns.map((column, columnIndex) => (
                  <Container as="li" key={column.id} flex={{ direction: 'column', gap: 2 }}>
                    {section.columns.length > 1 && (
                      <Text as="span" fontSize={12} fontWeight={600} padding={{ left: 20, top: 4 }} textColor={{ color: 'surface', intensity: 600 }}>
                        Column {columnIndex + 1}
                      </Text>
                    )}
                    <Container as="ul" flex={{ direction: 'column', gap: 2 }}>
                      {column.blocks.length === 0 && (
                        <Text as="span" fontSize={13} padding={{ left: 28, y: 4 }} textColor={{ color: 'surface', intensity: 600 }}>
                          Empty
                        </Text>
                      )}
                      {column.blocks.map((block, blockIndex) => (
                        <Row
                          key={block.id}
                          icon={BLOCK_TYPES[block.type].icon as IconName}
                          label={blockSummary(block)}
                          selected={selection?.kind === 'block' && selection.blockId === block.id}
                          invalid={invalid.has(block.id)}
                          indent={16}
                          onSelect={() => onSelect({ kind: 'block', sectionId: section.id, columnId: column.id, blockId: block.id })}
                        >
                          <Action label="Move block up" icon="arrow-up" disabled={blockIndex === 0} onClick={() => props.onMoveBlock(block.id, -1)} />
                          <Action label="Move block down" icon="arrow-down" disabled={blockIndex === column.blocks.length - 1} onClick={() => props.onMoveBlock(block.id, 1)} />
                          <Action label="Duplicate block" icon="copy" onClick={() => props.onDuplicateBlock(block.id)} />
                          <Action label="Delete block" icon="trash-2" onClick={() => props.onRemoveBlock(block.id)} />
                        </Row>
                      ))}
                    </Container>
                  </Container>
                ))}
              </Container>
            </Container>
          ))}
        </Container>
      </Container>

      <Container flex={{ direction: 'column', gap: 8 }}>
        <Text as="h2" fontSize={13} fontWeight={600} letterSpacing={0.5} textColor={{ color: 'surface', intensity: 700 }}>
          ADD A BLOCK
        </Text>
        <Text as="p" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
          {target ? `To ${target.label}${selection?.kind === 'block' ? ', after the selected block' : ''}.` : 'Select a section or block first.'}
        </Text>
        <Container grid={{ columns: 2, gap: 6 }}>
          {contentBlockTypes.map((type) => (
            <Tooltip key={type} content={BLOCK_TYPES[type].description}>
              <Button
                variant="outlined"
                leadingIcon={BLOCK_TYPES[type].icon as IconName}
                disabled={!target}
                width="full"
                onClick={() => target && props.onAddBlock(target.columnId, type)}
              >
                {BLOCK_TYPES[type].label}
              </Button>
            </Tooltip>
          ))}
        </Container>
      </Container>

      <Container flex={{ direction: 'column', gap: 8 }}>
        <Text as="h2" fontSize={13} fontWeight={600} letterSpacing={0.5} textColor={{ color: 'surface', intensity: 700 }}>
          ADD A SECTION
        </Text>
        <Select
          label="Layout"
          value={layout}
          onValueChange={(value) => setLayout(value as SectionLayout)}
          options={(Object.keys(sectionLayouts) as SectionLayout[]).map((key) => ({ value: key, label: LAYOUT_LABELS[key] }))}
        />
        <Button leadingIcon="plus" variant="outlined" onClick={() => props.onAddSection(layout)}>
          Add section
        </Button>
      </Container>
    </Container>
  );
}
