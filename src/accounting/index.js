/*
 * Accounting System - Node.js Implementation
 * 
 * This application is a modern Node.js port of the original three-part COBOL system:
 * - main.cob (menu driver)
 * - operations.cob (business logic)
 * - data.cob (data storage)
 * 
 * Business Logic Preserved:
 * - Initial balance: 1000.00
 * - Credit: Add amount to balance (no limit)
 * - Debit: Subtract amount only if sufficient funds (no overdraft)
 * - Interactive menu with 4 options
 */

import inquirer from 'inquirer';

/**
 * DataStore class - Replaces data.cob
 * Manages the persistent balance for the account
 */
class DataStore {
  constructor() {
    // Initial balance equivalent to STORAGE-BALANCE in data.cob
    this.balance = 1000.00;
  }

  /**
   * Read the current balance
   * Equivalent to 'READ' operation in data.cob
   */
  read() {
    return this.balance;
  }

  /**
   * Write a new balance
   * Equivalent to 'WRITE' operation in data.cob
   */
  write(newBalance) {
    this.balance = newBalance;
  }
}

/**
 * Operations class - Replaces operations.cob
 * Implements the business logic for account operations
 */
class Operations {
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  /**
   * TOTAL operation - View current balance
   * Replaces 'TOTAL ' operation from operations.cob
   */
  async viewBalance() {
    const currentBalance = this.dataStore.read();
    console.log(`Current balance: ${this.formatBalance(currentBalance)}`);
  }

  /**
   * CREDIT operation - Add funds to account
   * Replaces 'CREDIT' operation from operations.cob
   * This operation always succeeds (no upper limit check)
   */
  async creditAccount() {
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

  /**
   * DEBIT operation - Withdraw funds from account
   * Replaces 'DEBIT ' operation from operations.cob
   * Enforces no-overdraft rule: debit only allowed if balance >= amount
   */
  async debitAccount() {
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

    // No-overdraft rule: check if sufficient funds exist
    if (currentBalance >= parseFloat(amount)) {
      const newBalance = parseFloat((currentBalance - parseFloat(amount)).toFixed(2));
      this.dataStore.write(newBalance);
      console.log(`Amount debited. New balance: ${this.formatBalance(newBalance)}`);
    } else {
      console.log('Insufficient funds for this debit.');
    }
  }

  /**
   * Format balance to match COBOL PIC 9(6)V99 specification
   * Example: 1000.00 displays as 001000.00
   */
  formatBalance(balance) {
    return balance.toFixed(2).padStart(10, '0');
  }
}

/**
 * MainProgram class - Replaces main.cob
 * Implements the menu-driven interface
 */
class MainProgram {
  constructor() {
    this.dataStore = new DataStore();
    this.operations = new Operations(this.dataStore);
    this.running = true;
  }

  /**
   * Display the main menu and process user choice
   * Equivalent to the menu loop in main.cob
   */
  async displayMenu() {
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

  /**
   * Main application loop
   * Mimics the PERFORM UNTIL loop in main.cob
   */
  async run() {
    console.log('\n--------------------------------');
    console.log('Account Management System');
    console.log('--------------------------------\n');

    while (this.running) {
      try {
        const choice = await this.displayMenu();

        switch (choice) {
          case 1:
            // View Balance - equivalent to CALL 'Operations' USING 'TOTAL '
            await this.operations.viewBalance();
            break;
          case 2:
            // Credit Account - equivalent to CALL 'Operations' USING 'CREDIT'
            await this.operations.creditAccount();
            break;
          case 3:
            // Debit Account - equivalent to CALL 'Operations' USING 'DEBIT '
            await this.operations.debitAccount();
            break;
          case 4:
            // Exit - equivalent to MOVE 'NO' TO CONTINUE-FLAG
            console.log('Exiting the program. Goodbye!');
            this.running = false;
            break;
          default:
            console.log('Invalid choice, please select 1-4.');
        }
        console.log('');
      } catch (error) {
        console.error('An error occurred:', error.message);
      }
    }

    process.exit(0);
  }
}

/**
 * Application entry point
 */
async function main() {
  const program = new MainProgram();
  await program.run();
}

// Start the application
main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
