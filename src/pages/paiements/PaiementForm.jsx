// src/pages/paiements/PaiementForm.jsx
import React, { useEffect } from "react";
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
  projet: yup.string().required("Le projet est requis"),
  statut: yup.string().required("Le statut est requis"),
  motif: yup.string().required("Le motif est requis"),
  modePaiement: yup.string().required("Le mode de paiement est requis"),
  reference: yup.string(),
  numeroPiece: yup.string(),
  emetteur: yup.string(),
  destinataire: yup.string(),
  description: yup.string(),
});

const PaiementForm = ({ initialData, onSuccess }) => {
  const { user } = useAuth();
  const isEditing = !!initialData;

  // Préparation des données initiales
  const prepareInitialData = () => {
    if (!initialData) {
      return {
        type: "entrant",
        montant: "",
        date: new Date().toISOString().split("T")[0],
        projet: "",
        statut: "en_attente",
        motif: "",
        modePaiement: "espece",
        reference: "",
        numeroPiece: "",
        emetteur: "",
        destinataire: "",
        description: "",
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

  // Réinitialiser le formulaire si initialData change
  useEffect(() => {
    methods.reset(prepareInitialData());
  }, [initialData]);

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
      if (isEditing) {
        return await api.put(`/paiements/${initialData._id}`, data);
      }
      return await api.post("/paiements", {
        ...data,
        creePar: user._id,
      });
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? "Paiement mis à jour avec succès"
          : "Paiement ajouté avec succès"
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
    // Conversion du montant en nombre
    const formattedData = {
      ...data,
      montant: parseFloat(data.montant),
    };
    mutation.mutate(formattedData);
  };

  const { watch } = methods;
  const paiementType = watch("type");

  // Motifs de paiement selon le type
  const motifs = {
    entrant: [
      { value: "avance_client", label: "Avance client" },
      { value: "paiement_tranche", label: "Paiement de tranche" },
      { value: "paiement_final", label: "Paiement final" },
      { value: "autre", label: "Autre" },
    ],
    sortant: [
      { value: "achat_materiaux", label: "Achat matériaux" },
      { value: "salaire_ouvriers", label: "Salaire ouvriers" },
      { value: "salaire_personnel", label: "Salaire personnel" },
      { value: "location_materiel", label: "Location matériel" },
      { value: "transport", label: "Transport" },
      { value: "autre", label: "Autre" },
    ],
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field name="type" label="Type de paiement" type="select" required>
              <option value="entrant">Entrée</option>
              <option value="sortant">Sortie</option>
            </Field>

            <Field name="date" label="Date" type="date" required />
          </div>

          <Field name="montant" label="Montant (FCFA)" type="number" required />

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

          <Field name="motif" label="Motif" type="select" required>
            <option value="">Sélectionnez un motif</option>
            {motifs[paiementType].map((motif) => (
              <option key={motif.value} value={motif.value}>
                {motif.label}
              </option>
            ))}
          </Field>

          <Field name="statut" label="Statut" type="select" required>
            <option value="en_attente">En attente</option>
            <option value="paye">Payé</option>
            <option value="partiel">Partiel</option>
            <option value="annule">Annulé</option>
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
            name="reference"
            label="Référence"
            placeholder="Référence du paiement"
          />

          <Field
            name="numeroPiece"
            label="Numéro de pièce"
            placeholder="N° Chèque, N° Virement, etc."
          />

          {paiementType === "entrant" ? (
            <Field
              name="emetteur"
              label="Émetteur"
              placeholder="Personne ou entité effectuant le paiement"
            />
          ) : (
            <Field
              name="destinataire"
              label="Destinataire"
              placeholder="Personne ou entité recevant le paiement"
            />
          )}

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

export default PaiementForm;
