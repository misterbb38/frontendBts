import { useState, useEffect } from "react";
import { Users, AlertCircle, User, CreditCard, Briefcase } from "lucide-react";
import api from "../api";
import ResourceTable from "../ResourceTable";
import ResourceForm from "../ResourceForm";

const Ouvriers = () => {
  const [ouvriers, setOuvriers] = useState([]);
  const [projets, setProjets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentOuvrier, setCurrentOuvrier] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaiementForm, setShowPaiementForm] = useState(false);
  const [currentOuvrierPaiement, setCurrentOuvrierPaiement] = useState(null);

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [ouvriersData, projetsData] = await Promise.all([
          api.get("/ouvriers"),
          api.get("/projets"),
        ]);

        setOuvriers(ouvriersData);
        setProjets(projetsData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          "Impossible de charger les ouvriers. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Ajouter un nouvel ouvrier
  const handleAddOuvrier = () => {
    setCurrentOuvrier(null);
    setShowForm(true);
  };

  // Éditer un ouvrier
  const handleEditOuvrier = (ouvrier) => {
    setCurrentOuvrier(ouvrier);
    setShowForm(true);
  };

  // Supprimer un ouvrier
  const handleDeleteOuvrier = async (ouvrier) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'ouvrier ${ouvrier.prenom} ${ouvrier.nom} ?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/ouvriers/${ouvrier._id}`);

      // Recharger la liste
      const newOuvriers = await api.get("/ouvriers");
      setOuvriers(newOuvriers);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Impossible de supprimer cet ouvrier.");
    }
  };

  // Ouvrir le formulaire de paiement
  const handleAddPaiement = (ouvrier) => {
    setCurrentOuvrierPaiement(ouvrier);
    setShowPaiementForm(true);
  };

  // Soumettre le formulaire (création ou édition)
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (currentOuvrier) {
        // Mise à jour
        await api.put(`/ouvriers/${currentOuvrier._id}`, formData);
      } else {
        // Création
        await api.post("/ouvriers", formData);
      }

      // Recharger la liste
      const newOuvriers = await api.get("/ouvriers");
      setOuvriers(newOuvriers);
      setShowForm(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(
        "Impossible de sauvegarder l'ouvrier. Veuillez vérifier les données."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumettre un paiement
  const handleSubmitPaiement = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Préparer les données pour l'API
      const paiementData = {
        ...formData,
        ouvrier: currentOuvrierPaiement._id,
        tauxJournalier: currentOuvrierPaiement.tauxJournalier,
      };

      await api.post("/paiements", paiementData);
      setShowPaiementForm(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout du paiement:", err);
      setError("Impossible d'ajouter le paiement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Définition des colonnes du tableau
  const fields = [
    {
      key: "nom_complet",
      label: "Nom",
      sortable: true,
      render: (item) => `${item.prenom} ${item.nom}`,
    },
    {
      key: "metier",
      label: "Métier",
      sortable: true,
      render: (item) => formatMetier(item.metier),
    },
    { key: "telephone", label: "Téléphone", sortable: true },
    {
      key: "tauxJournalier",
      label: "Taux journalier",
      sortable: true,
      render: (item) => formatCurrency(item.tauxJournalier),
    },
    {
      key: "disponible",
      label: "Disponibilité",
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.disponible
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.disponible ? "Disponible" : "Occupé"}
        </span>
      ),
    },
    {
      key: "projetsActuels",
      label: "Projets",
      sortable: false,
      render: (item) => {
        const ouvrierProjets = projets.filter((p) =>
          item.projetsActuels?.includes(p._id)
        );
        return ouvrierProjets.length ? (
          <span className="text-blue-600">
            {ouvrierProjets.length} projet(s)
          </span>
        ) : (
          "Aucun"
        );
      },
    },
    {
      key: "dateEmbauche",
      label: "Date d'embauche",
      sortable: true,
      render: (item) => formatDate(item.dateEmbauche),
    },
    {
      key: "paiement",
      label: "Paiement",
      sortable: false,
      render: (item) => (
        <button
          onClick={() => handleAddPaiement(item)}
          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none"
        >
          <CreditCard className="h-4 w-4 mr-1" />
          Payer
        </button>
      ),
    },
  ];

  // Schéma du formulaire d'ajout/édition d'ouvrier
  const ouvrierSchema = [
    { name: "nom", label: "Nom", type: "text", required: true },
    { name: "prenom", label: "Prénom", type: "text", required: true },
    {
      name: "metier",
      label: "Métier",
      type: "select",
      required: true,
      options: [
        { value: "macon", label: "Maçon" },
        { value: "manoeuvre", label: "Manœuvre" },
        { value: "coffreur", label: "Coffreur" },
        { value: "ferrailleur", label: "Ferrailleur" },
        { value: "electricien", label: "Électricien" },
        { value: "plombier", label: "Plombier" },
        { value: "peintre", label: "Peintre" },
        { value: "carreleur", label: "Carreleur" },
        { value: "platrier", label: "Plâtrier" },
        { value: "menuisier_alu", label: "Menuisier Aluminium" },
        { value: "menuisier_bois", label: "Menuisier Bois" },
        { value: "menuisier_metallique", label: "Menuisier Métallique" },
      ],
    },
    { name: "telephone", label: "Téléphone", type: "text", required: true },
    {
      name: "tauxJournalier",
      label: "Taux journalier (XOF)",
      type: "number",
      required: true,
    },
    { name: "disponible", label: "Disponible", type: "checkbox" },
    {
      name: "competences",
      label: "Compétences (séparées par virgules)",
      type: "text",
    },
    {
      name: "dateEmbauche",
      label: "Date d'embauche",
      type: "date",
      required: true,
    },
  ];

  // Schéma du formulaire de paiement
  const paiementSchema = [
    {
      name: "projet",
      label: "Projet",
      type: "select",
      required: true,
      options: projets
        .filter((p) => p.statut !== "annule" && p.statut !== "termine")
        .map((p) => ({ value: p._id, label: p.nom })),
    },
    { name: "montant", label: "Montant (XOF)", type: "number", required: true },
    {
      name: "datePaiement",
      label: "Date de paiement",
      type: "date",
      required: true,
    },
    {
      name: "periode.debut",
      label: "Début de période",
      type: "date",
      required: true,
    },
    {
      name: "periode.fin",
      label: "Fin de période",
      type: "date",
      required: true,
    },
    {
      name: "nombreJours",
      label: "Nombre de jours",
      type: "number",
      required: true,
    },
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
    { name: "reference", label: "Référence du paiement", type: "text" },
    {
      name: "statut",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { value: "en_attente", label: "En attente" },
        { value: "complete", label: "Complété" },
        { value: "annule", label: "Annulé" },
      ],
    },
    { name: "commentaire", label: "Commentaire", type: "textarea" },
  ];

  // Fonctions utilitaires de formatage
  const formatMetier = (metier) => {
    const formats = {
      macon: "Maçon",
      manoeuvre: "Manœuvre",
      coffreur: "Coffreur",
      ferrailleur: "Ferrailleur",
      electricien: "Électricien",
      plombier: "Plombier",
      peintre: "Peintre",
      carreleur: "Carreleur",
      platrier: "Plâtrier",
      menuisier_alu: "Menuisier Aluminium",
      menuisier_bois: "Menuisier Bois",
      menuisier_metallique: "Menuisier Métallique",
    };
    return formats[metier] || metier;
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

  // Statistiques des métiers
  const metierStats = ouvriers.reduce((acc, ouvrier) => {
    const metier = ouvrier.metier;
    if (!acc[metier]) {
      acc[metier] = 0;
    }
    acc[metier]++;
    return acc;
  }, {});

  const metierStatsArray = Object.entries(metierStats)
    .map(([metier, count]) => ({
      metier: formatMetier(metier),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Ouvriers
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
                Total Ouvriers
              </h2>
              <p className="text-3xl font-bold text-gray-800">
                {ouvriers.length}
              </p>
            </div>
            <Users className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">Disponibles</h2>
              <p className="text-3xl font-bold text-gray-800">
                {ouvriers.filter((o) => o.disponible).length}
              </p>
            </div>
            <User className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">Taux moyen</h2>
              <p className="text-3xl font-bold text-gray-800">
                {formatCurrency(
                  ouvriers.length > 0
                    ? ouvriers.reduce((sum, o) => sum + o.tauxJournalier, 0) /
                        ouvriers.length
                    : 0
                )}
              </p>
            </div>
            <CreditCard className="h-12 w-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Répartition par métier */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Répartition par métier
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {metierStatsArray.map(({ metier, count }) => (
              <div key={metier} className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${(count / ouvriers.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {metier} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ResourceTable
        title="Liste des ouvriers"
        fields={fields}
        data={ouvriers}
        onEdit={handleEditOuvrier}
        onDelete={handleDeleteOuvrier}
        onAdd={handleAddOuvrier}
        isLoading={isLoading}
        noDataMessage="Aucun ouvrier enregistré"
      />

      {/* Formulaire d'ajout/édition d'ouvrier */}
      <ResourceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          currentOuvrier
            ? `Modifier ${currentOuvrier.prenom} ${currentOuvrier.nom}`
            : "Ajouter un ouvrier"
        }
        schema={ouvrierSchema}
        initialData={currentOuvrier}
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />

      {/* Formulaire de paiement */}
      <ResourceForm
        isOpen={showPaiementForm}
        onClose={() => setShowPaiementForm(false)}
        title={`Paiement pour ${currentOuvrierPaiement?.prenom} ${currentOuvrierPaiement?.nom}`}
        schema={paiementSchema}
        initialData={{
          datePaiement: new Date().toISOString().split("T")[0],
          tauxJournalier: currentOuvrierPaiement?.tauxJournalier,
          statut: "en_attente",
        }}
        onSubmit={handleSubmitPaiement}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Ouvriers;
