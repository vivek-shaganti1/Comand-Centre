import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Input from '../components/Input';

describe('Input component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Input label='Enter your name' onChange={() => {}} />);
    expect(getByText('Enter your name')).toBeInTheDocument();
  });

  it('should call onChange handler when input value changes', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<Input label='Enter your name' onChange={onChange} />);
    const input = getByLabelText('Enter your name');
    fireEvent.change(input, { target: { value: 'John Doe' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('John Doe');
  });
});