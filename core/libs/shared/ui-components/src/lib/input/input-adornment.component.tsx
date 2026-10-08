import { useContext, type MouseEvent } from 'react';
import { Icon, type IconName } from '../icon/icon.component';
import { InputContext } from './input.context';

/** Icon size inside an input, in px. */
const ADORNMENT_ICON_SIZE = 16;

export type InputAdornmentProps = { icon: IconName } & (
  | { onClick?: undefined; label?: string }
  | { onClick: (event: MouseEvent<HTMLButtonElement>) => void; label: string }
);

/**
 * An icon for an Input's startAdornment or endAdornment (decision 0055). With onClick it's a small button, and
 * label is required to name it; without, it's decorative unless labelled. Clicking it keeps focus in the input.
 */
export function InputAdornment({ icon, label, onClick }: InputAdornmentProps) {
  const { disabled } = useContext(InputContext);

  if (!onClick) {
    return (
      <span className="ui-input-adornment">
        <Icon name={icon} size={ADORNMENT_ICON_SIZE} label={label} />
      </span>
    );
  }

  return (
    <button
      type="button"
      className="ui-input-adornment ui-input-adornment-button"
      aria-label={label}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <Icon name={icon} size={ADORNMENT_ICON_SIZE} />
    </button>
  );
}
