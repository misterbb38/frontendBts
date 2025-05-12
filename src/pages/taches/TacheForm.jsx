// src/pages/taches/TacheForm.jsx
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../hooks/useAuth";

const schema = yup.object().shape({
  titre: yup.string().required("Le titre est requis"),
  description: yup.string().required("La description est requise"),
  projet: yup.string().required("Le projet est requis"),
  dateDebut: yup.date().required("La date de début est requise"),
  dateFin: yup.date().required("La date de fin est requise"),
  statut: yup.string().required("Le statut est requis"),
  priorite: yup.string().required("La priorité est requise"),
  assigneA: yup.array().of(yup.string()),
  progression: yup
    .number()
    .min(0, "La progression doit être positive")
    .max(100, "La progression ne peut pas dépasser 100%"),
});

const TacheForm = ({ initialData, onSuccess }) => {
  const { user } = useAuth();
  const isEditing = !!initialData;

  // Préparation des données initiales
  const prepareInitialData = () => {
    if (!initialData) {
      return {
        titre: "",
        description: "",
        projet: "",
        dateDebut: "",
        dateFin: "",
        statut: "a_faire",
        priorite: "moyenne",
        assigneA: [],
        progression: 0,
      };
    }

    // Convertir les dates en format YYYY-MM-DD pour les inputs date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    return {
      ...initialData,
      dateDebut: formatDate(initialData.dateDebut),
      dateFin: formatDate(initialData.dateFin),
      projet: initialData.projet?._id || initialData.projet,
      assigneA: initialData.assigneA?.map((u) => u._id || u) || [],
    };
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: prepareInitialData(),
  });

  // Récupérer la liste des projets
  const { data: projets, isLoading: isLoadingProjets } = useQuery({
    queryKey: ["projets"],
    queryFn: async () => {
      const response = await api.get("/projets");
      return response.data;
    },
  });

  // Récupérer la liste des utilisateurs
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/users");
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return await api.put(`/taches/${initialData._id}`, data);
      }
      return await api.post("/taches", {
        ...data,
        creePar: user._id,
      });
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? "Tâche mise à jour avec succès"
          : "Tâche ajoutée avec succès"
      );
      onSuccess();
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

  if (isLoadingProjets || isLoadingUsers) {
    return <Loader />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Field
            name="titre"
            label="Titre"
            placeholder="Titre de la tâche"
            required
          />

          <Field
            name="description"
            label="Description"
            type="textarea"
            placeholder="Description de la tâche"
            required
          />

          <Field name="projet" label="Projet" type="select" required>
            <option value="">Sélectionnez un projet</option>
            {projets &&
              projets.map((projet) => (
                <option key={projet._id} value={projet._id}>
                  {projet.nom}
                </option>
              ))}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field
              name="dateDebut"
              label="Date de début"
              type="date"
              required
            />

            <Field name="dateFin" label="Date de fin" type="date" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field name="statut" label="Statut" type="select" required>
              <option value="a_faire">À faire</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
              <option value="en_retard">En retard</option>
            </Field>

            <Field name="priorite" label="Priorité" type="select" required>
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
            </Field>
          </div>

          <Field
            name="progression"
            label={`Progression (${methods.watch("progression") || 0}%)`}
            type="range"
            min="0"
            max="100"
            step="5"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigné à
            </label>
            <div className="grid grid-cols-2 gap-2 border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {users &&
                users.map((user) => (
                  <div key={user._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`user-${user._id}`}
                      value={user._id}
                      {...methods.register("assigneA")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    // src/pages/taches/TacheForm.jsx (suite)
                    <label
                      htmlFor={`user-${user._id}`}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {user.prenom} {user.nom} ({user.role})
                    </label>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onSuccess}>
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
        </div>
      </form>
    </FormProvider>
  );
};

export default TacheForm;
