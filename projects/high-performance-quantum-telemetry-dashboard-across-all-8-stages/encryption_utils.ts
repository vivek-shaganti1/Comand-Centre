import * as crypto from 'crypto';

export const encryptData = (data: string) => {
  const cipher = crypto.createCipher('aes-256-cbc', 'your_secret_key');
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decryptData = (encryptedData: string) => {
  const decipher = crypto.createDecipher('aes-256-cbc', 'your_secret_key');
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};