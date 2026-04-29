import React, { useState } from 'react';
import { Box } from '../../components/box/box';
import { Button } from '../../components/button/button';
import { Icon } from '../../components/icon/icon';
import type { AutoIncrementingListProps } from './auto-incrementing-list.types';

let uid = 0;
const nextKey = () => ++uid;

const createItems = (count: number): number[] =>
  Array.from({ length: count }, nextKey);

export const AutoIncrementingList: React.FC<AutoIncrementingListProps> = ({
  renderItem,
  min = 1,
  max = Infinity,
  defaultCount,
  onChange,
  className = '',
  gap = '3',
}) => {
  const initialCount = Math.max(defaultCount ?? min, min);

  const [items, setItems] = useState<number[]>(() => createItems(initialCount));

  const count = items.length;
  const atMin = count <= min;
  const atMax = max !== Infinity && count >= max;

  const handleAdd = () => {
    if (atMax) return;
    const next = [...items, nextKey()];
    setItems(next);
    onChange?.(next.length);
  };

  const handleDelete = (key: number) => {
    if (atMin) return;
    const next = items.filter((k) => k !== key);
    setItems(next);
    onChange?.(next.length);
  };

  return (
    <Box direction="col" gap={gap} className={className}>
      {items.map((key, i) => {
        const isLast = i === count - 1;

        return (
          <Box key={key} direction="row" gap="2">
            <Box flex className="min-w-0">
              {renderItem(i)}
            </Box>

            <Box
              direction="row"
              align="end"
              gap="2"
              shrink={false}
              className="pb-[1px]"
            >
              {isLast ? (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="base"
                    disabled={atMax}
                    onClick={handleAdd}
                    aria-label="Add item"
                  >
                    <Icon name="PlusIcon" iconStyle="solid-20" size="sm" aria-hidden />
                  </Button>
                  <Button
                    variant="outlined"
                    color="danger"
                    size="base"
                    disabled={atMin}
                    onClick={() => handleDelete(key)}
                    aria-label="Remove item"
                  >
                    <Icon name="TrashIcon" iconStyle="solid-20" size="sm" aria-hidden />
                  </Button>
                </>
              ) : (
                <Box direction="row" gap="2" className="w-full">
                  <Button
                    variant="outlined"
                    color="danger"
                    size="base"
                    disabled={atMin}
                    onClick={() => handleDelete(key)}
                    aria-label="Remove item"
                    className="w-full"
                  >
                    <Icon name="TrashIcon" iconStyle="solid-20" size="sm" aria-hidden />
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};