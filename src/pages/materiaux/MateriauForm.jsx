// src/pages/materiaux/MateriauForm.jsx
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
  categorie: yup.string().required("La catégorie est requise"),
  sousCategorie: yup.string(),
  unite: yup.string().required("L'unité est requise"),
  quantiteStock: yup
    .number()
    .required("La quantité est requise")
    .min(0, "La quantité doit être positive"),
  quantiteMinimum: yup
    .number()
    .min(0, "La quantité minimum doit être positive"),
  prix: yup.number().min(0, "Le prix doit être positif"),
  description: yup.string(),
  emplacement: yup.string(),
});

const MateriauForm = ({ initialData, onSuccess }) => {
  const isEditing = !!initialData;

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      nom: "",
      categorie: "",
      sousCategorie: "",
      unite: "",
      quantiteStock: 0,
      quantiteMinimum: 0,
      prix: 0,
      description: "",
      emplacement: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return await api.put(`/materiaux/${initialData._id}`, data);
      }
      return await api.post("/materiaux", data);
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? "Matériau mis à jour avec succès"
          : "Matériau ajouté avec succès"
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

  const categories = [
    { value: "ciment", label: "Ciment" },
    { value: "fer", label: "Fer" },
    { value: "sable", label: "Sable" },
    { value: "gravier", label: "Gravier" },
    { value: "grain_de_riz", label: "Grain de riz" },
    { value: "bois_coffrage", label: "Bois de coffrage" },
    { value: "serre_joint", label: "Serre-joint" },
    { value: "echafaudage", label: "Échafaudage" },
    { value: "etes_en_fer", label: "Étais en fer" },
    { value: "materiel_electrique", label: "Matériel électrique" },
    { value: "plomberie", label: "Plomberie" },
    { value: "appareil_sanitaire", label: "Appareil sanitaire" },
  ];

  const unites = [
    { value: "tonne", label: "Tonne" },
    { value: "kg", label: "Kilogramme" },
    { value: "m3", label: "Mètre cube" },
    { value: "piece", label: "Pièce" },
    { value: "metre", label: "Mètre" },
    { value: "lot", label: "Lot" },
    { value: "sac", label: "Sac" },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <Field
            name="nom"
            label="Nom du matériau"
            placeholder="Ex: Ciment portland"
            required
          />

          <Field name="categorie" label="Catégorie" type="select" required>
            <option value="">Sélectionnez une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Field>

          <Field
            name="sousCategorie"
            label="Sous-catégorie"
            placeholder="Sous-catégorie (optionnel)"
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              name="quantiteStock"
              label="Quantité en stock"
              type="number"
              required
            />

            <Field name="unite" label="Unité" type="select" required>
              <option value="">Sélectionnez une unité</option>
              {unites.map((unite) => (
                <option key={unite.value} value={unite.value}>
                  {unite.label}
                </option>
              ))}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              name="quantiteMinimum"
              label="Quantité minimum d'alerte"
              type="number"
            />

            <Field name="prix" label="Prix unitaire (FCFA)" type="number" />
          </div>

          <Field
            name="emplacement"
            label="Emplacement"
            placeholder="Ex: Dépôt central, Étagère A3"
          />

          <Field
            name="description"
            label="Description"
            type="textarea"
            placeholder="Description ou notes additionnelles"
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

export default MateriauForm;
