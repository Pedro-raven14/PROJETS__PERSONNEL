import { BrowserRouter } from "react-router-dom";
import { BlogProvider } from "./context/BlogContext";
import Container from "./Components/Container";

function App() {
  return (
    <BrowserRouter>
      <BlogProvider>
        <Container />
      </BlogProvider>
    </BrowserRouter>
  );
}

export default App;
