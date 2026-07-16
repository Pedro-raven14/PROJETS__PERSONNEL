import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./Components/ui/Toast";
import Container from "./Components/Container";
import { initializeStorage } from "./utils/localStorage";

// Initialisation des données de démo au premier lancement
initializeStorage();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Container />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
