import { render } from '@testing-library/react';

import OrgAuth from './auth';

describe('OrgAuth', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OrgAuth />);
    expect(baseElement).toBeTruthy();
  });
});
