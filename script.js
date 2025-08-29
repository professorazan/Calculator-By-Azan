/*
    The functional core of the calculator.
    This script manages the application state and performs calculations
    with a custom module to ensure absolute accuracy.
*/

// --- The Custom Math Service for Accurate Arithmetic ---
// This module circumvents JavaScript's floating-point inaccuracies
const mathService = {
    // Helper function to get the number of decimal places
    getDecimalLength: function(num) {
        const str = num.toString();
        const decimalIndex = str.indexOf('.');
        return decimalIndex!== -1? str.length - decimalIndex - 1 : 0;
    },

    // Helper function to convert to integer based on decimal length
    toInteger: function(num, decimalLength) {
        return Number(num.toString().replace('.', '')) * Math.pow(10, decimalLength - this.getDecimalLength(num));
    },

    // Addition function
    add: function(a, b) {
        const decimalLengthA = this.getDecimalLength(a);
        const decimalLengthB = this.getDecimalLength(b);
        const maxDecimalLength = Math.max(decimalLengthA, decimalLengthB);
        
        const intA = this.toInteger(a, maxDecimalLength);
        const intB = this.toInteger(b, maxDecimalLength);
        
        return (intA + intB) / Math.pow(10, maxDecimalLength);
    },

    // Subtraction function
    sub: function(a, b) {
        const decimalLengthA = this.getDecimalLength(a);
        const decimalLengthB = this.getDecimalLength(b);
        const maxDecimalLength = Math.max(decimalLengthA, decimalLengthB);
        
        const intA = this.toInteger(a, maxDecimalLength);
        const intB = this.toInteger(b, maxDecimalLength);
        
        return (intA - intB) / Math.pow(10, maxDecimalLength);
    },

    // Multiplication function
    mul: function(a, b) {
        const strA = a.toString();
        const strB = b.toString();
        const decimalLength = this.getDecimalLength(a) + this.getDecimalLength(b);
        
        const intA = Number(strA.replace('.', ''));
        const intB = Number(strB.replace('.', ''));
        
        return (intA * intB) / Math.pow(10, decimalLength);
    },

    // Division function
    div: function(a, b) {
        const decimalLengthA = this.getDecimalLength(a);
        const decimalLengthB = this.getDecimalLength(b);
        
        const intA = Number(a.toString().replace('.', ''));
        const intB = Number(b.toString().replace('.', ''));
        
        const result = intA / intB;
        return this.mul(result, Math.pow(10, decimalLengthB - decimalLengthA));
    }
};

// --- Calculator State and Event Handlers ---
const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
};

// DOM elements
const display = document.getElementById('display');
const keys = document.querySelector('.calculator__keys');

// Update the display with the current displayValue
function updateDisplay() {
    display.textContent = calculator.displayValue;
}

// Handle number and decimal input
function inputDigit(digit) {
    const { displayValue, waitingForSecondOperand } = calculator;

    if (waitingForSecondOperand) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        calculator.displayValue = displayValue === '0'? digit : displayValue + digit;
    }
}

function inputDecimal(dot) {
    if (calculator.waitingForSecondOperand) {
        calculator.displayValue = '0.';
        calculator.waitingForSecondOperand = false;
        return;
    }

    if (!calculator.displayValue.includes(dot)) {
        calculator.displayValue += dot;
    }
}

// Perform the calculation based on the current state
function calculate() {
    const { firstOperand, displayValue, operator } = calculator;
    
    // Check if a calculation can be performed
    if (firstOperand === null |

| operator === null) {
        return;
    }

    const inputValue = Number(displayValue);
    let result;

    switch (operator) {
        case 'add':
            result = mathService.add(firstOperand, inputValue);
            break;
        case 'subtract':
            result = mathService.sub(firstOperand, inputValue);
            break;
        case 'multiply':
            result = mathService.mul(firstOperand, inputValue);
            break;
        case 'divide':
            if (inputValue === 0) {
                result = 'Error';
            } else {
                result = mathService.div(firstOperand, inputValue);
            }
            break;
        default:
            return;
    }
    
    // Update the state with the result
    calculator.displayValue = String(result);
    calculator.firstOperand = result;
    calculator.operator = null;
    calculator.waitingForSecondOperand = false;
}

// Handle operator buttons
function handleOperator(nextOperator) {
    const { firstOperand, displayValue, operator } = calculator;
    const inputValue = Number(displayValue);

    // If there's already an operator and we're waiting for the second operand,
    // just update the operator and exit.
    if (operator && calculator.waitingForSecondOperand) {
        calculator.operator = nextOperator;
        return;
    }
    
    // Store the input value as the first operand
    if (firstOperand === null) {
        calculator.firstOperand = inputValue;
    } else if (operator) {
        // If an operator is already set, perform the pending calculation
        calculate();
    }
    
    // Set the new operator and flag that we are waiting for a new input
    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
}

// Reset the calculator's state
function resetCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    updateDisplay();
}

// Event listener for all button clicks via event delegation
keys.addEventListener('click', (event) => {
    const target = event.target;
    if (!target.matches('button')) {
        return;
    }

    const action = target.dataset.action;

    if (!isNaN(action)) {
        inputDigit(action);
        updateDisplay();
    } else {
        switch (action) {
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                handleOperator(action);
                break;
            case 'decimal':
                inputDecimal(target.textContent);
                updateDisplay();
                break;
            case 'clear':
                resetCalculator();
                break;
            case 'calculate':
                calculate();
                updateDisplay();
                break;
        }
    }
});

// Initial display update
updateDisplay();
