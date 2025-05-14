import { useState, useEffect } from "react";
import {
  Banknote,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import api from "../api";
import ResourceTable from "../ResourceTable";
import ResourceForm from "../ResourceForm";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [projets, setProjets] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtres, setFiltres] = useState({
    type: "",
    projet: "",
    categorie: "",
    periode: "",
  });

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [transactionsData, projetsData, usersData] = await Promise.all([
          api.get("/transactions"),
          api.get("/projets"),
          api.get("/users"),
        ]);

        setTransactions(transactionsData);
        setProjets(projetsData);
        setUsers(usersData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          "Impossible de charger les transactions. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Ajouter une nouvelle transaction
  const handleAddTransaction = () => {
    setCurrentTransaction(null);
    setShowForm(true);
  };

  // Éditer une transaction
  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setShowForm(true);
  };

  // Supprimer une transaction
  const handleDeleteTransaction = async (transaction) => {
    if (
      !window.confirm(`Êtes-vous sûr de vouloir supprimer cette transaction ?`)
    ) {
      return;
    }

    try {
      await api.delete(`/transactions/${transaction._id}`);

      // Recharger la liste
      const newTransactions = await api.get("/transactions");
      setTransactions(newTransactions);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Impossible de supprimer cette transaction.");
    }
  };

  // Soumettre le formulaire (création ou édition)
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (currentTransaction) {
        // Mise à jour
        await api.put(`/transactions/${currentTransaction._id}`, formData);
      } else {
        // Création
        await api.post("/transactions", formData);
      }

      // Recharger la liste
      const newTransactions = await api.get("/transactions");
      setTransactions(newTransactions);
      setShowForm(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(
        "Impossible de sauvegarder la transaction. Veuillez vérifier les données."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mise à jour des filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltres((prev) => ({ ...prev, [name]: value }));
  };

  // Réinitialiser les filtres
  const resetFiltres = () => {
    setFiltres({
      type: "",
      projet: "",
      categorie: "",
      periode: "",
    });
  };

  // Filtrer les transactions
  const transactionsFiltrees = transactions.filter((transaction) => {
    if (filtres.type && transaction.type !== filtres.type) return false;
    if (filtres.projet && transaction.projet !== filtres.projet) return false;
    if (filtres.categorie && transaction.categorie !== filtres.categorie)
      return false;
    if (filtres.periode) {
      const date = new Date(transaction.date);
      const moisAnnee = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (moisAnnee !== filtres.periode) return false;
    }
    return true;
  });

  // Générer la liste des périodes disponibles
  const getPeriodesDisponibles = () => {
    const periodes = new Set();

    transactions.forEach((transaction) => {
      if (transaction.date) {
        const date = new Date(transaction.date);
        const moisAnnee = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        periodes.add(moisAnnee);
      }
    });

    return Array.from(periodes)
      .sort()
      .map((moisAnnee) => {
        const [annee, mois] = moisAnnee.split("-");
        const nomMois = new Date(
          annee,
          parseInt(mois) - 1,
          1
        ).toLocaleDateString("fr-FR", { month: "long" });
        return {
          value: moisAnnee,
          label: `${nomMois} ${annee}`,
        };
      });
  };

  // Catégories de transactions
  const categoriesTransaction = [
    { value: "paiement_client", label: "Paiement client" },
    { value: "achat_materiaux", label: "Achat matériaux" },
    { value: "salaire_ouvriers", label: "Salaire ouvriers" },
    { value: "salaire_personnel", label: "Salaire personnel" },
    { value: "logement_ouvriers", label: "Logement ouvriers" },
    { value: "gardiennage", label: "Gardiennage" },
    { value: "transport", label: "Transport" },
    { value: "location_materiel", label: "Location matériel" },
    { value: "divers", label: "Divers" },
  ];

  // Définition des colonnes du tableau
  const fields = [
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.type === "entree"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.type === "entree" ? "Entrée" : "Sortie"}
        </span>
      ),
    },
    {
      key: "montant",
      label: "Montant",
      sortable: true,
      render: (item) => formatCurrency(item.montant),
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (item) => formatDate(item.date),
    },
    {
      key: "categorie",
      label: "Catégorie",
      sortable: true,
      render: (item) => formatCategorie(item.categorie),
    },
    {
      key: "projet",
      label: "Projet",
      sortable: true,
      render: (item) => {
        const projet = projets.find((p) => p._id === item.projet);
        return projet ? projet.nom : "N/A";
      },
    },
    { key: "description", label: "Description", sortable: false },
    { key: "referencePiece", label: "Référence", sortable: true },
    {
      key: "modePaiement",
      label: "Mode",
      sortable: true,
      render: (item) => formatModePaiement(item.modePaiement),
    },
    {
      key: "effectuePar",
      label: "Effectué par",
      sortable: false,
      render: (item) => {
        const user = users.find((u) => u._id === item.effectuePar);
        return user ? `${user.prenom} ${user.nom}` : "N/A";
      },
    },
  ];

  // Schéma du formulaire d'ajout/édition de transaction
  const transactionSchema = [
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      options: [
        { value: "entree", label: "Entrée" },
        { value: "sortie", label: "Sortie" },
      ],
    },
    { name: "montant", label: "Montant (XOF)", type: "number", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    {
      name: "categorie",
      label: "Catégorie",
      type: "select",
      required: true,
      options: categoriesTransaction,
    },
    {
      name: "projet",
      label: "Projet",
      type: "select",
      required: true,
      options: projets.map((p) => ({
        value: p._id,
        label: p.nom,
      })),
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
    { name: "referencePiece", label: "Référence de pièce", type: "text" },
    {
      name: "modePaiement",
      label: "Mode de paiement",
      type: "select",
      required: true,
      options: [
        { value: "espece", label: "Espèce" },
        { value: "cheque", label: "Chèque" },
        { value: "virement", label: "Virement" },
        { value: "mobile_money", label: "Mobile Money" },
      ],
    },
    { name: "beneficiaire", label: "Bénéficiaire", type: "text" },
    {
      name: "effectuePar",
      label: "Effectué par",
      type: "select",
      required: true,
      options: users.map((u) => ({
        value: u._id,
        label: `${u.prenom} ${u.nom}`,
      })),
    },
  ];

  // Fonctions utilitaires de formatage
  const formatCategorie = (categorie) => {
    const format = categoriesTransaction.find((cat) => cat.value === categorie);
    return format ? format.label : categorie;
  };

  const formatModePaiement = (mode) => {
    const formats = {
      espece: "Espèce",
      cheque: "Chèque",
      virement: "Virement",
      mobile_money: "Mobile Money",
    };
    return formats[mode] || mode;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 XOF";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calcul des statistiques
  const totalEntrees = transactions
    .filter((t) => t.type === "entree")
    .reduce((sum, t) => sum + (t.montant || 0), 0);

  const totalSorties = transactions
    .filter((t) => t.type === "sortie")
    .reduce((sum, t) => sum + (t.montant || 0), 0);

  const solde = totalEntrees - totalSorties;

  // Calcul des statistiques par catégorie
  const statsCategoriesSorties = transactions
    .filter((t) => t.type === "sortie")
    .reduce((acc, t) => {
      if (!acc[t.categorie]) {
        acc[t.categorie] = 0;
      }
      acc[t.categorie] += t.montant || 0;
      return acc;
    }, {});

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Banknote className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Transactions
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Une erreur est survenue
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Total entrées
              </h2>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totalEntrees)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Total sorties
              </h2>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(totalSorties)}
              </p>
            </div>
            <TrendingDown className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">Solde</h2>
              <p
                className={`text-3xl font-bold ${
                  solde >= 0 ? "text-blue-600" : "text-red-600"
                }`}
              >
                {formatCurrency(solde)}
              </p>
            </div>
            <DollarSign
              className={`h-12 w-12 ${
                solde >= 0 ? "text-blue-500" : "text-red-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Ventilation par catégorie */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Répartition des dépenses par catégorie
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statsCategoriesSorties).map(
              ([categorie, montant]) => (
                <div key={categorie} className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      {formatCategorie(categorie)}
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatCurrency(montant)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${(montant / totalSorties) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              value={filtres.type}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Tous les types</option>
              <option value="entree">Entrées</option>
              <option value="sortie">Sorties</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="projet"
              className="block text-sm font-medium text-gray-700"
            >
              Projet
            </label>
            <select
              id="projet"
              name="projet"
              value={filtres.projet}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Tous les projets</option>
              {projets.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="categorie"
              className="block text-sm font-medium text-gray-700"
            >
              Catégorie
            </label>
            <select
              id="categorie"
              name="categorie"
              value={filtres.categorie}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Toutes les catégories</option>
              {categoriesTransaction.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="periode"
              className="block text-sm font-medium text-gray-700"
            >
              Période
            </label>
            <select
              id="periode"
              name="periode"
              value={filtres.periode}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Toutes les périodes</option>
              {getPeriodesDisponibles().map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFiltres}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <ResourceTable
        title="Liste des transactions"
        fields={fields}
        data={transactionsFiltrees}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onAdd={handleAddTransaction}
        isLoading={isLoading}
        noDataMessage="Aucune transaction enregistrée"
      />

      {/* Formulaire d'ajout/édition de transaction */}
      <ResourceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          currentTransaction
            ? "Modifier la transaction"
            : "Ajouter une transaction"
        }
        schema={transactionSchema}
        initialData={
          currentTransaction || {
            date: new Date().toISOString().split("T")[0],
            type: "entree",
          }
        }
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Transactions;
