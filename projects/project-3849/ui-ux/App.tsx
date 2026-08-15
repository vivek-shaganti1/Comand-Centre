import React from 'react';
import Button from './components/Button';
import Input from './components/Input';

const App: React.FC = () => {
  const handleClick = () => {
    console.log('Button clicked');
  };

  const handleInputChange = (value: string) => {
    console.log(`Input value: ${value}`);
  };

  return (
    <div>
      <Button label='Click me' onClick={handleClick} />
      <Input label='Enter your name' onChange={handleInputChange} />
    </div>
  );
};

export default App;