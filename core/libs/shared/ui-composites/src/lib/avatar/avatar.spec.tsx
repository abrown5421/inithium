import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { UiProvider } from '@inithium/shared-ui-components';
import { Avatar } from './avatar.component';

afterEach(cleanup);

const recipe = { style: 'initials', seed: 'ada' } as const;

describe('Avatar’s status light (decision 0124)', () => {
  it('draws the light with its label for screen readers', () => {
    render(
      <UiProvider>
        <Avatar value={recipe} name="Ada" presence={{ color: 'green', label: 'Active' }} />
      </UiProvider>,
    );
    expect(screen.getByRole('img', { name: 'Active' })).toBeTruthy();
  });

  it('moves the edit button to the top-right edge when there’s a light', () => {
    const { rerender } = render(
      <UiProvider>
        <Avatar value={recipe} name="Ada" editable />
      </UiProvider>,
    );
    expect(screen.getByRole('button', { name: 'Edit avatar' }).getAttribute('data-corner')).toBeNull();
    rerender(
      <UiProvider>
        <Avatar value={recipe} name="Ada" editable presence={{ color: 'yellow', label: 'Inactive' }} />
      </UiProvider>,
    );
    expect(screen.getByRole('button', { name: 'Edit avatar' }).getAttribute('data-corner')).toBe('top');
  });
});
