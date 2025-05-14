import { useState, useEffect, useContext } from "react";
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  ShieldAlert,
} from "lucide-react";
import api from "../api";
import ResourceTable from "../ResourceTable";
import ResourceForm from "../ResourceForm";
import { AuthContext } from "../authContext";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [projets, setProjets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useContext(AuthContext);
  const [filtres, setFiltres] = useState({
    type: "",
    priorite: "",
    vue: "",
  });

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [notificationsData, usersData, projetsData] = await Promise.all([
          api.get("/notifications"),
          api.get("/users"),
          api.get("/projets"),
        ]);

        setNotifications(notificationsData);
        setUsers(usersData);
        setProjets(projetsData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          "Impossible de charger les notifications. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Créer une nouvelle notification
  const handleAddNotification = () => {
    setShowForm(true);
  };

  // Marquer une notification comme lue
  const handleMarkAsRead = async (notification) => {
    try {
      await api.put(`/notifications/${notification._id}`, { vue: true });

      // Mettre à jour localement
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, vue: true } : n))
      );
    } catch (err) {
      console.error("Erreur lors du marquage de la notification:", err);
      setError("Impossible de marquer la notification comme lue.");
    }
  };

  // Soumettre le formulaire de création
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Adapter les données
      const notificationData = {
        ...formData,
        destinataires: Array.isArray(formData.destinataires)
          ? formData.destinataires
          : formData.destinataires?.split(",").map((id) => id.trim()),
      };

      await api.post("/notifications", notificationData);

      // Recharger la liste
      const newNotifications = await api.get("/notifications");
      setNotifications(newNotifications);
      setShowForm(false);
    } catch (err) {
      console.error("Erreur lors de la création de la notification:", err);
      setError(
        "Impossible de créer la notification. Veuillez vérifier les données."
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
      priorite: "",
      vue: "",
    });
  };

  // Filtrer les notifications
  const notificationsFiltrees = notifications.filter((notification) => {
    if (filtres.type && notification.type !== filtres.type) return false;
    if (filtres.priorite && notification.priorite !== filtres.priorite)
      return false;
    if (filtres.vue === "true" && !notification.vue) return false;
    if (filtres.vue === "false" && notification.vue) return false;
    return true;
  });

  // Définition des colonnes du tableau
  const fields = [
    {
      key: "vue",
      label: "État",
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center justify-center p-1 rounded-full ${
            item.vue ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-500"
          }`}
        >
          {item.vue ? <CheckCircle size={16} /> : <Info size={16} />}
        </span>
      ),
    },
    {
      key: "titre",
      label: "Titre",
      sortable: true,
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
            item.type
          )}`}
        >
          {formatType(item.type)}
        </span>
      ),
    },
    {
      key: "priorite",
      label: "Priorité",
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioriteColor(
            item.priorite
          )}`}
        >
          {formatPriorite(item.priorite)}
        </span>
      ),
    },
    {
      key: "message",
      label: "Message",
      sortable: false,
      render: (item) => truncateText(item.message, 80),
    },
    {
      key: "dateCreation",
      label: "Date",
      sortable: true,
      render: (item) => formatDate(item.dateCreation),
    },
    {
      key: "projet",
      label: "Projet",
      sortable: false,
      render: (item) => {
        const projet = projets.find((p) => p._id === item.projet);
        return projet ? projet.nom : "-";
      },
    },
    {
      key: "action",
      label: "Action",
      sortable: false,
      render: (item) =>
        !item.vue && (
          <button
            onClick={() => handleMarkAsRead(item)}
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Marquer comme lu
          </button>
        ),
    },
  ];

  // Schéma du formulaire de création de notification
  const notificationSchema = [
    { name: "titre", label: "Titre", type: "text", required: true },
    { name: "message", label: "Message", type: "textarea", required: true },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      options: [
        { value: "info", label: "Information" },
        { value: "alerte", label: "Alerte" },
        { value: "erreur", label: "Erreur" },
        { value: "succes", label: "Succès" },
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
      name: "destinataires",
      label: "Destinataires",
      type: "select",
      required: true,
      options: users.map((u) => ({
        value: u._id,
        label: `${u.prenom} ${u.nom}`,
      })),
    },
    {
      name: "projet",
      label: "Projet concerné",
      type: "select",
      options: projets.map((p) => ({
        value: p._id,
        label: p.nom,
      })),
    },
    { name: "lien", label: "Lien (URL)", type: "text" },
  ];

  // Fonctions utilitaires de formatage
  const formatType = (type) => {
    const formats = {
      info: "Information",
      alerte: "Alerte",
      erreur: "Erreur",
      succes: "Succès",
    };
    return formats[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      info: "bg-blue-100 text-blue-800",
      alerte: "bg-yellow-100 text-yellow-800",
      erreur: "bg-red-100 text-red-800",
      succes: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatPriorite = (priorite) => {
    const formats = {
      basse: "Basse",
      moyenne: "Moyenne",
      haute: "Haute",
    };
    return formats[priorite] || priorite;
  };

  const getPrioriteColor = (priorite) => {
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Statistiques des notifications
  const totalNonLues = notifications.filter((n) => !n.vue).length;
  const totalHautePriorite = notifications.filter(
    (n) => n.priorite === "haute" && !n.vue
  ).length;
  const totalDestinataire = notifications.filter(
    (n) => n.destinataires?.includes(user?.id) && !n.vue
  ).length;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Bell className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
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
              <h2 className="text-sm font-medium text-gray-600">Non lues</h2>
              <p className="text-3xl font-bold text-blue-600">{totalNonLues}</p>
            </div>
            <Info className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Haute priorité
              </h2>
              <p className="text-3xl font-bold text-red-600">
                {totalHautePriorite}
              </p>
            </div>
            <ShieldAlert className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">Pour vous</h2>
              <p className="text-3xl font-bold text-green-600">
                {totalDestinataire}
              </p>
            </div>
            <Bell className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="info">Information</option>
              <option value="alerte">Alerte</option>
              <option value="erreur">Erreur</option>
              <option value="succes">Succès</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priorite"
              className="block text-sm font-medium text-gray-700"
            >
              Priorité
            </label>
            <select
              id="priorite"
              name="priorite"
              value={filtres.priorite}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Toutes les priorités</option>
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="vue"
              className="block text-sm font-medium text-gray-700"
            >
              État
            </label>
            <select
              id="vue"
              name="vue"
              value={filtres.vue}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Tous les états</option>
              <option value="false">Non lues</option>
              <option value="true">Lues</option>
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
        title="Liste des notifications"
        fields={fields}
        data={notificationsFiltrees}
        onAdd={handleAddNotification}
        isLoading={isLoading}
        noDataMessage="Aucune notification"
      />

      {/* Formulaire de création de notification */}
      <ResourceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Créer une notification"
        schema={notificationSchema}
        initialData={{
          type: "info",
          priorite: "moyenne",
        }}
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Notifications;
