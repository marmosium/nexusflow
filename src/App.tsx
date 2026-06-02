import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainHomePage from "./pages/MainHomePage";
import StokPage from "./modules/stok/pages/StokPage";
import OperatorPage from "./modules/stok/pages/OperatorPage";
import KidemliOperatorPage from "./modules/stok/pages/KidemliOperatorPage";
import BirimAmiriPage from "./modules/stok/pages/BirimAmiriPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { StokProvider } from "./modules/stok/context/StokContext";

function App() {
  return (
    <StokProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stok"
          element={
            <ProtectedRoute>
              <StokPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stok/operator"
          element={
            <ProtectedRoute>
              <OperatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stok/kidemli-operator"
          element={
            <ProtectedRoute>
              <KidemliOperatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stok/birim-amiri"
          element={
            <ProtectedRoute>
              <BirimAmiriPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </StokProvider>
  );
}

export default App;
