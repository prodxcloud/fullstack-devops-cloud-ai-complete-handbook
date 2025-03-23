# from ledger.models import Ledger, JournalEntry

# def generate_balance_sheet(ledger_id):
#     ledger = Ledger.objects.get(id=ledger_id)
#     total_debits = sum([entry.debit for entry in ledger.journalentry_set.all()])
#     total_credits = sum([entry.credit for entry in ledger.journalentry_set.all()])

#     balance = total_debits - total_credits
#     return balance
