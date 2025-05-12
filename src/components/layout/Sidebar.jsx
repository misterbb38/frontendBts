// src/components/layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/projets", label: "Projets", icon: "clipboard" },
    { path: "/ouvriers", label: "Ouvriers", icon: "users" },
    { path: "/materiaux", label: "Matériaux", icon: "package" },
    { path: "/paiements", label: "Paiements", icon: "dollar-sign" },
    { path: "/taches", label: "Tâches", icon: "check-square" },
    { path: "/transactions", label: "Transactions", icon: "repeat" },
    { path: "/notifications", label: "Notifications", icon: "bell" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 fixed">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Chantier Dashboard</h1>
      </div>

      <div className="mb-6">
        <div className="p-4 bg-gray-700 rounded-lg flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-500 rounded-full mb-2 flex items-center justify-center">
            <span className="text-xl font-bold">
              {user?.prenom?.[0]}
              {user?.nom?.[0]}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`
            }
          >
            <span className="mr-3">
              <i className={`lucide-${item.icon}`}></i>
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <span className="mr-3">
            <i className="lucide-log-out"></i>
          </span>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
