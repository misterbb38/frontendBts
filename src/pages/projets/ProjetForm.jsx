// src/pages/projets/ProjetForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useQueryRefresh } from "../../hooks/useQueryRefresh";

const schema = yup.object().shape({
  nom: yup.string().required("Le nom du projet est requis"),
  description: yup.string().required("La description est requise"),
  lieu: yup.string().required("Le lieu est requis"),
  dateDebut: yup.date().required("La date de début est requise"),
  dateFin: yup.date().required("La date de fin est requise"),
  statut: yup.string().required("Le statut est requis"),
  "client.nom": yup.string().required("Le nom du client est requis"),
  "client.prenom": yup.string(),
  "client.email": yup.string().email("Email invalide"),
  "client.telephone": yup.string(),
  "client.adresse": yup.string(),
  "budget.montantTotal": yup
    .number()
    .required("Le montant total est requis")
    .min(0, "Le montant doit être positif"),
  "budget.montantRecu": yup.number().min(0, "Le montant doit être positif"),
  "budget.beneficePrevu": yup.number(),
  "budget.numeroCompte": yup.string(),
  chefChantier: yup.string().required("Le chef de chantier est requis"),
  "planning.dureeExecution": yup.number().min(1, "La durée doit être positive"),
  "planning.dateLivraison": yup.date(),
  "planning.nombreOuvriers": yup.number().min(0, "Le nombre doit être positif"),
});

const ProjetForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invalidateQueries } = useQueryRefresh();
  const isEditing = id !== "new";
  const [activeTab, setActiveTab] = useState("infos");

  // Requête pour récupérer les données du projet (si édition)
  const { data: projet, isLoading: isLoadingProjet } = useQuery({
    queryKey: ["projet", id],
    queryFn: async () => {
      if (!isEditing) return null;
      const response = await api.get(`/projets/${id}`);
      return response.data;
    },
    enabled: isEditing,
  });

  // Requête pour récupérer la liste des ouvriers (pour le chef de chantier)
  const { data: ouvriers, isLoading: isLoadingOuvriers } = useQuery({
    queryKey: ["ouvriers"],
    queryFn: async () => {
      const response = await api.get("/ouvriers");
      return response.data;
    },
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nom: "",
      description: "",
      lieu: "",
      dateDebut: "",
      dateFin: "",
      statut: "planifie",
      "client.nom": "",
      "client.prenom": "",
      "client.email": "",
      "client.telephone": "",
      "client.adresse": "",
      "budget.montantTotal": 0,
      "budget.montantRecu": 0,
      "budget.beneficePrevu": 0,
      "budget.numeroCompte": "",
      chefChantier: "",
      "planning.dureeExecution": 30,
      "planning.dateLivraison": "",
      "planning.nombreOuvriers": 0,
    },
  });

  // Mettre à jour les valeurs du formulaire quand le projet est chargé
  useEffect(() => {
    if (projet) {
      // Convertir les dates en format YYYY-MM-DD pour les inputs date
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      methods.reset({
        nom: projet.nom,
        description: projet.description,
        lieu: projet.lieu,
        dateDebut: formatDate(projet.dateDebut),
        dateFin: formatDate(projet.dateFin),
        statut: projet.statut,
        "client.nom": projet.client?.nom || "",
        "client.prenom": projet.client?.prenom || "",
        "client.email": projet.client?.email || "",
        "client.telephone": projet.client?.telephone || "",
        "client.adresse": projet.client?.adresse || "",
        "budget.montantTotal": projet.budget?.montantTotal || 0,
        "budget.montantRecu": projet.budget?.montantRecu || 0,
        "budget.beneficePrevu": projet.budget?.beneficePrevu || 0,
        "budget.numeroCompte": projet.budget?.numeroCompte || "",
        chefChantier: projet.chefChantier || "",
        "planning.dureeExecution": projet.planning?.dureeExecution || 30,
        "planning.dateLivraison": projet.planning?.dateLivraison
          ? formatDate(projet.planning.dateLivraison)
          : "",
        "planning.nombreOuvriers": projet.planning?.nombreOuvriers || 0,
      });
    }
  }, [projet, methods]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Formater les données pour l'API
      const formattedData = {
        ...data,
        budget: {
          montantTotal: parseFloat(data["budget.montantTotal"]),
          montantRecu: parseFloat(data["budget.montantRecu"]),
          beneficePrevu: parseFloat(data["budget.beneficePrevu"]),
          numeroCompte: data["budget.numeroCompte"],
        },
        client: {
          nom: data["client.nom"],
          prenom: data["client.prenom"],
          email: data["client.email"],
          telephone: data["client.telephone"],
          adresse: data["client.adresse"],
        },
        planning: {
          // src/pages/projets/ProjetForm.jsx (suite)
          dureeExecution: parseInt(data["planning.dureeExecution"]) || 0,
          dateLivraison: data["planning.dateLivraison"],
          nombreOuvriers: parseInt(data["planning.nombreOuvriers"]) || 0,
        },
      };

      if (isEditing) {
        return await api.put(`/projets/${id}`, formattedData);
      }
      return await api.post("/projets", formattedData);
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? "Projet mis à jour avec succès"
          : "Projet ajouté avec succès"
      );
      invalidateQueries(["projets"]);
      navigate("/projets");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Une erreur est survenue, veuillez réessayer"
      );
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoadingProjet && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: "infos", label: "Informations générales" },
    { id: "client", label: "Client" },
    { id: "budget", label: "Budget" },
    { id: "planning", label: "Planning" },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold">
          {isEditing ? "Modifier le projet" : "Nouveau projet"}
        </h1>
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 font-medium rounded-md ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {/* Informations générales */}
            <div className={activeTab === "infos" ? "block" : "hidden"}>
              <div className="space-y-4">
                <Field
                  name="nom"
                  label="Nom du projet"
                  placeholder="Nom du projet"
                  required
                />

                <Field
                  name="description"
                  label="Description"
                  type="textarea"
                  placeholder="Description du projet"
                  required
                />

                <Field
                  name="lieu"
                  label="Lieu"
                  placeholder="Lieu du projet"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    name="dateDebut"
                    label="Date de début"
                    type="date"
                    required
                  />

                  <Field
                    name="dateFin"
                    label="Date de fin prévue"
                    type="date"
                    required
                  />
                </div>

                <Field name="statut" label="Statut" type="select" required>
                  <option value="planifie">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="en_pause">En pause</option>
                  <option value="termine">Terminé</option>
                  <option value="annule">Annulé</option>
                </Field>

                <Field
                  name="chefChantier"
                  label="Chef de chantier"
                  type="select"
                  required
                >
                  <option value="">Sélectionner un chef de chantier</option>
                  {!isLoadingOuvriers &&
                    ouvriers &&
                    ouvriers.map((ouvrier) => (
                      <option key={ouvrier._id} value={ouvrier._id}>
                        {ouvrier.prenom} {ouvrier.nom} - {ouvrier.metier}
                      </option>
                    ))}
                </Field>
              </div>
            </div>

            {/* Informations du client */}
            <div className={activeTab === "client" ? "block" : "hidden"}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    name="client.nom"
                    label="Nom du client"
                    placeholder="Nom du client"
                    required
                  />

                  <Field
                    name="client.prenom"
                    label="Prénom du client"
                    placeholder="Prénom du client"
                  />
                </div>

                <Field
                  name="client.email"
                  label="Email du client"
                  type="email"
                  placeholder="Email du client"
                />

                <Field
                  name="client.telephone"
                  label="Téléphone du client"
                  placeholder="Téléphone du client"
                />

                <Field
                  name="client.adresse"
                  label="Adresse du client"
                  type="textarea"
                  placeholder="Adresse du client"
                />
              </div>
            </div>

            {/* Informations budgétaires */}
            <div className={activeTab === "budget" ? "block" : "hidden"}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    name="budget.montantTotal"
                    label="Montant total (FCFA)"
                    type="number"
                    required
                  />

                  <Field
                    name="budget.montantRecu"
                    label="Montant reçu (FCFA)"
                    type="number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    name="budget.beneficePrevu"
                    label="Bénéfice prévu (FCFA)"
                    type="number"
                  />

                  <Field
                    name="budget.numeroCompte"
                    label="Numéro de compte"
                    placeholder="Numéro de compte bancaire"
                  />
                </div>
              </div>
            </div>

            {/* Informations de planning */}
            <div className={activeTab === "planning" ? "block" : "hidden"}>
              <div className="space-y-4">
                <Field
                  name="planning.dureeExecution"
                  label="Durée d'exécution (jours)"
                  type="number"
                  min="1"
                />

                <Field
                  name="planning.dateLivraison"
                  label="Date de livraison"
                  type="date"
                />

                <Field
                  name="planning.nombreOuvriers"
                  label="Nombre d'ouvriers requis"
                  type="number"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/projets")}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isLoading}
              >
                {mutation.isLoading ? (
                  <Loader size="sm" />
                ) : isEditing ? (
                  "Mettre à jour"
                ) : (
                  "Ajouter"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default ProjetForm;
