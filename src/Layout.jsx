import { Outlet } from "react-router-dom";
import { useState, useContext } from "react";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { AuthContext } from "./authContext";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar mobile */}
      <div
        className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-white lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in"
        }`}
      >
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-primary">
              BTP Manager
            </span>
          </div>
        </div>

        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-gray-200">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 focus:outline-none lg:hidden"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex mx-4 text-gray-600 focus:outline-none">
              <Bell size={24} />
            </button>

            <div className="relative">
              <button className="flex items-center text-gray-600 focus:outline-none">
                <div className="w-8 h-8 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="mx-2">
                  {user?.nom} {user?.prenom}
                </span>
              </button>

              <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg hidden">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white"
                >
                  Mon profil
                </a>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white"
                >
                  <LogOut size={16} className="mr-2" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
