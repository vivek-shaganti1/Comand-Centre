from app import db
from models import Account, Transaction

class AccountRepository:
    def get_all_accounts(self):
        return Account.query.all()

    def get_account_by_id(self, id):
        return Account.query.get(id)

    def create_account(self, account_number, account_type, balance):
        new_account = Account(account_number=account_number, account_type=account_type, balance=balance)
        db.session.add(new_account)
        db.session.commit()
        return new_account

    def update_account(self, id, account_number, account_type, balance):
        account = self.get_account_by_id(id)
        if account:
            account.account_number = account_number
            account.account_type = account_type
            account.balance = balance
            db.session.commit()
            return account
        return None

    def delete_account(self, id):
        account = self.get_account_by_id(id)
        if account:
            db.session.delete(account)
            db.session.commit()
            return True
        return False

class TransactionRepository:
    def get_all_transactions(self):
        return Transaction.query.all()

    def get_transaction_by_id(self, id):
        return Transaction.query.get(id)

    def create_transaction(self, transaction_type, amount, account_id):
        new_transaction = Transaction(transaction_type=transaction_type, amount=amount, account_id=account_id)
        db.session.add(new_transaction)
        db.session.commit()
        return new_transaction

    def update_transaction(self, id, transaction_type, amount):
        transaction = self.get_transaction_by_id(id)
        if transaction:
            transaction.transaction_type = transaction_type
            transaction.amount = amount
            db.session.commit()
            return transaction
        return None

    def delete_transaction(self, id):
        transaction = self.get_transaction_by_id(id)
        if transaction:
            db.session.delete(transaction)
            db.session.commit()
            return True
        return False