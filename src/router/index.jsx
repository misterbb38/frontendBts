// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import DashboardShell from "../components/layout/DashboardShell";

// Pages d'authentification
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";

// Pages des projets
import ProjetsList from "../pages/projets/ProjetsList";
import ProjetForm from "../pages/projets/ProjetForm";

// Pages des ouvriers
import OuvriersList from "../pages/ouvriers/OuvriersList";

// Pages des matériaux
import MateriauxList from "../pages/materiaux/MateriauxList";

// Pages des tâches
import TachesList from "../pages/taches/TachesList";

// Pages des transactions
import TransactionsList from "../pages/transactions/TransactionsList";

// Pages des paiements
import PaiementsList from "../pages/paiements/PaiementsList";

// Pages des notifications
// import NotificationsList from "../pages/notifications/NotificationsList";

// Middleware de protection des routes
import { useAuth } from "../hooks/useAuth";

// Composant pour protéger les routes
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Chargement...
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  // Routes accessibles sans authentification
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // Routes protégées (nécessitent une authentification)
  {
    path: "/",
    element: <ProtectedRoute element={<DashboardShell />} />,
    children: [
      {
        index: true,
        element: <Navigate to="/projets" replace />,
      },

      // Routes des projets
      {
        path: "projets",
        children: [
          {
            index: true,
            element: <ProjetsList />,
          },
          {
            path: "new",
            element: <ProjetForm />,
          },
          {
            path: ":id",
            element: <ProjetForm />,
          },
        ],
      },

      // Routes des ouvriers
      {
        path: "ouvriers",
        element: <OuvriersList />,
      },

      // Routes des matériaux
      {
        path: "materiaux",
        element: <MateriauxList />,
      },

      // Routes des tâches
      {
        path: "taches",
        element: <TachesList />,
      },

      // Routes des transactions
      {
        path: "transactions",
        element: <TransactionsList />,
      },

      // Routes des paiements
      {
        path: "paiements",
        element: <PaiementsList />,
      },

      // Routes des notifications
      //   {
      //     path: "notifications",
      //     element: <NotificationsList />,
      //   },
    ],
  },

  // Route pour les pages non trouvées
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
