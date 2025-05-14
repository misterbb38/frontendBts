import { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./authContext";
import Layout from "./Layout";
import Login from "./Login";
import Dashboard from "./Dashboard";

// Pages
import Materiaux from "./pages/Materiaux";
import Projets from "./pages/Projets";
import Taches from "./pages/Taches";
import Ouvriers from "./pages/Ouvriers";
import Paiements from "./pages/Paiements";
import Transactions from "./pages/Transactions";
import Notifications from "./pages/Notifications";

// Route privée avec redirection vers login si non authentifié
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="materiaux" element={<Materiaux />} />
        <Route path="projets" element={<Projets />} />
        <Route path="taches" element={<Taches />} />
        <Route path="ouvriers" element={<Ouvriers />} />
        <Route path="paiements" element={<Paiements />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
