import Container from "./Components/Container";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";

/*
  Ordre des Providers :
  1. BrowserRouter en premier (React Router doit envelopper tout)
  2. AuthProvider à l'intérieur (il utilise useNavigate via l'intercepteur Axios)
  
  Tous les composants enfants pourront utiliser :
  - useAuth() pour accéder au user, token, login, logout...
  - useNavigate() pour la navigation
*/
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Container />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
