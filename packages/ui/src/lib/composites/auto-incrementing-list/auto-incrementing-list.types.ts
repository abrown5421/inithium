export interface AutoIncrementingListProps<T = unknown> {
  renderItem: (index: number) => React.ReactNode;
  min?: number;
  max?: number;
  defaultCount?: number;
  onChange?: (count: number) => void;
  className?: string;
  gap?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
}