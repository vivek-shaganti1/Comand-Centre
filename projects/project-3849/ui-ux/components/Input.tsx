import React, { useState } from 'react';

interface InputProps {
  label: string;
  onChange: (value: string) => void;
}

const Input: React.FC<InputProps> = ({ label, onChange }) => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div>
      <label>{label}</label>
      <input type='text' value={value} onChange={handleChange} />
    </div>
  );
};

export default Input;