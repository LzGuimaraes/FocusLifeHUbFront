import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { PrivateRoute } from "./auth/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Financas from "./pages/Financas";
import Contas from "./pages/Contas";
import Tarefas from "./pages/Tarefas";
import Materias from "./pages/Materias"; 
import Metas from "./pages/Metas"; 

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota raiz - redireciona para dashboard ou login */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Rotas Públicas */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Rotas Privadas - Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Rotas Privadas - Finanças */}
          <Route
            path="/financas"
            element={
              <PrivateRoute>
                <Financas />
              </PrivateRoute>
            }
          />

          {/* Rotas Privadas - Contas */}
          <Route
            path="/contas"
            element={
              <PrivateRoute>
                <Contas />
              </PrivateRoute>
            }
          />

          {/* Rotas Privadas - Tarefas */}
          <Route
            path="/tarefas"
            element={
              <PrivateRoute>
                <Tarefas />
              </PrivateRoute>
            }
          />

          {/* Rotas Privadas - Matérias */}
          <Route
            path="/materias"
            element={
              <PrivateRoute>
                {/* <Materias /> */}
                <Materias />
              </PrivateRoute>
            }
          />

          {/* Rotas Privadas - Metas */}
          <Route
            path="/metas"
            element={
              <PrivateRoute>
                <Metas /> 
              </PrivateRoute>
            }
          />

          {/* Rota 404 - Redireciona para dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}