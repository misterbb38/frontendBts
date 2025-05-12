// src/pages/paiements/PaiementsList.jsx
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { useQueryRefresh } from "../../hooks/useQueryRefresh";
import { useModal } from "../../hooks/useModal";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import PaiementForm from "./PaiementForm";
import Loader from "../../components/ui/Loader";
import Eye from "../../components/icons/Eye";
import Pen from "../../components/icons/Pen";
import Trash from "../../components/icons/Trash";
import Plus from "../../components/icons/Plus";

const PaiementsList = () => {
  const { invalidateQueries } = useQueryRefresh();
  const formModal = useModal();
  const deleteModal = useModal();
  const detailsModal = useModal();

  const { data: paiements, isLoading } = useQuery({
    queryKey: ["paiements"],
    queryFn: async () => {
      const response = await api.get("/paiements");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/paiements/${id}`);
    },
    onSuccess: () => {
      toast.success("Paiement supprimé avec succès");
      invalidateQueries(["paiements"]);
      deleteModal.closeModal();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    },
  });

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatMontant = (montant) => {
    return montant.toLocaleString() + " FCFA";
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      en_attente: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "En attente",
      },
      paye: { bg: "bg-green-100", text: "text-green-800", label: "Payé" },
      annule: { bg: "bg-red-100", text: "text-red-800", label: "Annulé" },
      partiel: { bg: "bg-blue-100", text: "text-blue-800", label: "Partiel" },
    };

    const config = statusConfig[statut] || statusConfig.en_attente;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: "reference",
      header: "Référence",
      render: (row) =>
        row.reference || `PAY-${row._id.substring(0, 8).toUpperCase()}`,
    },
    {
      key: "date",
      header: "Date",
      render: (row) => formatDate(row.date),
    },
    {
      key: "projet",
      header: "Projet",
      render: (row) => row.projet?.nom || "Non spécifié",
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (row.type === "entrant" ? "Entrée" : "Sortie"),
    },
    {
      key: "montant",
      header: "Montant",
      render: (row) => formatMontant(row.montant),
    },
    {
      key: "statut",
      header: "Statut",
      render: (row) => getStatusBadge(row.statut),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              detailsModal.openModal(row);
            }}
          >
            <Eye size={16} className="mr-1" /> Détails
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              formModal.openModal(row);
            }}
          >
            <Pen size={16} className="mr-1" /> Modifier
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteModal.openModal(row);
            }}
          >
            <Trash size={16} className="mr-1" /> Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des Paiements</h1>
        <Button onClick={() => formModal.openModal(null)}>
          <Plus size={18} className="mr-2" /> Nouveau paiement
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Table
          columns={columns}
          data={paiements}
          onRowClick={(row) => detailsModal.openModal(row)}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de création/modification */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={formModal.data ? "Modifier le paiement" : "Nouveau paiement"}
      >
        <PaiementForm
          initialData={formModal.data}
          onSuccess={() => {
            invalidateQueries(["paiements"]);
            formModal.closeModal();
          }}
        />
      </Modal>

      {/* Modal de suppression */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        title="Confirmer la suppression"
      >
        <div className="p-4">
          <p className="mb-4">
            Êtes-vous sûr de vouloir supprimer ce paiement de{" "}
            {formatMontant(deleteModal.data?.montant || 0)} ?
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={deleteModal.closeModal}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteModal.data?._id)}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? <Loader size="sm" /> : "Supprimer"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de détails */}
      <Modal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.closeModal}
        title="Détails du paiement"
      >
        {detailsModal.data && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Référence</p>
                <p className="font-medium">
                  {detailsModal.data.reference ||
                    `PAY-${detailsModal.data._id
                      .substring(0, 8)
                      .toUpperCase()}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {formatDate(detailsModal.data.date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Projet</p>
                <p className="font-medium">
                  {detailsModal.data.projet?.nom || "Non spécifié"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">
                  {detailsModal.data.type === "entrant" ? "Entrée" : "Sortie"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Montant</p>
                <p className="font-medium">
                  {formatMontant(detailsModal.data.montant)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium">
                  {getStatusBadge(detailsModal.data.statut)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mode de paiement</p>
                <p className="font-medium">
                  {{
                    espece: "Espèces",
                    cheque: "Chèque",
                    virement: "Virement",
                    mobile_money: "Mobile Money",
                  }[detailsModal.data.modePaiement] || "Non spécifié"}
                </p>
              </div>
              {detailsModal.data.numeroPiece && (
                <div>
                  <p className="text-sm text-gray-500">Numéro de pièce</p>
                  <p className="font-medium">{detailsModal.data.numeroPiece}</p>
                </div>
              )}
              {detailsModal.data.emetteur && (
                <div>
                  <p className="text-sm text-gray-500">Émetteur</p>
                  <p className="font-medium">{detailsModal.data.emetteur}</p>
                </div>
              )}
              {detailsModal.data.destinataire && (
                <div>
                  <p className="text-sm text-gray-500">Destinataire</p>
                  <p className="font-medium">
                    {detailsModal.data.destinataire}
                  </p>
                </div>
              )}
              {detailsModal.data.description && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{detailsModal.data.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={detailsModal.closeModal}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaiementsList;
