// src/pages/ouvriers/OuvrierForm.jsx
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";

const schema = yup.object().shape({
  nom: yup.string().required("Le nom est requis"),
  prenom: yup.string().required("Le prénom est requis"),
  metier: yup.string().required("Le métier est requis"),
  telephone: yup.string(),
  tauxJournalier: yup
    .number()
    .required("Le taux journalier est requis")
    .min(0, "Le taux doit être positif"),
  disponible: yup.boolean(),
  competences: yup.string(),
});

const OuvrierForm = ({ initialData, onSuccess }) => {
  const isEditing = !!initialData;

  // Préparer les compétences pour le formulaire (transformer array en string)
  const defaultValues = initialData
    ? {
        ...initialData,
        competences: initialData.competences
          ? initialData.competences.join(", ")
          : "",
      }
    : {
        nom: "",
        prenom: "",
        metier: "",
        telephone: "",
        tauxJournalier: 0,
        disponible: true,
        competences: "",
      };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Transformer les compétences de string en array
      const formattedData = {
        ...data,
        competences: data.competences
          ? data.competences.split(",").map((comp) => comp.trim())
          : [],
      };

      if (isEditing) {
        return await api.put(`/ouvriers/${initialData._id}`, formattedData);
      }
      return await api.post("/ouvriers", formattedData);
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? "Ouvrier mis à jour avec succès"
          : "Ouvrier ajouté avec succès"
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

  const metiers = [
    { value: "macon", label: "Maçon" },
    { value: "manoeuvre", label: "Manœuvre" },
    { value: "coffreur", label: "Coffreur" },
    { value: "ferrailleur", label: "Ferrailleur" },
    { value: "electricien", label: "Électricien" },
    { value: "plombier", label: "Plombier" },
    { value: "peintre", label: "Peintre" },
    { value: "carreleur", label: "Carreleur" },
    { value: "platrier", label: "Plâtrier" },
    { value: "menuisier_alu", label: "Menuisier Alu" },
    { value: "menuisier_bois", label: "Menuisier Bois" },
    { value: "menuisier_metallique", label: "Menuisier Métallique" },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field
              name="nom"
              label="Nom"
              placeholder="Nom de l'ouvrier"
              required
            />

            <Field
              name="prenom"
              label="Prénom"
              placeholder="Prénom de l'ouvrier"
              required
            />
          </div>

          <Field name="metier" label="Métier" type="select" required>
            <option value="">Sélectionnez un métier</option>
            {metiers.map((metier) => (
              <option key={metier.value} value={metier.value}>
                {metier.label}
              </option>
            ))}
          </Field>

          <Field
            name="telephone"
            label="Téléphone"
            placeholder="Numéro de téléphone"
          />

          <Field
            name="tauxJournalier"
            label="Taux journalier (FCFA)"
            type="number"
            required
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="disponible"
              {...methods.register("disponible")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="disponible"
              className="block text-sm font-medium text-gray-700"
            >
              Disponible pour de nouveaux projets
            </label>
          </div>

          <Field
            name="competences"
            label="Compétences"
            placeholder="Compétences séparées par des virgules"
            type="textarea"
          />

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

export default OuvrierForm;
