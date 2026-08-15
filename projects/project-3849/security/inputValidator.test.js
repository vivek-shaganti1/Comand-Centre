const inputValidator = require('./inputValidator');

describe('Input Validator', () => {
  it('should validate input', () => {
    const input = { name: 'John Doe', email: 'johndoe@example.com' };
    expect(inputValidator.validateInput(input)).toBeTruthy();
  });

  it('should not validate input', () => {
    const input = { name: 'John Doe', email: 123 };
    expect(inputValidator.validateInput(input)).toBeFalsy();
  });
});