import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./Components/ui/Toast";
import Container from "./Components/Container";

// Plus besoin d'initialiser le localStorage — les données viennent du backend

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
