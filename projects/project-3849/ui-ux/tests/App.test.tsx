import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('App component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<App />);
    expect(getByText('Click me')).toBeInTheDocument();
    expect(getByText('Enter your name')).toBeInTheDocument();
  });

  it('should call button onClick handler when button is clicked', () => {
    const { getByText } = render(<App />);
    const button = getByText('Click me');
    fireEvent.click(button);
    // Add assertion for button click handler
  });

  it('should call input onChange handler when input value changes', () => {
    const { getByLabelText } = render(<App />);
    const input = getByLabelText('Enter your name');
    fireEvent.change(input, { target: { value: 'John Doe' } });
    // Add assertion for input change handler
  });
});