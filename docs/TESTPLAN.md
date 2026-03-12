# Test Plan: Student Account Management System

## Overview
This test plan documents functional and business logic test cases for the student account management system COBOL application. These tests validate the core operations: account balance inquiry, credit (deposit), and debit (withdrawal) transactions, with specific attention to the no-overdraft business rule.

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Menu Display on Application Start | Application not running | 1. Execute the application | The menu displays with options: 1. View Balance, 2. Credit Account, 3. Debit Account, 4. Exit | | | |
| TC-002 | View Initial Balance | Application running, no transactions performed | 1. Select option 1 (View Balance) from menu | The current balance displays as 1000.00 | | | |
| TC-003 | Credit Account - Valid Deposit | Application running, initial balance is 1000.00 | 1. Select option 2 (Credit Account)<br/>2. Enter amount: 500.00 | New balance displays as 1500.00; application returns to menu | | | |
| TC-004 | Credit Account - Large Deposit | Application running, initial balance is 1000.00 | 1. Select option 2 (Credit Account)<br/>2. Enter amount: 999999.99 (max allowed) | New balance displays as 1000999.99; application returns to menu | | | |
| TC-005 | Credit Account - Multiple Credits | Application running, initial balance is 1000.00 | 1. Credit 200.00<br/>2. Verify balance is 1200.00<br/>3. Credit 300.00<br/>4. Verify balance is 1500.00 | Each credit is applied; balances are cumulative (1200.00, then 1500.00) | | | |
| TC-006 | Debit Account - Valid Withdrawal | Application running, initial balance is 1000.00 | 1. Select option 3 (Debit Account)<br/>2. Enter amount: 250.00 | New balance displays as 750.00; application returns to menu | | | |
| TC-007 | Debit Account - Withdrawal Equal to Balance | Application running, initial balance is 1000.00 | 1. Select option 3 (Debit Account)<br/>2. Enter amount: 1000.00 | New balance displays as 0.00; application returns to menu | | | |
| TC-008 | Debit Account - Insufficient Funds | Application running, initial balance is 1000.00 | 1. Select option 3 (Debit Account)<br/>2. Enter amount: 1500.00 | Error message "Insufficient funds for this debit." displays; balance remains 1000.00; application returns to menu | | | |
| TC-009 | Debit Account - No Overdraft after Credit | Application running, initial balance is 1000.00 | 1. Credit 500.00 (balance = 1500.00)<br/>2. Debit 2000.00 | Error message "Insufficient funds for this debit." displays; balance remains 1500.00; application returns to menu | | | |
| TC-010 | Debit Account - Multiple Debits | Application running, initial balance is 1000.00 | 1. Debit 200.00 (balance = 800.00)<br/>2. Verify balance is 800.00<br/>3. Debit 300.00 (balance = 500.00)<br/>4. Verify balance is 500.00 | Each debit is applied; balances are updated correctly (800.00, then 500.00) | | | |
| TC-011 | Complex Transaction Sequence | Application running, initial balance is 1000.00 | 1. View Balance → verify 1000.00<br/>2. Credit 500.00 → verify 1500.00<br/>3. Debit 200.00 → verify 1300.00<br/>4. Debit 100.00 → verify 1200.00<br/>5. View Balance → verify 1200.00 | Each operation executes correctly; final balance is 1200.00 | | | |
| TC-012 | Invalid Menu Choice - Below Range | Application running, menu displayed | 1. Select option 0 (invalid) | Error message "Invalid choice, please select 1-4." displays; menu redisplays | | | |
| TC-013 | Invalid Menu Choice - Above Range | Application running, menu displayed | 1. Select option 5 (invalid) | Error message "Invalid choice, please select 1-4." displays; menu redisplays | | | |
| TC-014 | Invalid Menu Choice - Non-Numeric | Application running, menu displayed | 1. Enter non-numeric input (e.g., "A") | Error message "Invalid choice, please select 1-4." displays; menu redisplays | | | |
| TC-015 | Exit Application - Option 4 | Application running, menu displayed | 1. Select option 4 (Exit) | Message "Exiting the program. Goodbye!" displays; application terminates | | | |
| TC-016 | Balance Persistence During Session | Application running, initial balance is 1000.00 | 1. Credit 100.00 (balance = 1100.00)<br/>2. Navigate menu multiple times (view balance, credit, debit)<br/>3. Verify balance throughout | Balance persists as 1100.00 throughout all operations until modified by transaction | | | |
| TC-017 | Debit - Boundary Condition (Zero Remaining) | Application running, initial balance is 1000.00 | 1. Debit 1000.00 (balance becomes 0.00)<br/>2. Attempt Debit 0.01 | Debit of 0.01 should fail (balance 0.00 < 0.01); error message displays | | | |
| TC-018 | Credit - Decimal Precision | Application running, initial balance is 1000.00 | 1. Credit 0.01<br/>2. View Balance | Balance displays as 1000.01 with correct two-decimal precision | | | |
| TC-019 | Debit - Decimal Precision | Application running, initial balance is 1000.00 | 1. Debit 300.50<br/>2. View Balance | Balance displays as 699.50 with correct two-decimal precision | | | |
| TC-020 | Format Validation - Balance Display Format | Application running after any transaction | 1. Perform any operation<br/>2. View Balance | Balance displays in format XXXXXX.XX (e.g., 001000.00, 001500.00) with leading zeros as per PIC 9(6)V99 specification | | | |

---

## Test Execution Notes

### Scope
This test plan covers the following functional areas:
- **Menu Navigation:** The interactive menu system and option selection
- **Balance Inquiry:** Viewing the current account balance
- **Credit Operations:** Adding funds to the account (deposits)
- **Debit Operations:** Withdrawing funds from the account (with no-overdraft validation)
- **Data Persistence:** Balance state maintenance during a session
- **Error Handling:** Invalid input and insufficient funds scenarios
- **Data Format:** Decimal precision and numeric formatting

### Business Rules Validation
The test cases above validate the following key business rules:
1. **Initial Balance Rule:** Account starts at 1000.00
2. **No-Overdraft Rule:** Debits cannot reduce balance below zero (TC-008, TC-009, TC-017)
3. **Credit Rule:** Any positive amount can be credited with no upper limit check (TC-003, TC-004, TC-005)
4. **Amount Format Rule:** All amounts use 2 decimal places (TC-018, TC-019, TC-020)
5. **Session Persistence Rule:** Balance persists for the duration of the program session (TC-016)
6. **Menu Input Validation:** Only numeric values 1-4 are accepted (TC-012, TC-013, TC-014)

### Test Environment Requirements
- COBOL compiler (GnuCOBOL/cobc)
- Terminal or console for interactive testing
- Compiled executable: `accountsystem`

### Test Execution Method
For manual testing:
1. Compile: `cobc -x src/cobol/main.cob src/cobol/operations.cob src/cobol/data.cob -o accountsystem`
2. Run: `./accountsystem`
3. Execute test steps manually, recording actual results and pass/fail status

For automated testing (Node.js migration):
- Translate each test case to a unit test using a testing framework (e.g., Jest, Mocha)
- Mock or simulate user input for each test step
- Assert the expected balance and messages for each test case

---

## Notes for Modernization
As the application is migrated to Node.js:
- Maintain the same business rules and validations
- Implement the same no-overdraft protection logic
- Use the same PIC 9(6)V99 format specification for balance amounts (store as numbers with 2 decimal precision)
- Preserve the menu-driven interface or migrate to a REST API with equivalent operations
- Create unit tests based on the test cases in this plan
- Consider adding integration tests for multi-step transaction sequences (TC-011)
