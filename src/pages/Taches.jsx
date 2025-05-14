import { useState, useEffect } from "react";
import {
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
} from "lucide-react";
import api from "../api";
import ResourceTable from "../ResourceTable";
import ResourceForm from "../ResourceForm";

const Taches = () => {
  const [taches, setTaches] = useState([]);
  const [projets, setProjets] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentTache, setCurrentTache] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [currentTacheComment, setCurrentTacheComment] = useState(null);

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [tachesData, projetsData, usersData] = await Promise.all([
          api.get("/taches"),
          api.get("/projets"),
          api.get("/users"),
        ]);

        setTaches(tachesData);
        setProjets(projetsData);
        setUsers(usersData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          "Impossible de charger les tâches. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Ajouter une nouvelle tâche
  const handleAddTache = () => {
    setCurrentTache(null);
    setShowForm(true);
  };

  // Éditer une tâche
  const handleEditTache = (tache) => {
    setCurrentTache(tache);
    setShowForm(true);
  };

  // Ouvrir le formulaire de commentaire
  const handleAddComment = (tache) => {
    setCurrentTacheComment(tache);
    setShowCommentForm(true);
  };

  // Soumettre le formulaire (création ou édition)
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Adapter les données du formulaire pour l'API
      const tacheData = {
        ...formData,
        assigneA: Array.isArray(formData.assigneA)
          ? formData.assigneA
          : formData.assigneA?.split(",").map((id) => id.trim()),
      };

      if (currentTache) {
        // Mise à jour
        await api.put(`/taches/${currentTache._id}`, tacheData);
      } else {
        // Création
        await api.post("/taches", tacheData);
      }

      // Recharger la liste
      const newTaches = await api.get("/taches");
      setTaches(newTaches);
      setShowForm(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(
        "Impossible de sauvegarder la tâche. Veuillez vérifier les données."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumettre un commentaire
  const handleSubmitComment = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Adapter la structure pour correspondre au modèle
      const commentData = {
        commentaires: [
          {
            texte: formData.texte,
            date: new Date(),
            auteur: formData.auteur,
          },
        ],
      };

      await api.put(`/taches/${currentTacheComment._id}`, commentData);

      // Recharger la liste
      const newTaches = await api.get("/taches");
      setTaches(newTaches);
      setShowCommentForm(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err);
      setError("Impossible d'ajouter le commentaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Changer le statut d'une tâche
  const handleChangeStatus = async (tache, newStatus) => {
    try {
      await api.put(`/taches/${tache._id}/statut`, { statut: newStatus });

      // Recharger la liste
      const newTaches = await api.get("/taches");
      setTaches(newTaches);
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      setError("Impossible de changer le statut de la tâche.");
    }
  };

  // Définition des colonnes du tableau
  const fields = [
    { key: "titre", label: "Titre", sortable: true },
    {
      key: "projet",
      label: "Projet",
      sortable: true,
      render: (item) => {
        const projet = projets.find((p) => p._id === item.projet);
        return projet ? projet.nom : "N/A";
      },
    },
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
      key: "priorite",
      label: "Priorité",
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
            item.priorite
          )}`}
        >
          {formatPriorite(item.priorite)}
        </span>
      ),
    },
    {
      key: "dateDebut",
      label: "Début",
      sortable: true,
      render: (item) => formatDate(item.dateDebut),
    },
    {
      key: "dateFin",
      label: "Fin",
      sortable: true,
      render: (item) => formatDate(item.dateFin),
    },
    {
      key: "progression",
      label: "Progression",
      sortable: true,
      render: (item) => (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${item.progression}%` }}
          ></div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (item) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleAddComment(item)}
            className="text-gray-600 hover:text-gray-900"
            title="Ajouter un commentaire"
          >
            <ClipboardList size={18} />
          </button>

          {item.statut !== "termine" && (
            <button
              onClick={() => handleChangeStatus(item, "termine")}
              className="text-green-600 hover:text-green-900"
              title="Marquer comme terminé"
            >
              <CheckCircle size={18} />
            </button>
          )}

          {item.statut !== "en_cours" && (
            <button
              onClick={() => handleChangeStatus(item, "en_cours")}
              className="text-blue-600 hover:text-blue-900"
              title="Marquer en cours"
            >
              <Clock size={18} />
            </button>
          )}

          {item.statut !== "a_faire" && (
            <button
              onClick={() => handleChangeStatus(item, "a_faire")}
              className="text-yellow-600 hover:text-yellow-900"
              title="Marquer à faire"
            >
              <Loader size={18} />
            </button>
          )}

          {item.statut !== "en_retard" && (
            <button
              onClick={() => handleChangeStatus(item, "en_retard")}
              className="text-red-600 hover:text-red-900"
              title="Marquer en retard"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Schéma du formulaire d'ajout/édition de tâche
  const tacheSchema = [
    { name: "titre", label: "Titre", type: "text", required: true },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
    {
      name: "projet",
      label: "Projet",
      type: "select",
      required: true,
      options: projets.map((p) => ({ value: p._id, label: p.nom })),
    },
    { name: "dateDebut", label: "Date de début", type: "date", required: true },
    { name: "dateFin", label: "Date de fin", type: "date", required: true },
    {
      name: "statut",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { value: "a_faire", label: "À faire" },
        { value: "en_cours", label: "En cours" },
        { value: "termine", label: "Terminé" },
        { value: "en_retard", label: "En retard" },
      ],
    },
    {
      name: "priorite",
      label: "Priorité",
      type: "select",
      required: true,
      options: [
        { value: "basse", label: "Basse" },
        { value: "moyenne", label: "Moyenne" },
        { value: "haute", label: "Haute" },
      ],
    },
    {
      name: "assigneA",
      label: "Assigné à",
      type: "select",
      required: true,
      options: users.map((u) => ({
        value: u._id,
        label: `${u.nom} ${u.prenom}`,
      })),
    },
    {
      name: "progression",
      label: "Progression (%)",
      type: "number",
      min: 0,
      max: 100,
    },
  ];

  // Schéma du formulaire de commentaire
  const commentSchema = [
    { name: "texte", label: "Commentaire", type: "textarea", required: true },
    {
      name: "auteur",
      label: "Auteur",
      type: "select",
      required: true,
      options: users.map((u) => ({
        value: u._id,
        label: `${u.nom} ${u.prenom}`,
      })),
    },
  ];

  // Fonctions utilitaires de formatage
  const formatStatut = (statut) => {
    const formats = {
      a_faire: "À faire",
      en_cours: "En cours",
      termine: "Terminé",
      en_retard: "En retard",
    };
    return formats[statut] || statut;
  };

  const getStatusColor = (statut) => {
    const colors = {
      a_faire: "bg-yellow-100 text-yellow-800",
      en_cours: "bg-blue-100 text-blue-800",
      termine: "bg-green-100 text-green-800",
      en_retard: "bg-red-100 text-red-800",
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  const formatPriorite = (priorite) => {
    const formats = {
      basse: "Basse",
      moyenne: "Moyenne",
      haute: "Haute",
    };
    return formats[priorite] || priorite;
  };

  const getPriorityColor = (priorite) => {
    const colors = {
      basse: "bg-green-100 text-green-800",
      moyenne: "bg-yellow-100 text-yellow-800",
      haute: "bg-red-100 text-red-800",
    };
    return colors[priorite] || "bg-gray-100 text-gray-800";
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

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <ClipboardList className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Tâches
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

      {/* Compteurs de statut */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">À faire</h2>
              <p className="text-3xl font-bold text-gray-800">
                {taches.filter((t) => t.statut === "a_faire").length}
              </p>
            </div>
            <Loader className="h-12 w-12 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">En cours</h2>
              <p className="text-3xl font-bold text-gray-800">
                {taches.filter((t) => t.statut === "en_cours").length}
              </p>
            </div>
            <Clock className="h-12 w-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">Terminées</h2>
              <p className="text-3xl font-bold text-gray-800">
                {taches.filter((t) => t.statut === "termine").length}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-400">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">En retard</h2>
              <p className="text-3xl font-bold text-gray-800">
                {taches.filter((t) => t.statut === "en_retard").length}
              </p>
            </div>
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
        </div>
      </div>

      <ResourceTable
        title="Liste des tâches"
        fields={fields}
        data={taches}
        onEdit={handleEditTache}
        onAdd={handleAddTache}
        isLoading={isLoading}
        noDataMessage="Aucune tâche enregistrée"
      />

      {/* Formulaire d'ajout/édition de tâche */}
      <ResourceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          currentTache ? `Modifier ${currentTache.titre}` : "Ajouter une tâche"
        }
        schema={tacheSchema}
        initialData={currentTache}
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />

      {/* Formulaire d'ajout de commentaire */}
      <ResourceForm
        isOpen={showCommentForm}
        onClose={() => setShowCommentForm(false)}
        title={`Ajouter un commentaire - ${currentTacheComment?.titre}`}
        schema={commentSchema}
        initialData={{}}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Taches;
