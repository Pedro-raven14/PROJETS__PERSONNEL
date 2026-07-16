import { BrowserRouter } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import Container from './Components/Container';

function App() {
  return (
    <BrowserRouter>
      <BudgetProvider>
        <Container />
      </BudgetProvider>
    </BrowserRouter>
  );
}

export default App;
