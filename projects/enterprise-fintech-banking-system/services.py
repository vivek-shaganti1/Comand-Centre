from repository import AccountRepository, TransactionRepository
from schemas import UserSchema, AccountSchema, TransactionSchema

class AccountService:
    def __init__(self):
        self.account_repository = AccountRepository()
        self.account_schema = AccountSchema()

    def get_all_accounts(self):
        accounts = self.account_repository.get_all_accounts()
        return self.account_schema.dump(accounts, many=True)

    def get_account_by_id(self, id):
        account = self.account_repository.get_account_by_id(id)
        return self.account_schema.dump(account)

    def create_account(self, account_number, account_type, balance):
        new_account = self.account_repository.create_account(account_number, account_type, balance)
        return self.account_schema.dump(new_account)

    def update_account(self, id, account_number, account_type, balance):
        updated_account = self.account_repository.update_account(id, account_number, account_type, balance)
        if updated_account:
            return self.account_schema.dump(updated_account)
        return None

    def delete_account(self, id):
        return self.account_repository.delete_account(id)

class TransactionService:
    def __init__(self):
        self.transaction_repository = TransactionRepository()
        self.transaction_schema = TransactionSchema()

    def get_all_transactions(self):
        transactions = self.transaction_repository.get_all_transactions()
        return self.transaction_schema.dump(transactions, many=True)

    def get_transaction_by_id(self, id):
        transaction = self.transaction_repository.get_transaction_by_id(id)
        return self.transaction_schema.dump(transaction)

    def create_transaction(self, transaction_type, amount, account_id):
        new_transaction = self.transaction_repository.create_transaction(transaction_type, amount, account_id)
        return self.transaction_schema.dump(new_transaction)

    def update_transaction(self, id, transaction_type, amount):
        updated_transaction = self.transaction_repository.update_transaction(id, transaction_type, amount)
        if updated_transaction:
            return self.transaction_schema.dump(updated_transaction)
        return None

    def delete_transaction(self, id):
        return self.transaction_repository.delete_transaction(id)