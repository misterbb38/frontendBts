import { useState, useEffect } from "react";
import { Package, Plus, AlertCircle } from "lucide-react";
import api from "../api";
import ResourceTable from "../ResourceTable";
import ResourceForm from "../ResourceForm";

const Materiaux = () => {
  const [materiaux, setMateriaux] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentMateriau, setCurrentMateriau] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMouvementForm, setShowMouvementForm] = useState(false);
  const [currentMouvementMateriau, setCurrentMouvementMateriau] =
    useState(null);

  // Charger les matériaux au chargement
  useEffect(() => {
    fetchMateriaux();
  }, []);

  // Récupérer la liste des matériaux
  const fetchMateriaux = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get("/materiaux");
      setMateriaux(data);
    } catch (err) {
      console.error("Erreur lors du chargement des matériaux:", err);
      setError(
        "Impossible de charger les matériaux. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter un nouveau matériau
  const handleAddMateriau = () => {
    setCurrentMateriau(null);
    setShowForm(true);
  };

  // Éditer un matériau
  const handleEditMateriau = (materiau) => {
    setCurrentMateriau(materiau);
    setShowForm(true);
  };

  // Supprimer un matériau (fonction fictive - généralement on ne supprime pas)
  const handleDeleteMateriau = async (materiau) => {
    if (
      !window.confirm(`Êtes-vous sûr de vouloir supprimer ${materiau.nom} ?`)
    ) {
      return;
    }

    try {
      // Cette route n'existe peut-être pas dans votre API
      await api.delete(`/materiaux/${materiau._id}`);
      await fetchMateriaux(); // Recharger la liste
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Impossible de supprimer ce matériau.");
    }
  };

  // Soumettre le formulaire (création ou édition)
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (currentMateriau) {
        // Mise à jour
        await api.put(`/materiaux/${currentMateriau._id}`, formData);
      } else {
        // Création
        await api.post("/materiaux", formData);
      }

      await fetchMateriaux(); // Recharger la liste
      setShowForm(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(
        "Impossible de sauvegarder le matériau. Veuillez vérifier les données."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ouvrir le formulaire de mouvement de stock
  const handleAddMouvement = (materiau) => {
    setCurrentMouvementMateriau(materiau);
    setShowMouvementForm(true);
  };

  // Soumettre un mouvement de stock
  const handleSubmitMouvement = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post(
        `/materiaux/${currentMouvementMateriau._id}/mouvement`,
        formData
      );
      await fetchMateriaux(); // Recharger la liste
      setShowMouvementForm(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout du mouvement:", err);
      setError("Impossible d'ajouter le mouvement de stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Définition des colonnes du tableau
  const fields = [
    { key: "nom", label: "Nom", sortable: true },
    {
      key: "categorie",
      label: "Catégorie",
      sortable: true,
      render: (item) => formatCategorie(item.categorie),
    },
    { key: "unite", label: "Unité", sortable: true },
    {
      key: "quantiteStock",
      label: "Stock",
      sortable: true,
      render: (item) => {
        const isLowStock = item.quantiteStock < item.quantiteMinimum;
        return (
          <span className={isLowStock ? "text-red-600 font-semibold" : ""}>
            {item.quantiteStock} {item.unite}
            {isLowStock && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Faible
              </span>
            )}
          </span>
        );
      },
    },
    {
      key: "prix",
      label: "Prix",
      sortable: true,
      render: (item) => formatCurrency(item.prix),
    },
    {
      key: "actions",
      label: "Stock",
      sortable: false,
      render: (item) => (
        <button
          onClick={() => handleAddMouvement(item)}
          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          Mouvement
        </button>
      ),
    },
  ];

  // Schéma du formulaire d'ajout/édition de matériau
  const materiauSchema = [
    { name: "nom", label: "Nom", type: "text", required: true },
    {
      name: "categorie",
      label: "Catégorie",
      type: "select",
      required: true,
      options: [
        { value: "ciment", label: "Ciment" },
        { value: "fer", label: "Fer" },
        { value: "sable", label: "Sable" },
        { value: "gravier", label: "Gravier" },
        { value: "grain_de_riz", label: "Grain de riz" },
        { value: "bois_coffrage", label: "Bois coffrage" },
        { value: "serre_joint", label: "Serre joint" },
        { value: "echafaudage", label: "Échafaudage" },
        { value: "etes_en_fer", label: "Étés en fer" },
        { value: "materiel_electrique", label: "Matériel électrique" },
        { value: "plomberie", label: "Plomberie" },
        { value: "appareil_sanitaire", label: "Appareil sanitaire" },
      ],
    },
    { name: "sousCategorie", label: "Sous-catégorie", type: "text" },
    {
      name: "unite",
      label: "Unité",
      type: "select",
      required: true,
      options: [
        { value: "tonne", label: "Tonne" },
        { value: "kg", label: "Kilogramme" },
        { value: "m3", label: "Mètre cube" },
        { value: "piece", label: "Pièce" },
        { value: "metre", label: "Mètre" },
        { value: "lot", label: "Lot" },
        { value: "sac", label: "Sac" },
      ],
    },
    {
      name: "quantiteStock",
      label: "Quantité en stock",
      type: "number",
      required: true,
    },
    {
      name: "quantiteMinimum",
      label: "Quantité minimum",
      type: "number",
      required: true,
    },
    { name: "prix", label: "Prix unitaire", type: "number", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "emplacement", label: "Emplacement", type: "text" },
  ];

  // Schéma du formulaire de mouvement de stock
  const mouvementSchema = [
    {
      name: "type",
      label: "Type de mouvement",
      type: "select",
      required: true,
      options: [
        { value: "entree", label: "Entrée" },
        { value: "sortie", label: "Sortie" },
      ],
    },
    { name: "quantite", label: "Quantité", type: "number", required: true },
    { name: "prixUnitaire", label: "Prix unitaire", type: "number" },
    { name: "date", label: "Date", type: "date", required: true },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
    },
    { name: "fournisseur.nom", label: "Nom du fournisseur", type: "text" },
    {
      name: "fournisseur.contact",
      label: "Contact du fournisseur",
      type: "text",
    },
    { name: "fournisseur.reference", label: "Référence", type: "text" },
  ];

  // Formatage
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

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Package className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Matériaux
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

      <ResourceTable
        title="Liste des matériaux"
        fields={fields}
        data={materiaux}
        onEdit={handleEditMateriau}
        onDelete={handleDeleteMateriau}
        onAdd={handleAddMateriau}
        isLoading={isLoading}
        noDataMessage="Aucun matériau enregistré"
      />

      {/* Formulaire d'ajout/édition de matériau */}
      <ResourceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          currentMateriau
            ? `Modifier ${currentMateriau.nom}`
            : "Ajouter un matériau"
        }
        schema={materiauSchema}
        initialData={currentMateriau}
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />

      {/* Formulaire de mouvement de stock */}
      <ResourceForm
        isOpen={showMouvementForm}
        onClose={() => setShowMouvementForm(false)}
        title={`Ajouter un mouvement de stock - ${currentMouvementMateriau?.nom}`}
        schema={mouvementSchema}
        initialData={{ date: new Date().toISOString().split("T")[0] }}
        onSubmit={handleSubmitMouvement}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Materiaux;
