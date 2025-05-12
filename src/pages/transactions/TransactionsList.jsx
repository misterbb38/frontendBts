// src/pages/transactions/TransactionsList.jsx
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { useQueryRefresh } from "../../hooks/useQueryRefresh";
import { useModal } from "../../hooks/useModal";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TransactionForm from "./TransactionForm";
import Loader from "../../components/ui/Loader";
import Eye from "../../components/icons/Eye";
import Pen from "../../components/icons/Pen";
import Trash from "../../components/icons/Trash";
import Plus from "../../components/icons/Plus";
const TransactionsList = () => {
  const { invalidateQueries } = useQueryRefresh();
  const formModal = useModal();
  const deleteModal = useModal();
  const detailsModal = useModal();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await api.get("/transactions");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      toast.success("Transaction supprimée avec succès");
      invalidateQueries(["transactions"]);
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

  const formatMontant = (montant, type) => {
    const formattedAmount = montant.toLocaleString() + " FCFA";
    return (
      <span className={type === "entree" ? "text-green-600" : "text-red-600"}>
        {type === "entree" ? "+" : "-"} {formattedAmount}
      </span>
    );
  };

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (row) => formatDate(row.date),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.type === "entree"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.type === "entree" ? "Entrée" : "Sortie"}
        </span>
      ),
    },
    {
      key: "categorie",
      header: "Catégorie",
      render: (row) => {
        const categories = {
          paiement_client: "Paiement client",
          achat_materiaux: "Achat matériaux",
          salaire_ouvriers: "Salaire ouvriers",
          salaire_personnel: "Salaire personnel",
          logement_ouvriers: "Logement ouvriers",
          gardiennage: "Gardiennage",
          transport: "Transport",
          location_materiel: "Location matériel",
          divers: "Divers",
        };
        return categories[row.categorie] || row.categorie;
      },
    },
    {
      key: "projet",
      header: "Projet",
      render: (row) => row.projet?.nom || "Non spécifié",
    },
    {
      key: "montant",
      header: "Montant",
      render: (row) => formatMontant(row.montant, row.type),
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
        <h1 className="text-2xl font-bold">Transactions financières</h1>
        <Button onClick={() => formModal.openModal(null)}>
          <Plus size={18} className="mr-2" /> Nouvelle transaction
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Table
          columns={columns}
          data={transactions}
          onRowClick={(row) => detailsModal.openModal(row)}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de création/modification */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={
          formModal.data ? "Modifier la transaction" : "Nouvelle transaction"
        }
      >
        <TransactionForm
          initialData={formModal.data}
          onSuccess={() => {
            invalidateQueries(["transactions"]);
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
            Êtes-vous sûr de vouloir supprimer cette transaction{" "}
            {deleteModal.data?.type === "entree" ? "d'entrée" : "de sortie"} de{" "}
            {deleteModal.data?.montant?.toLocaleString()} FCFA ?
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
        title="Détails de la transaction"
      >
        {detailsModal.data && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p
                  className={`font-medium ${
                    detailsModal.data.type === "entree"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {detailsModal.data.type === "entree" ? "Entrée" : "Sortie"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {formatDate(detailsModal.data.date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Montant</p>
                <p
                  className={`font-medium ${
                    detailsModal.data.type === "entree"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {detailsModal.data.type === "entree" ? "+" : "-"}{" "}
                  {detailsModal.data.montant.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Catégorie</p>
                <p className="font-medium">
                  {{
                    paiement_client: "Paiement client",
                    achat_materiaux: "Achat matériaux",
                    salaire_ouvriers: "Salaire ouvriers",
                    salaire_personnel: "Salaire personnel",
                    logement_ouvriers: "Logement ouvriers",
                    gardiennage: "Gardiennage",
                    transport: "Transport",
                    location_materiel: "Location matériel",
                    divers: "Divers",
                  }[detailsModal.data.categorie] || detailsModal.data.categorie}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Projet</p>
                <p className="font-medium">
                  {detailsModal.data.projet?.nom || "Non spécifié"}
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
              {detailsModal.data.referencePiece && (
                <div>
                  <p className="text-sm text-gray-500">Référence</p>
                  <p className="font-medium">
                    {detailsModal.data.referencePiece}
                  </p>
                </div>
              )}
              {detailsModal.data.beneficiaire && (
                <div>
                  <p className="text-sm text-gray-500">Bénéficiaire</p>
                  <p className="font-medium">
                    {detailsModal.data.beneficiaire}
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

export default TransactionsList;
