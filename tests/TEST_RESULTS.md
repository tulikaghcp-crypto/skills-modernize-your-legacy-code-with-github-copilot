# Unit Tests - Node.js Accounting System

## Overview
This document summarizes the unit tests created for the Node.js port of the COBOL accounting system.

## Test Execution Results

### Summary
- **Test Suites:** 1 passed, 1 total
- **Tests:** 35 passed, 35 total  
- **Execution Time:** ~500ms
- **Status:** ✅ ALL TESTS PASSING

### Test File Location
`src/accounting/index.test.js`

## Test Coverage

### DataStore Tests (Data Storage Layer)
**Replaces `data.cob`**

| Test | Purpose |
|------|---------|
| TC-002: Initial balance should be 1000.00 | Verify initial balance on startup |
| Should initialize with correct balance | Confirm constructor sets proper default |
| READ operation returns current balance | Validate read functionality |
| WRITE operation updates balance | Validate write functionality |
| Multiple WRITE operations work correctly | Ensure sequential updates |
| TC-016: Balance persistence during session | Verify balance persists across operations |

### Operations Tests (Business Logic Layer)
**Replaces `operations.cob`**

#### View Balance Operations
- ✓ TC-002: View initial balance displays `0001000.00`
- ✓ TC-020: Balance displays with leading zeros (PIC 9(6)V99 format)

#### Credit Operations (Deposits)
- ✓ TC-003: Valid deposit of 500.00 → balance becomes 1500.00
- ✓ TC-004: Large deposit (999999.99) → maximum amount handling
- ✓ TC-005: Multiple credits → cumulative balance updates
- ✓ Credit with decimal precision (0.01)

#### Debit Operations (Withdrawals)
- ✓ TC-006: Valid withdrawal of 250.00 → balance becomes 750.00
- ✓ TC-007: Withdrawal equal to balance → balance becomes 0.00
- ✓ TC-008: Insufficient funds → NO OVERDRAFT RULE enforced
- ✓ TC-009: After credit, no overdraft → balance protection maintained
- ✓ TC-010: Multiple debits → cumulative balance reduction
- ✓ TC-017: Boundary condition → zero remaining balance with final debit attempt
- ✓ TC-018: Decimal precision with credits (0.01)
- ✓ TC-019: Decimal precision with debits (300.50)

#### No-Overdraft Rule Validation
- ✓ Debit exactly at balance limit should succeed
- ✓ Debit one cent over balance limit should fail

### MainProgram Tests (Menu Interface)
**Replaces `main.cob`**

- ✓ TC-001: Menu displays on application start
- ✓ MainProgram initializes with correct state
- ✓ Menu options return correct values (1-4)
- ✓ Choice 1: View Balance
- ✓ Choice 2: Credit Account
- ✓ Choice 3: Debit Account
- ✓ Choice 4: Exit

### Complex Scenarios
- ✓ TC-011: Complex transaction sequence (view → credit → debit → debit → view)

### Business Rules Validation
- ✓ Initial Balance Rule: Account starts at 1000.00
- ✓ Credit Rule: Any positive amount can be credited with no upper limit
- ✓ No-Overdraft Rule: Debits cannot reduce balance below zero
- ✓ Amount Format Rule: All amounts use 2 decimal places
- ✓ Session Persistence Rule: Balance persists for session duration

## Running the Tests

### Execute all tests
```bash
cd src/accounting
npm test
```

### Execute tests with verbose output
```bash
npm test -- --verbose
```

### Execute specific test file
```bash
npm test -- index.test.js
```

### Watch mode (re-run on file changes)
```bash
npm test -- --watch
```

## Test Framework Configuration

### Jest Configuration
- **Config File:** `jest.config.js`
- **Test Pattern:** `**/*.test.js`
- **Environment:** Node.js
- **Module System:** ES modules (matches package.json "type": "module")

### Dependencies
- **Jest:** ^28.0.0 (dev dependency)
- **Inquirer:** ^8.2.5 (mocked in tests)

## Mapping to COBOL Test Plan

The unit tests directly correspond to test cases in `docs/TESTPLAN.md`:

| COBOL Test Case | Unit Test | Status |
|---|---|---|
| TC-001 | Menu Display on Application Start | ✅ PASS |
| TC-002 | View Initial Balance | ✅ PASS |
| TC-003 | Credit Account - Valid Deposit | ✅ PASS |
| TC-004 | Credit Account - Large Deposit | ✅ PASS |
| TC-005 | Credit Account - Multiple Credits | ✅ PASS |
| TC-006 | Debit Account - Valid Withdrawal | ✅ PASS |
| TC-007 | Debit Account - Equal to Balance | ✅ PASS |
| TC-008 | Debit Account - Insufficient Funds | ✅ PASS |
| TC-009 | Debit - No Overdraft after Credit | ✅ PASS |
| TC-010 | Debit Account - Multiple Debits | ✅ PASS |
| TC-011 | Complex Transaction Sequence | ✅ PASS |
| TC-016 | Balance Persistence During Session | ✅ PASS |
| TC-017 | Debit - Boundary Condition | ✅ PASS |
| TC-018 | Credit - Decimal Precision | ✅ PASS |
| TC-019 | Debit - Decimal Precision | ✅ PASS |
| TC-020 | Balance Display Format | ✅ PASS |

## Key Testing Highlights

1. **No-Overdraft Rule Enforcement:** Rigorous testing ensures debits cannot exceed available balance
2. **Decimal Precision:** All calculations maintain 2 decimal place accuracy (PIC 9(6)V99 equivalent)
3. **Business Logic Parity:** Tests validate that Node.js implementation is functionally equivalent to COBOL
4. **State Management:** Confirms balance persists correctly throughout user interactions
5. **Boundary Conditions:** Tests edge cases (exact balance matches, zero balance, maximum amounts)

## Notes
- Mocked `inquirer` module ensures tests run without user interaction
- Tests validate both happy path and error scenarios
- All assertions check expected console output and balance state changes
- Test suite serves as specification for the accounting system behavior
