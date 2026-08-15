from marshmallow import Schema, fields, validate, ValidationError

class UserSchema(Schema):
    name = fields.Str(required=True)
    email = fields.Email(required=True)

class AccountSchema(Schema):
    account_number = fields.Str(required=True)
    account_type = fields.Str(required=True)
    balance = fields.Float(required=True)

class TransactionSchema(Schema):
    transaction_type = fields.Str(required=True)
    amount = fields.Float(required=True)