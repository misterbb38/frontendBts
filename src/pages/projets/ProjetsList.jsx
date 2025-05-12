// src/pages/projets/ProjetsList.jsx
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { useQueryRefresh } from "../../hooks/useQueryRefresh";
import { useModal } from "../../hooks/useModal";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Loader from "../../components/ui/Loader";
import Eye from "../../components/icons/Eye";
import Pen from "../../components/icons/Pen";
import Trash from "../../components/icons/Trash";
import Plus from "../../components/icons/Plus";
const ProjetsList = () => {
  const navigate = useNavigate();
  const { invalidateQueries } = useQueryRefresh();
  const deleteModal = useModal();

  const { data: projets, isLoading } = useQuery({
    queryKey: ["projets"],
    queryFn: async () => {
      const response = await api.get("/projets");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/projets/${id}`);
    },
    onSuccess: () => {
      toast.success("Projet supprimé avec succès");
      invalidateQueries(["projets"]);
      deleteModal.closeModal();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    },
  });

  const getStatusBadge = (statut) => {
    const statusConfig = {
      planifie: { bg: "bg-blue-100", text: "text-blue-800", label: "Planifié" },
      en_cours: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "En cours",
      },
      en_pause: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "En pause",
      },
      termine: { bg: "bg-gray-100", text: "text-gray-800", label: "Terminé" },
      annule: { bg: "bg-red-100", text: "text-red-800", label: "Annulé" },
    };

    const config = statusConfig[statut] || statusConfig.planifie;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const columns = [
    { key: "nom", header: "Nom du projet" },
    { key: "lieu", header: "Lieu" },
    {
      key: "client",
      header: "Client",
      render: (row) =>
        row.client
          ? `${row.client.prenom || ""} ${row.client.nom || ""}`.trim()
          : "-",
    },
    {
      key: "dates",
      header: "Période",
      render: (row) => (
        <span>
          {new Date(row.dateDebut).toLocaleDateString()} -{" "}
          {new Date(row.dateFin).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      render: (row) => getStatusBadge(row.statut),
    },
    {
      key: "budget",
      header: "Budget",
      render: (row) => (
        <span>
          {row.budget?.montantRecu?.toLocaleString() || 0} /{" "}
          {row.budget?.montantTotal?.toLocaleString() || 0} FCFA
        </span>
      ),
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
              navigate(`/projets/${row._id}`);
            }}
          >
            <Eye size={16} className="mr-1" /> Détails
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projets/${row._id}`);
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
        <h1 className="text-2xl font-bold">Liste des Projets</h1>
        <Button onClick={() => navigate("/projets/new")}>
          <Plus size={18} className="mr-2" /> Nouveau projet
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Table
          columns={columns}
          data={projets}
          onRowClick={(row) => navigate(`/projets/${row._id}`)}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de suppression */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        title="Confirmer la suppression"
      >
        <div className="p-4">
          <p className="mb-4">
            Êtes-vous sûr de vouloir supprimer le projet "
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
    </div>
  );
};

export default ProjetsList;
