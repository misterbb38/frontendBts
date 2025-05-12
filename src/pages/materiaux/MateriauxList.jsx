// src/pages/materiaux/MateriauxList.jsx
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { useQueryRefresh } from "../../hooks/useQueryRefresh";
import { useModal } from "../../hooks/useModal";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import MateriauForm from "./MateriauForm";
import Loader from "../../components/ui/Loader";
import Eye from "../../components/icons/Eye";
import Pen from "../../components/icons/Pen";
import Trash from "../../components/icons/Trash";
import Plus from "../../components/icons/Plus";
const MateriauxList = () => {
  const { invalidateQueries } = useQueryRefresh();
  const formModal = useModal();
  const deleteModal = useModal();
  const detailsModal = useModal();

  const { data: materiaux, isLoading } = useQuery({
    queryKey: ["materiaux"],
    queryFn: async () => {
      const response = await api.get("/materiaux");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/materiaux/${id}`);
    },
    onSuccess: () => {
      toast.success("Matériau supprimé avec succès");
      invalidateQueries(["materiaux"]);
      deleteModal.closeModal();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    },
  });

  const columns = [
    { key: "nom", header: "Nom" },
    { key: "categorie", header: "Catégorie" },
    {
      key: "quantiteStock",
      header: "Quantité en stock",
      render: (row) => `${row.quantiteStock} ${row.unite}`,
    },
    {
      key: "prix",
      header: "Prix unitaire",
      render: (row) => `${row.prix || 0} FCFA`,
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
        <h1 className="text-2xl font-bold">Liste des Matériaux</h1>
        <Button onClick={() => formModal.openModal(null)}>
          <Plus size={18} className="mr-2" /> Ajouter un matériau
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Table
          columns={columns}
          data={materiaux}
          onRowClick={(row) => detailsModal.openModal(row)}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de création/modification */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={formModal.data ? "Modifier un matériau" : "Ajouter un matériau"}
      >
        <MateriauForm
          initialData={formModal.data}
          onSuccess={() => {
            invalidateQueries(["materiaux"]);
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
            Êtes-vous sûr de vouloir supprimer le matériau "
            {deleteModal.data?.nom}" ?
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
        title="Détails du matériau"
      >
        {detailsModal.data && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">{detailsModal.data.nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Catégorie</p>
                <p className="font-medium">{detailsModal.data.categorie}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantité en stock</p>
                <p className="font-medium">
                  {detailsModal.data.quantiteStock} {detailsModal.data.unite}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prix unitaire</p>
                <p className="font-medium">
                  {detailsModal.data.prix || "0"} FCFA
                </p>
              </div>
              {detailsModal.data.description && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">{detailsModal.data.description}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">
                Mouvements de stock récents
              </h3>
              {detailsModal.data.mouvements &&
              detailsModal.data.mouvements.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantité
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Projet
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailsModal.data.mouvements
                        .slice(0, 5)
                        .map((mouvement, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                  mouvement.type === "entree"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {mouvement.type === "entree"
                                  ? "Entrée"
                                  : "Sortie"}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {mouvement.quantite} {detailsModal.data.unite}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {new Date(mouvement.date).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {mouvement.projet ? "Projet lié" : "-"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">
                  Aucun mouvement de stock enregistré
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={detailsModal.closeModal}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MateriauxList;
