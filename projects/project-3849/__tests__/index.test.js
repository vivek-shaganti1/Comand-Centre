import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Claude } from '../index';

describe('Claude', () => {
  it('renders correctly', () => {
    const { container } = render(<Claude />);
    expect(container).toMatchSnapshot();
  });
});