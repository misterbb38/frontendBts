import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Package,
  ClipboardList,
  CreditCard,
  Banknote,
  Bell,
} from "lucide-react";

const Sidebar = ({ closeSidebar }) => {
  // Liste des éléments du menu
  const menuItems = [
    {
      path: "/",
      icon: <LayoutDashboard size={20} />,
      label: "Tableau de bord",
    },
    { path: "/projets", icon: <Briefcase size={20} />, label: "Projets" },
    { path: "/ouvriers", icon: <Users size={20} />, label: "Ouvriers" },
    { path: "/materiaux", icon: <Package size={20} />, label: "Matériaux" },
    { path: "/taches", icon: <ClipboardList size={20} />, label: "Tâches" },
    { path: "/paiements", icon: <CreditCard size={20} />, label: "Paiements" },
    {
      path: "/transactions",
      icon: <Banknote size={20} />,
      label: "Transactions",
    },
    {
      path: "/notifications",
      icon: <Bell size={20} />,
      label: "Notifications",
    },
  ];

  return (
    <nav className="mt-10">
      <div className="px-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => window.innerWidth < 1024 && closeSidebar()}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mt-2 text-gray-600 transition-colors duration-300 transform rounded-lg 
              ${isActive ? "bg-primary text-white" : "hover:bg-gray-100"}`
            }
          >
            {item.icon}
            <span className="mx-4 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;
