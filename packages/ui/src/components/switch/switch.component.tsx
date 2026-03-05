import React from 'react';
import { Switch as HeadlessUISwitch } from '@headlessui/react';
import type { ISwitchProps } from './switch.types.js';

export function Switch(props: ISwitchProps): React.JSX.Element {
  const { label, hint, error, required, className, checked, onChange, disabled } = props;
  const hasError = Boolean(error);

  return (
    <div className="field-wrapper">
      <div className="flex items-center gap-3">
        <HeadlessUISwitch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`switch-track ${className ?? ''}`}
        >
          <span className="switch-thumb" />
        </HeadlessUISwitch>
        {label ? (
          <span className="field-label">
            {label}
            {required ? <span className="text-destructive">*</span> : null}
          </span>
        ) : null}
      </div>

      {!hasError && hint ? <p className="field-hint">{hint}</p> : null}
      {hasError ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

