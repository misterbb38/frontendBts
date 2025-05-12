// src/components/layout/DashboardShell.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardShell = () => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    // Définir le titre de la page en fonction de l'URL
    const path = location.pathname.split("/")[1];
    if (path) {
      // Convertir la première lettre en majuscule
      const formattedTitle = path.charAt(0).toUpperCase() + path.slice(1);
      setPageTitle(formattedTitle);
    } else {
      setPageTitle("Dashboard");
    }
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar title={pageTitle} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
