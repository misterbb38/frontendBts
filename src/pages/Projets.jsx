import { useState, useEffect } from "react";
import { Briefcase, Calendar, AlertCircle, Users, Clock } from "lucide-react";
import api from "../api";
import ResourceTable from "../ResourceTable";
import ResourceForm from "../ResourceForm";

const Projets = () => {
  const [projets, setProjets] = useState([]);
  const [ouvriers, setOuvriers] = useState([]); // Ajout de l'état pour les ouvriers
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentProjet, setCurrentProjet] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRendezVousForm, setShowRendezVousForm] = useState(false);
  const [currentProjetRdv, setCurrentProjetRdv] = useState(null);

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Chargement parallèle des projets et des ouvriers
        const [projetsData, ouvriersData] = await Promise.all([
          api.get("/projets"),
          api.get("/ouvriers"),
        ]);

        setProjets(projetsData);
        setOuvriers(ouvriersData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          "Impossible de charger les données. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Récupérer la liste des projets
  const fetchProjets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get("/projets");
      setProjets(data);
    } catch (err) {
      console.error("Erreur lors du chargement des projets:", err);
      setError(
        "Impossible de charger les projets. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter un nouveau projet
  const handleAddProjet = () => {
    setCurrentProjet(null);
    setShowForm(true);
  };

  // Éditer un projet
  const handleEditProjet = (projet) => {
    // Préparer les données pour l'édition en formatant les dates
    const formattedProjet = {
      ...projet,
      dateDebut: projet.dateDebut
        ? new Date(projet.dateDebut).toISOString().split("T")[0]
        : "",
      dateFin: projet.dateFin
        ? new Date(projet.dateFin).toISOString().split("T")[0]
        : "",
      planning: {
        ...projet.planning,
        dateLivraison: projet.planning?.dateLivraison
          ? new Date(projet.planning.dateLivraison).toISOString().split("T")[0]
          : "",
      },
    };

    setCurrentProjet(formattedProjet);
    setShowForm(true);
  };

  // Supprimer un projet
  const handleDeleteProjet = async (projet) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer le projet "${projet.nom}" ?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/projets/${projet._id}`);
      await fetchProjets(); // Recharger la liste
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Impossible de supprimer ce projet.");
    }
  };

  // Préparer les données de formulaire avant soumission
  const prepareFormData = (formData) => {
    // Créer une copie des données pour ne pas modifier l'original
    const prepared = { ...formData };

    // Assurer que la structure budget existe
    if (!prepared.budget) {
      prepared.budget = {};
    }

    // Convertir les valeurs numériques
    if (prepared.budget.montantTotal) {
      prepared.budget.montantTotal = Number(prepared.budget.montantTotal);
    }

    if (prepared.budget.montantRecu) {
      prepared.budget.montantRecu = Number(prepared.budget.montantRecu);
    }

    if (prepared.budget.beneficePrevu) {
      prepared.budget.beneficePrevu = Number(prepared.budget.beneficePrevu);
    }

    // Assurer que la structure planning existe
    if (!prepared.planning) {
      prepared.planning = {};
    }

    // Convertir les valeurs numériques du planning
    if (prepared.planning.dureeExecution) {
      prepared.planning.dureeExecution = Number(
        prepared.planning.dureeExecution
      );
    }

    if (prepared.planning.nombreOuvriers) {
      prepared.planning.nombreOuvriers = Number(
        prepared.planning.nombreOuvriers
      );
    }

    return prepared;
  };

  // Soumettre le formulaire (création ou édition)
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Préparer les données avant soumission
      const preparedData = prepareFormData(formData);

      if (currentProjet) {
        // Mise à jour
        await api.put(`/projets/${currentProjet._id}`, preparedData);
      } else {
        // Création
        await api.post("/projets", preparedData);
      }

      await fetchProjets(); // Recharger la liste
      setShowForm(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(
        "Impossible de sauvegarder le projet. Veuillez vérifier les données."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ouvrir le formulaire de rendez-vous
  const handleAddRendezVous = (projet) => {
    setCurrentProjetRdv(projet);
    setShowRendezVousForm(true);
  };

  // Soumettre un rendez-vous
  const handleSubmitRendezVous = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Convertir la liste de participants en tableau si c'est une chaîne
      const preparedData = {
        ...formData,
        participants:
          typeof formData.participants === "string"
            ? formData.participants.split(",").map((p) => p.trim())
            : formData.participants,
      };

      await api.post(
        `/projets/${currentProjetRdv._id}/rendezVous`,
        preparedData
      );
      await fetchProjets(); // Recharger la liste
      setShowRendezVousForm(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout du rendez-vous:", err);
      setError("Impossible d'ajouter le rendez-vous.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Définition des colonnes du tableau
  const fields = [
    { key: "nom", label: "Nom du projet", sortable: true },
    { key: "lieu", label: "Lieu", sortable: true },
    {
      key: "statut",
      label: "Statut",
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            item.statut
          )}`}
        >
          {formatStatut(item.statut)}
        </span>
      ),
    },
    {
      key: "client",
      label: "Client",
      sortable: true,
      render: (item) =>
        `${item.client?.nom || ""} ${item.client?.prenom || ""}`,
    },
    {
      key: "dateDebut",
      label: "Date de début",
      sortable: true,
      render: (item) => formatDate(item.dateDebut),
    },
    {
      key: "dateFin",
      label: "Date de fin prévue",
      sortable: true,
      render: (item) => formatDate(item.dateFin),
    },
    {
      key: "budget",
      label: "Budget",
      sortable: true,
      render: (item) => formatCurrency(item.budget?.montantTotal),
    },
    {
      key: "planning",
      label: "Rendez-vous",
      sortable: false,
      render: (item) => (
        <button
          onClick={() => handleAddRendezVous(item)}
          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none"
        >
          <Calendar className="h-4 w-4 mr-1" />
          Planifier
        </button>
      ),
    },
  ];

  // Schéma du formulaire d'ajout/édition de projet
  const projetSchema = [
    { name: "nom", label: "Nom du projet", type: "text", required: true },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
    { name: "lieu", label: "Lieu", type: "text", required: true },
    {
      name: "client.nom",
      label: "Nom du client",
      type: "text",
      required: true,
    },
    {
      name: "client.prenom",
      label: "Prénom du client",
      type: "text",
      required: true,
    },
    { name: "client.email", label: "Email du client", type: "email" },
    {
      name: "client.telephone",
      label: "Téléphone du client",
      type: "text",
      required: true,
    },
    { name: "client.adresse", label: "Adresse du client", type: "text" },
    { name: "dateDebut", label: "Date de début", type: "date", required: true },
    {
      name: "dateFin",
      label: "Date de fin prévue",
      type: "date",
      required: true,
    },
    {
      name: "statut",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { value: "planifie", label: "Planifié" },
        { value: "en_cours", label: "En cours" },
        { value: "en_pause", label: "En pause" },
        { value: "termine", label: "Terminé" },
        { value: "annule", label: "Annulé" },
      ],
    },
    {
      name: "budget.montantTotal",
      label: "Budget total",
      type: "number",
      required: true,
    },
    {
      name: "budget.montantRecu",
      label: "Montant reçu",
      type: "number",
      required: true,
    },
    { name: "budget.beneficePrevu", label: "Bénéfice prévu", type: "number" },
    { name: "budget.numeroCompte", label: "Numéro de compte", type: "text" },
    {
      name: "chefChantier",
      label: "Chef de chantier",
      type: "select", // Modifié pour utiliser un select au lieu d'un texte
      required: true,
      options: ouvriers.map((o) => ({
        value: o._id,
        label: `${o.prenom} ${o.nom}`,
      })),
    },
    {
      name: "planning.dureeExecution",
      label: "Durée d'exécution (jours)",
      type: "number",
    },
    {
      name: "planning.dateLivraison",
      label: "Date de livraison",
      type: "date",
    },
    {
      name: "planning.nombreOuvriers",
      label: "Nombre d'ouvriers",
      type: "number",
    },
  ];

  // Schéma du formulaire de rendez-vous
  const rendezVousSchema = [
    {
      name: "date",
      label: "Date et heure",
      type: "datetime-local",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
    {
      name: "participants",
      label: "Participants (séparés par des virgules)",
      type: "text",
      required: true,
    },
    {
      name: "statut",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { value: "planifie", label: "Planifié" },
        { value: "complete", label: "Complété" },
        { value: "annule", label: "Annulé" },
      ],
    },
  ];

  // Fonctions utilitaires de formatage
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

  const getStatusColor = (statut) => {
    const colors = {
      planifie: "bg-yellow-100 text-yellow-800",
      en_cours: "bg-green-100 text-green-800",
      en_pause: "bg-orange-100 text-orange-800",
      termine: "bg-blue-100 text-blue-800",
      annule: "bg-red-100 text-red-800",
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
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

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Briefcase className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Projets
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Briefcase size={20} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Projets actifs
              </h3>
              <p className="text-3xl font-semibold text-gray-700">
                {projets.filter((p) => p.statut === "en_cours").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users size={20} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Personnel engagé
              </h3>
              <p className="text-3xl font-semibold text-gray-700">
                {projets.reduce(
                  (sum, p) => sum + (p.planning?.nombreOuvriers || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Clock size={20} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Jours de travail
              </h3>
              <p className="text-3xl font-semibold text-gray-700">
                {projets.reduce(
                  (sum, p) => sum + (p.planning?.dureeExecution || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResourceTable
        title="Liste des projets"
        fields={fields}
        data={projets}
        onEdit={handleEditProjet}
        onDelete={handleDeleteProjet}
        onAdd={handleAddProjet}
        isLoading={isLoading}
        noDataMessage="Aucun projet enregistré"
      />

      {/* Formulaire d'ajout/édition de projet */}
      <ResourceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          currentProjet ? `Modifier ${currentProjet.nom}` : "Ajouter un projet"
        }
        schema={projetSchema}
        initialData={
          currentProjet || {
            statut: "planifie",
            budget: { montantTotal: 0, montantRecu: 0 },
            planning: {},
          }
        }
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />

      {/* Formulaire d'ajout de rendez-vous */}
      <ResourceForm
        isOpen={showRendezVousForm}
        onClose={() => setShowRendezVousForm(false)}
        title={`Ajouter un rendez-vous - ${currentProjetRdv?.nom}`}
        schema={rendezVousSchema}
        initialData={{
          date: new Date().toISOString().split(".")[0],
          statut: "planifie",
        }}
        onSubmit={handleSubmitRendezVous}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Projets;
