import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Button from '../components/Button';

describe('Button component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button label='Click me' onClick={() => {}} />);
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const onClick = jest.fn();
    const { getByText } = render(<Button label='Click me' onClick={onClick} />);
    const button = getByText('Click me');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});