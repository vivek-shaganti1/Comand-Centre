CREATE TABLE Users (
  id INT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255)
);
CREATE TABLE Accounts (
  id INT PRIMARY KEY,
  user_id INT,
  account_number VARCHAR(255),
  account_type VARCHAR(255),
  balance DECIMAL(10, 2),
  FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE TABLE Transactions (
  id INT PRIMARY KEY,
  account_id INT,
  transaction_type VARCHAR(255),
  amount DECIMAL(10, 2),
  timestamp TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES Accounts(id)
);