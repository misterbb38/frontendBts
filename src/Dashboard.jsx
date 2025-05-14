import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Briefcase,
  Users,
  Package,
  Banknote,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import api from "./api";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    projets: { total: 0, enCours: 0 },
    ouvriers: { total: 0, disponibles: 0 },
    materiaux: { total: 0, faibleStock: 0 },
    finances: { revenus: 0, depenses: 0, solde: 0 },
  });

  const [projetsData, setProjetsData] = useState([]);
  const [materiauxData, setMateriauxData] = useState([]);
  const [financesData, setFinancesData] = useState([]);

  // Couleurs pour les graphiques
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Dans une application réelle, ces appels d'API seraient remplacés par vos endpoints réels
        const projetsPromise = api.get("/projets");
        const ouvriersPromise = api.get("/ouvriers");
        const materiauxPromise = api.get("/materiaux");
        const transactionsPromise = api.get("/transactions");

        const [projets, ouvriers, materiaux, transactions] = await Promise.all([
          projetsPromise,
          ouvriersPromise,
          materiauxPromise,
          transactionsPromise,
        ]);

        // Calculer les statistiques
        const projetsEnCours = projets.filter(
          (p) => p.statut === "en_cours"
        ).length;
        const ouvriersDisponibles = ouvriers.filter((o) => o.disponible).length;
        const materiauxFaibleStock = materiaux.filter(
          (m) => m.quantiteStock < m.quantiteMinimum
        ).length;

        const revenus = transactions
          .filter((t) => t.type === "entree")
          .reduce((sum, t) => sum + t.montant, 0);

        const depenses = transactions
          .filter((t) => t.type === "sortie")
          .reduce((sum, t) => sum + t.montant, 0);

        setStats({
          projets: { total: projets.length, enCours: projetsEnCours },
          ouvriers: {
            total: ouvriers.length,
            disponibles: ouvriersDisponibles,
          },
          materiaux: {
            total: materiaux.length,
            faibleStock: materiauxFaibleStock,
          },
          finances: { revenus, depenses, solde: revenus - depenses },
        });

        // Préparer les données pour les graphiques
        prepareProjetsData(projets);
        prepareMateriauxData(materiaux);
        prepareFinancesData(transactions);
      } catch (err) {
        console.error(
          "Erreur lors du chargement des données du dashboard:",
          err
        );
        setError("Impossible de charger les données du tableau de bord");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Préparation des données pour les graphiques
  const prepareProjetsData = (projets) => {
    const statusCounts = projets.reduce((acc, projet) => {
      acc[projet.statut] = (acc[projet.statut] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(statusCounts).map(([statut, count]) => ({
      statut: formatStatut(statut),
      count,
    }));

    setProjetsData(data);
  };

  const prepareMateriauxData = (materiaux) => {
    // Grouper par catégorie pour le graphique en camembert
    const categoryCounts = materiaux.reduce((acc, mat) => {
      acc[mat.categorie] = (acc[mat.categorie] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(categoryCounts)
      .map(([categorie, count]) => ({
        categorie: formatCategorie(categorie),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 catégories

    setMateriauxData(data);
  };

  const prepareFinancesData = (transactions) => {
    // Grouper par mois pour les tendances
    const monthlyData = transactions.reduce((acc, trans) => {
      const date = new Date(trans.date);
      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!acc[month]) {
        acc[month] = { month, revenus: 0, depenses: 0 };
      }

      if (trans.type === "entree") {
        acc[month].revenus += trans.montant;
      } else {
        acc[month].depenses += trans.montant;
      }

      return acc;
    }, {});

    // Convertir en tableau et trier par date
    const data = Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    setFinancesData(data);
  };

  // Formatage
  const formatStatut = (statut) => {
    const formats = {
      planifie: "Planifié",
      en_cours: "En cours",
      en_pause: "En pause",
      termine: "Terminé",
      annule: "Annulé",
    };
    return formats[statut] || statut;
  };

  const formatCategorie = (categorie) => {
    return categorie
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="loader h-12 w-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erreur lors du chargement des données
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Briefcase size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Projets</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold">{stats.projets.total}</p>
                <p className="ml-2 text-sm text-gray-500">
                  ({stats.projets.enCours} en cours)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ouvriers</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold">{stats.ouvriers.total}</p>
                <p className="ml-2 text-sm text-gray-500">
                  ({stats.ouvriers.disponibles} disponibles)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Package size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Matériaux</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold">
                  {stats.materiaux.total}
                </p>
                <p className="ml-2 text-sm text-gray-500">
                  ({stats.materiaux.faibleStock} en faible stock)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Banknote size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Finances</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold">
                  {formatCurrency(stats.finances.solde)}
                </p>
                <p className="ml-2 text-sm text-gray-500">(solde)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des projets */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">État des Projets</h3>
          </div>
          <div className="p-4" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projetsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="statut" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Nombre de projets" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique des matériaux */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Matériaux par Catégorie</h3>
          </div>
          <div className="p-4" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materiauxData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="categorie"
                  label={({ categorie, percent }) =>
                    `${categorie}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {materiauxData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique des finances */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="text-lg font-medium">Tendances Financières</h3>
          </div>
          <div className="p-4" style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={financesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenus"
                  name="Revenus"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="depenses"
                  name="Dépenses"
                  stroke="#ef4444"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dernières activités et alertes pourraient être ajoutées ici */}
    </div>
  );
};

export default Dashboard;
