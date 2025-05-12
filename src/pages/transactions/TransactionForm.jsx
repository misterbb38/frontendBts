// src/pages/transactions/TransactionForm.jsx
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
  type: yup.string().required("Le type est requis"),
  montant: yup
    .number()
    .required("Le montant est requis")
    .min(0, "Le montant doit être positif"),
  date: yup.date().required("La date est requise"),
  categorie: yup.string().required("La catégorie est requise"),
  projet: yup.string().required("Le projet est requis"),
  description: yup.string(),
  referencePiece: yup.string(),
  beneficiaire: yup.string(),
  modePaiement: yup.string().required("Le mode de paiement est requis"),
});

const TransactionForm = ({ initialData, onSuccess }) => {
  const { user } = useAuth();
  const isEditing = !!initialData;

  // Préparation des données initiales
  const prepareInitialData = () => {
    if (!initialData) {
      return {
        type: "entree",
        montant: "",
        date: new Date().toISOString().split("T")[0],
        categorie: "",
        projet: "",
        description: "",
        referencePiece: "",
        beneficiaire: "",
        modePaiement: "espece",
      };
    }

    // Convertir la date en format YYYY-MM-DD pour l'input date
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    return {
      ...initialData,
      date: formatDate(initialData.date),
      projet: initialData.projet?._id || initialData.projet,
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

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formattedData = {
        ...data,
        montant: parseFloat(data.montant),
        effectuePar: user._id,
      };

      if (isEditing) {
        return await api.put(`/transactions/${initialData._id}`, formattedData);
      }
      return await api.post("/transactions", formattedData);
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? "Transaction mise à jour avec succès"
          : "Transaction ajoutée avec succès"
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

  const { watch } = methods;
  const transactionType = watch("type");

  // Catégories de transactions selon le type
  const typeCategories = {
    entree: [
      { value: "paiement_client", label: "Paiement client" },
      { value: "divers", label: "Autres entrées" },
    ],
    sortie: [
      { value: "achat_materiaux", label: "Achat matériaux" },
      { value: "salaire_ouvriers", label: "Salaire ouvriers" },
      { value: "salaire_personnel", label: "Salaire personnel" },
      { value: "logement_ouvriers", label: "Logement ouvriers" },
      { value: "gardiennage", label: "Gardiennage" },
      { value: "transport", label: "Transport" },
      { value: "location_materiel", label: "Location matériel" },
      { value: "divers", label: "Divers" },
    ],
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field
              name="type"
              label="Type de transaction"
              type="select"
              required
            >
              <option value="entree">Entrée</option>
              <option value="sortie">Sortie</option>
            </Field>

            <Field name="date" label="Date" type="date" required />
          </div>

          <Field name="montant" label="Montant (FCFA)" type="number" required />

          <Field name="categorie" label="Catégorie" type="select" required>
            <option value="">Sélectionnez une catégorie</option>
            {typeCategories[transactionType].map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Field>

          <Field name="projet" label="Projet" type="select" required>
            <option value="">Sélectionnez un projet</option>
            {!isLoadingProjets &&
              projets &&
              projets.map((projet) => (
                <option key={projet._id} value={projet._id}>
                  {projet.nom}
                </option>
              ))}
          </Field>

          <Field
            name="modePaiement"
            label="Mode de paiement"
            type="select"
            required
          >
            <option value="espece">Espèces</option>
            <option value="cheque">Chèque</option>
            <option value="virement">Virement</option>
            <option value="mobile_money">Mobile Money</option>
          </Field>

          <Field
            name="referencePiece"
            label="Référence pièce"
            placeholder="Ex: N° Facture, N° Chèque..."
          />

          {transactionType === "sortie" && (
            <Field
              name="beneficiaire"
              label="Bénéficiaire"
              placeholder="Nom du bénéficiaire"
            />
          )}

          <Field
            name="description"
            label="Description"
            type="textarea"
            placeholder="Description de la transaction"
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

export default TransactionForm;
