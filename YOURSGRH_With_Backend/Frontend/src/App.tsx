import { BrowserRouter } from 'react-router-dom';
import Container from './Container';
import { NotifProvider } from './hooks/NotifProvider';
import { CongesProvider } from './hooks/CongesProvider';

function App() {
  return (
    <BrowserRouter>
      <NotifProvider>
        <CongesProvider>
          <Container />
        </CongesProvider>
      </NotifProvider>
    </BrowserRouter>
  );
}

export default App;
