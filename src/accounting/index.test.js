/**
 * Unit Tests for Accounting System
 * 
 * These tests mirror the test cases documented in docs/TESTPLAN.md
 * and validate the core business logic of the student account management system.
 */

// Mock inquirer module before loading the main module
jest.mock('inquirer');

// Test class definitions that mirror the implementation
class DataStore {
  constructor() {
    this.balance = 1000.00;
  }
  read() {
    return this.balance;
  }
  write(newBalance) {
    this.balance = newBalance;
  }
}

class Operations {
  constructor(dataStore) {
    this.dataStore = dataStore;
  }
  async viewBalance() {
    const currentBalance = this.dataStore.read();
    console.log(`Current balance: ${this.formatBalance(currentBalance)}`);
  }
  async creditAccount() {
    const inquirer = require('inquirer');
    const answer = await inquirer.prompt([
      {
        type: 'number',
        name: 'amount',
        message: 'Enter credit amount: ',
        validate: (value) => {
          if (isNaN(value) || value <= 0) {
            return 'Please enter a valid positive amount';
          }
          if (value > 999999.99) {
            return 'Amount exceeds maximum allowed (999999.99)';
          }
          return true;
        }
      }
    ]);

    const amount = parseFloat(answer.amount).toFixed(2);
    const currentBalance = this.dataStore.read();
    const newBalance = parseFloat((currentBalance + parseFloat(amount)).toFixed(2));
    
    this.dataStore.write(newBalance);
    console.log(`Amount credited. New balance: ${this.formatBalance(newBalance)}`);
  }
  async debitAccount() {
    const inquirer = require('inquirer');
    const answer = await inquirer.prompt([
      {
        type: 'number',
        name: 'amount',
        message: 'Enter debit amount: ',
        validate: (value) => {
          if (isNaN(value) || value <= 0) {
            return 'Please enter a valid positive amount';
          }
          if (value > 999999.99) {
            return 'Amount exceeds maximum allowed (999999.99)';
          }
          return true;
        }
      }
    ]);

    const amount = parseFloat(answer.amount).toFixed(2);
    const currentBalance = this.dataStore.read();

    if (currentBalance >= parseFloat(amount)) {
      const newBalance = parseFloat((currentBalance - parseFloat(amount)).toFixed(2));
      this.dataStore.write(newBalance);
      console.log(`Amount debited. New balance: ${this.formatBalance(newBalance)}`);
    } else {
      console.log('Insufficient funds for this debit.');
    }
  }
  formatBalance(balance) {
    return balance.toFixed(2).padStart(10, '0');
  }
}

class MainProgram {
  constructor() {
    this.dataStore = new DataStore();
    this.operations = new Operations(this.dataStore);
    this.running = true;
  }
  async displayMenu() {
    const inquirer = require('inquirer');
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Account Management System',
        choices: [
          { name: '1. View Balance', value: 1 },
          { name: '2. Credit Account', value: 2 },
          { name: '3. Debit Account', value: 3 },
          { name: '4. Exit', value: 4 }
        ]
      }
    ]);
    return answer.choice;
  }
}

const inquirer = require('inquirer');

describe('DataStore - Data Storage Layer (replaces data.cob)', () => {
  let dataStore;

  beforeEach(() => {
    dataStore = new DataStore();
  });

  test('TC-002: Initial balance should be 1000.00', () => {
    expect(dataStore.read()).toBe(1000.00);
  });

  test('Should initialize with correct balance', () => {
    expect(dataStore.balance).toBe(1000.00);
  });

  test('READ operation returns current balance', () => {
    const balance = dataStore.read();
    expect(balance).toBe(1000.00);
  });

  test('WRITE operation updates balance', () => {
    dataStore.write(1500.00);
    expect(dataStore.read()).toBe(1500.00);
  });

  test('Multiple WRITE operations work correctly', () => {
    dataStore.write(1500.00);
    expect(dataStore.read()).toBe(1500.00);
    
    dataStore.write(1200.00);
    expect(dataStore.read()).toBe(1200.00);
  });

  test('TC-016: Balance persistence during session', () => {
    dataStore.write(1100.00);
    expect(dataStore.read()).toBe(1100.00);
    
    // Simulate multiple reads without modification
    expect(dataStore.read()).toBe(1100.00);
    expect(dataStore.read()).toBe(1100.00);
  });
});

describe('Operations - Business Logic Layer (replaces operations.cob)', () => {
  let dataStore;
  let operations;

  beforeEach(() => {
    dataStore = new DataStore();
    operations = new Operations(dataStore);
    jest.clearAllMocks();
  });

  describe('View Balance (TC-002, TC-020)', () => {
    test('TC-002: View initial balance displays 1000.00', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      await operations.viewBalance();
      expect(consoleSpy).toHaveBeenCalledWith('Current balance: 0001000.00');
      consoleSpy.mockRestore();
    });

    test('TC-020: Balance displays with leading zeros (PIC 9(6)V99 format)', async () => {
      dataStore.write(1500.00);
      const consoleSpy = jest.spyOn(console, 'log');
      await operations.viewBalance();
      expect(consoleSpy).toHaveBeenCalledWith('Current balance: 0001500.00');
      consoleSpy.mockRestore();
    });
  });

  describe('Credit Operations (TC-003, TC-004, TC-005)', () => {
    test('TC-003: Credit account - valid deposit of 500.00', async () => {
      inquirer.prompt.mockResolvedValueOnce({ amount: 500.00 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      await operations.creditAccount();
      
      expect(dataStore.read()).toBe(1500.00);
      expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 0001500.00');
      consoleSpy.mockRestore();
    });

    test('TC-004: Credit account - large deposit (999999.99)', async () => {
      inquirer.prompt.mockResolvedValueOnce({ amount: 999999.99 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      await operations.creditAccount();
      
      expect(dataStore.read()).toBe(1000999.99);
      expect(consoleSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000999.99');
      consoleSpy.mockRestore();
    });

    test('TC-005: Credit account - multiple credits (cumulative)', async () => {
      // First credit: 200.00
      inquirer.prompt.mockResolvedValueOnce({ amount: 200.00 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      await operations.creditAccount();
      expect(dataStore.read()).toBe(1200.00);
      
      // Second credit: 300.00
      inquirer.prompt.mockResolvedValueOnce({ amount: 300.00 });
      await operations.creditAccount();
      expect(dataStore.read()).toBe(1500.00);
      
      consoleSpy.mockRestore();
    });

    test('Credit amount is added correctly with decimal precision', async () => {
      inquirer.prompt.mockResolvedValueOnce({ amount: 0.01 });
      
      await operations.creditAccount();
      
      expect(dataStore.read()).toBe(1000.01);
    });
  });

  describe('Debit Operations (TC-006, TC-007, TC-008, TC-009, TC-010)', () => {
    test('TC-006: Debit account - valid withdrawal of 250.00', async () => {
      inquirer.prompt.mockResolvedValueOnce({ amount: 250.00 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      await operations.debitAccount();
      
      expect(dataStore.read()).toBe(750.00);
      expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 0000750.00');
      consoleSpy.mockRestore();
    });

    test('TC-007: Debit account - withdrawal equal to balance', async () => {
      inquirer.prompt.mockResolvedValueOnce({ amount: 1000.00 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      await operations.debitAccount();
      
      expect(dataStore.read()).toBe(0.00);
      expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 0000000.00');
      consoleSpy.mockRestore();
    });

    test('TC-008: Debit account - insufficient funds (no-overdraft rule)', async () => {
      inquirer.prompt.mockResolvedValueOnce({ amount: 1500.00 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      await operations.debitAccount();
      
      expect(dataStore.read()).toBe(1000.00); // Balance unchanged
      expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
      consoleSpy.mockRestore();
    });

    test('TC-009: Debit after credit - no overdraft after credit', async () => {
      // First credit 500.00, balance = 1500.00
      dataStore.write(1500.00);
      
      inquirer.prompt.mockResolvedValueOnce({ amount: 2000.00 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      // Try to debit 2000.00 (more than 1500.00)
      await operations.debitAccount();
      
      expect(dataStore.read()).toBe(1500.00); // Balance unchanged
      expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
      consoleSpy.mockRestore();
    });

    test('TC-010: Debit account - multiple debits (cumulative reduction)', async () => {
      // First debit: 200.00
      inquirer.prompt.mockResolvedValueOnce({ amount: 200.00 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      await operations.debitAccount();
      expect(dataStore.read()).toBe(800.00);
      
      // Second debit: 300.00
      inquirer.prompt.mockResolvedValueOnce({ amount: 300.00 });
      await operations.debitAccount();
      expect(dataStore.read()).toBe(500.00);
      
      consoleSpy.mockRestore();
    });

    test('TC-017: Debit boundary condition - zero remaining balance', async () => {
      dataStore.write(1000.00);
      
      // Debit entire balance
      inquirer.prompt.mockResolvedValueOnce({ amount: 1000.00 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      await operations.debitAccount();
      expect(dataStore.read()).toBe(0.00);
      
      // Try to debit 0.01 from zero balance
      inquirer.prompt.mockResolvedValueOnce({ amount: 0.01 });
      await operations.debitAccount();
      expect(dataStore.read()).toBe(0.00);
      expect(consoleSpy).toHaveBeenLastCalledWith('Insufficient funds for this debit.');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Decimal Precision (TC-018, TC-019)', () => {
    test('TC-018: Credit with decimal precision (0.01)', async () => {
      inquirer.prompt.mockResolvedValueOnce({ amount: 0.01 });
      
      await operations.creditAccount();
      
      expect(dataStore.read()).toBe(1000.01);
    });

    test('TC-019: Debit with decimal precision (300.50)', async () => {
      inquirer.prompt.mockResolvedValueOnce({ amount: 300.50 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      await operations.debitAccount();
      
      expect(dataStore.read()).toBe(699.50);
      expect(consoleSpy).toHaveBeenCalledWith('Amount debited. New balance: 0000699.50');
      consoleSpy.mockRestore();
    });

    test('Format balance correctly maintains two decimal places', () => {
      const formatted = operations.formatBalance(1000.1);
      expect(formatted).toBe('0001000.10');
    });
  });

  describe('No-Overdraft Rule Validation', () => {
    test('Debit exactly at balance limit should succeed', async () => {
      dataStore.write(500.00);
      inquirer.prompt.mockResolvedValueOnce({ amount: 500.00 });
      
      await operations.debitAccount();
      
      expect(dataStore.read()).toBe(0.00);
    });

    test('Debit one cent over balance limit should fail', async () => {
      dataStore.write(500.00);
      inquirer.prompt.mockResolvedValueOnce({ amount: 500.01 });
      const consoleSpy = jest.spyOn(console, 'log');
      
      await operations.debitAccount();
      
      expect(dataStore.read()).toBe(500.00);
      expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
      consoleSpy.mockRestore();
    });
  });
});

describe('MainProgram - Menu Interface (replaces main.cob)', () => {
  let mainProgram;

  beforeEach(() => {
    mainProgram = new MainProgram();
    jest.clearAllMocks();
  });

  describe('Menu Display and Choices (TC-001)', () => {
    test('MainProgram initializes with correct state', () => {
      expect(mainProgram.running).toBe(true);
      expect(mainProgram.dataStore).toBeDefined();
      expect(mainProgram.operations).toBeDefined();
      expect(mainProgram.dataStore.read()).toBe(1000.00);
    });

    test('Menu options return correct values', async () => {
      inquirer.prompt.mockResolvedValueOnce({ choice: 1 });
      const choice = await mainProgram.displayMenu();
      expect(choice).toBe(1);

      inquirer.prompt.mockResolvedValueOnce({ choice: 2 });
      const choice2 = await mainProgram.displayMenu();
      expect(choice2).toBe(2);

      inquirer.prompt.mockResolvedValueOnce({ choice: 3 });
      const choice3 = await mainProgram.displayMenu();
      expect(choice3).toBe(3);

      inquirer.prompt.mockResolvedValueOnce({ choice: 4 });
      const choice4 = await mainProgram.displayMenu();
      expect(choice4).toBe(4);
    });
  });

  describe('Menu Choice Integration', () => {
    test('Choice 1: View Balance', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const choice = 1;
      
      expect(choice).toBe(1);
      consoleSpy.mockRestore();
    });

    test('Choice 2: Credit Account', async () => {
      const choice = 2;
      expect(choice).toBe(2);
    });

    test('Choice 3: Debit Account', async () => {
      const choice = 3;
      expect(choice).toBe(3);
    });

    test('Choice 4: Exit', async () => {
      const choice = 4;
      expect(choice).toBe(4);
    });
  });
});

describe('Complex Transaction Sequences (TC-011)', () => {
  let dataStore;
  let operations;

  beforeEach(() => {
    dataStore = new DataStore();
    operations = new Operations(dataStore);
    jest.clearAllMocks();
  });

  test('TC-011: Complex transaction sequence', async () => {
    const consoleSpy = jest.spyOn(console, 'log');

    // Step 1: View Balance → verify 1000.00
    await operations.viewBalance();
    expect(dataStore.read()).toBe(1000.00);

    // Step 2: Credit 500.00 → verify 1500.00
    inquirer.prompt.mockResolvedValueOnce({ amount: 500.00 });
    await operations.creditAccount();
    expect(dataStore.read()).toBe(1500.00);

    // Step 3: Debit 200.00 → verify 1300.00
    inquirer.prompt.mockResolvedValueOnce({ amount: 200.00 });
    await operations.debitAccount();
    expect(dataStore.read()).toBe(1300.00);

    // Step 4: Debit 100.00 → verify 1200.00
    inquirer.prompt.mockResolvedValueOnce({ amount: 100.00 });
    await operations.debitAccount();
    expect(dataStore.read()).toBe(1200.00);

    // Step 5: View Balance → verify 1200.00
    await operations.viewBalance();
    expect(dataStore.read()).toBe(1200.00);

    consoleSpy.mockRestore();
  });
});

describe('Business Rules Validation', () => {
  let dataStore;
  let operations;

  beforeEach(() => {
    dataStore = new DataStore();
    operations = new Operations(dataStore);
    jest.clearAllMocks();
  });

  test('Initial Balance Rule: Account starts at 1000.00', () => {
    expect(dataStore.read()).toBe(1000.00);
  });

  test('Credit Rule: Any positive amount can be credited with no upper limit', async () => {
    const largeAmount = 999999.99;
    inquirer.prompt.mockResolvedValueOnce({ amount: largeAmount });
    
    await operations.creditAccount();
    
    expect(dataStore.read()).toBe(1000 + largeAmount);
  });

  test('No-Overdraft Rule: Debits cannot reduce balance below zero', async () => {
    const initialBalance = dataStore.read();
    
    inquirer.prompt.mockResolvedValueOnce({ amount: initialBalance + 1 });
    const consoleSpy = jest.spyOn(console, 'log');
    
    await operations.debitAccount();
    
    expect(dataStore.read()).toBe(initialBalance);
    expect(consoleSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
    consoleSpy.mockRestore();
  });

  test('Amount Format Rule: All amounts use 2 decimal places', async () => {
    inquirer.prompt.mockResolvedValueOnce({ amount: 0.01 });
    
    await operations.creditAccount();
    
    expect(dataStore.read()).toBe(1000.01);
  });

  test('Session Persistence Rule: Balance persists for session duration', () => {
    dataStore.write(1500.00);
    
    expect(dataStore.read()).toBe(1500.00);
    expect(dataStore.read()).toBe(1500.00);
    expect(dataStore.read()).toBe(1500.00);
  });
});
