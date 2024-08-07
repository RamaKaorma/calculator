import { useEffect, useReducer } from 'react';
import DigitButton from './DigitButton';
import OperationButton from './OperationButton';
import './App.scss'

// Potential calculator actions
export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  CHOOSE_OPERATION: 'choose-operation',
  EVALUATE: 'evaluate'
}

// Initial number state
const initialState = {
  currentOperand: null,
  previousOperand: null,
  operation: null,
  overwrite: false
};

function reducer(state, { type, payload }) {
  switch (type) {
    // Add number to operation
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        }
      }
      // Handle useless operations
      if (payload.digit === "0" && state.currentOperand === "0") return state
      if (payload.digit === "." && state.currentOperand.includes(".")) return state
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`
      }

    // Set operation
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }

      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }

      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null
        }
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null
      }

    // Clearing & deletion
    case ACTIONS.CLEAR:
      return initialState;

    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null
        }
      }
      if (state.currentOperand == null) return state
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null }
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }

    // Operation results
    case ACTIONS.EVALUATE:
      if (state.operation == null
        || state.currentOperand == null
        || state.previousOperand == null
      ) {
        return state;
      }

      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state)
      }

    default:
      return state;
  }
}

// Evaluation logic, the calculations
function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)

  if (isNaN(prev) || isNaN(current)) return ""
  let computation = ""
  switch (operation) {
    case "*":
      computation = prev * current
      break
    case "+":
      computation = prev + current
      break
    case "-":
      computation = prev - current
      break
    case "÷":
      computation = prev / current
      break
    default:
      return ""
  }

  return computation.toString()
}

// Display numbers with commas to beautify display
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
})

function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split('.')
  if (decimal == null) return INTEGER_FORMATTER.format(integer)

  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(reducer, initialState);

  // Handle keyboard keypresses
  useEffect(() => {
    const keyDownHandler = event => {
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'].includes(event.key)) {
        event.preventDefault();
        dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: event.key } })
      }
      else if (event.key === '=' || event.key === 'Enter') {
        event.preventDefault();
        dispatch({ type: ACTIONS.EVALUATE });
      }
      else if (['*', '+', '-'].includes(event.key)) {
        console.log('in');
        event.preventDefault();
        dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: event.key } })
      }
      else if (event.key === '/') {
        event.preventDefault();
        dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: '÷' } })
      }
      else if (event.key === 'c' || event.key === 'C') {
        event.preventDefault();
        dispatch({ type: ACTIONS.CLEAR})
      }
      else if (event.key === 'Backspace') {
        event.preventDefault();
        dispatch({ type: ACTIONS.DELETE_DIGIT})
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [dispatch]);

  return (
    <>
      <h1>Try using your keyboard!</h1>
      <div className='calculator-grid'>
        <div className='output'>
          <div className='previous-operand'>{formatOperand(previousOperand)} {operation}</div>
          <div className='current-operand'>{formatOperand(currentOperand)}</div>
        </div>

        <button className='span-two' onClick={() => dispatch({ type: ACTIONS.CLEAR })}>AC</button>
        <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>←</button>
        <OperationButton operation="÷" dispatch={dispatch} />

        <DigitButton digit="1" dispatch={dispatch} />
        <DigitButton digit="2" dispatch={dispatch} />
        <DigitButton digit="3" dispatch={dispatch} />
        <OperationButton operation="*" dispatch={dispatch} />

        <DigitButton digit="4" dispatch={dispatch} />
        <DigitButton digit="5" dispatch={dispatch} />
        <DigitButton digit="6" dispatch={dispatch} />
        <OperationButton operation="+" dispatch={dispatch} />

        <DigitButton digit="7" dispatch={dispatch} />
        <DigitButton digit="8" dispatch={dispatch} />
        <DigitButton digit="9" dispatch={dispatch} />
        <OperationButton operation="-" dispatch={dispatch} />

        <DigitButton digit="." dispatch={dispatch} />
        <DigitButton digit="0" dispatch={dispatch} />
        <button className='span-two' onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>=</button>

      </div>
    </>
  )
}

export default App