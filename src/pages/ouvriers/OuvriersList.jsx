// src/pages/ouvriers/OuvriersList.jsx
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { useQueryRefresh } from "../../hooks/useQueryRefresh";
import { useModal } from "../../hooks/useModal";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import OuvrierForm from "./OuvrierForm";
import Loader from "../../components/ui/Loader";
import Eye from "../../components/icons/Eye";
import Pen from "../../components/icons/Pen";
import Trash from "../../components/icons/Trash";
import Plus from "../../components/icons/Plus";
const OuvriersList = () => {
  const { invalidateQueries } = useQueryRefresh();
  const formModal = useModal();
  const deleteModal = useModal();
  const detailsModal = useModal();

  const { data: ouvriers, isLoading } = useQuery({
    queryKey: ["ouvriers"],
    queryFn: async () => {
      const response = await api.get("/ouvriers");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/ouvriers/${id}`);
    },
    onSuccess: () => {
      toast.success("Ouvrier supprimé avec succès");
      invalidateQueries(["ouvriers"]);
      deleteModal.closeModal();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    },
  });

  const columns = [
    {
      key: "nomComplet",
      header: "Nom complet",
      render: (row) => `${row.prenom} ${row.nom}`,
    },
    {
      key: "metier",
      header: "Métier",
      render: (row) => {
        const metiers = {
          macon: "Maçon",
          manoeuvre: "Manœuvre",
          coffreur: "Coffreur",
          ferrailleur: "Ferrailleur",
          electricien: "Électricien",
          plombier: "Plombier",
          peintre: "Peintre",
          carreleur: "Carreleur",
          platrier: "Plâtrier",
          menuisier_alu: "Menuisier Alu",
          menuisier_bois: "Menuisier Bois",
          menuisier_metallique: "Menuisier Métallique",
        };
        return metiers[row.metier] || row.metier;
      },
    },
    {
      key: "disponible",
      header: "Disponibilité",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.disponible
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.disponible ? "Disponible" : "Non disponible"}
        </span>
      ),
    },
    {
      key: "tauxJournalier",
      header: "Taux journalier",
      render: (row) => `${row.tauxJournalier.toLocaleString()} FCFA`,
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
        <h1 className="text-2xl font-bold">Liste des Ouvriers</h1>
        <Button onClick={() => formModal.openModal(null)}>
          <Plus size={18} className="mr-2" /> Ajouter un ouvrier
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Table
          columns={columns}
          data={ouvriers}
          onRowClick={(row) => detailsModal.openModal(row)}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de création/modification */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={formModal.data ? "Modifier un ouvrier" : "Ajouter un ouvrier"}
      >
        <OuvrierForm
          initialData={formModal.data}
          onSuccess={() => {
            invalidateQueries(["ouvriers"]);
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
            Êtes-vous sûr de vouloir supprimer l'ouvrier "
            {deleteModal.data?.prenom} {deleteModal.data?.nom}" ?
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
        title="Détails de l'ouvrier"
      >
        {detailsModal.data && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">{detailsModal.data.nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prénom</p>
                <p className="font-medium">{detailsModal.data.prenom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Métier</p>
                <p className="font-medium">
                  {{
                    macon: "Maçon",
                    manoeuvre: "Manœuvre",
                    coffreur: "Coffreur",
                    ferrailleur: "Ferrailleur",
                    electricien: "Électricien",
                    plombier: "Plombier",
                    peintre: "Peintre",
                    carreleur: "Carreleur",
                    platrier: "Plâtrier",
                    menuisier_alu: "Menuisier Alu",
                    menuisier_bois: "Menuisier Bois",
                    menuisier_metallique: "Menuisier Métallique",
                  }[detailsModal.data.metier] || detailsModal.data.metier}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium">
                  {detailsModal.data.telephone || "Non renseigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Taux journalier</p>
                <p className="font-medium">
                  {detailsModal.data.tauxJournalier.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date d'embauche</p>
                <p className="font-medium">
                  {new Date(
                    detailsModal.data.dateEmbauche
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      detailsModal.data.disponible
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {detailsModal.data.disponible
                      ? "Disponible"
                      : "Non disponible"}
                  </span>
                </p>
              </div>
            </div>

            {detailsModal.data.competences &&
              detailsModal.data.competences.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailsModal.data.competences.map((competence, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                      >
                        {competence}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {detailsModal.data.projetsActuels &&
              detailsModal.data.projetsActuels.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Projets actuels</h3>
                  <p className="text-gray-600">
                    Affecté à {detailsModal.data.projetsActuels.length}{" "}
                    projet(s)
                  </p>
                </div>
              )}

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

export default OuvriersList;
