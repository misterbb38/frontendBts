// src/pages/taches/TachesList.jsx
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import api from "../../lib/api";
import { useQueryRefresh } from "../../hooks/useQueryRefresh";
import { useModal } from "../../hooks/useModal";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import TacheForm from "./TacheForm";
import Loader from "../../components/ui/Loader";
import Eye from "../../components/icons/Eye";
import Pen from "../../components/icons/Pen";
import Trash from "../../components/icons/Trash";
import Plus from "../../components/icons/Plus";

const TachesList = () => {
  const { invalidateQueries } = useQueryRefresh();
  const formModal = useModal();
  const deleteModal = useModal();
  const statusModal = useModal();
  const detailsModal = useModal();

  const { data: taches, isLoading } = useQuery({
    queryKey: ["taches"],
    queryFn: async () => {
      const response = await api.get("/taches");
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/taches/${id}`);
    },
    onSuccess: () => {
      toast.success("Tâche supprimée avec succès");
      invalidateQueries(["taches"]);
      deleteModal.closeModal();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, statut }) => {
      return await api.put(`/taches/${id}/statut`, { statut });
    },
    onSuccess: () => {
      toast.success("Statut mis à jour avec succès");
      invalidateQueries(["taches"]);
      statusModal.closeModal();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour"
      );
    },
  });

  const getStatusBadge = (statut) => {
    const statusConfig = {
      a_faire: { bg: "bg-gray-100", text: "text-gray-800", label: "À faire" },
      en_cours: { bg: "bg-blue-100", text: "text-blue-800", label: "En cours" },
      termine: { bg: "bg-green-100", text: "text-green-800", label: "Terminé" },
      en_retard: { bg: "bg-red-100", text: "text-red-800", label: "En retard" },
    };

    const config = statusConfig[statut] || statusConfig.a_faire;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priorite) => {
    const priorityConfig = {
      basse: { bg: "bg-gray-100", text: "text-gray-800", label: "Basse" },
      moyenne: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Moyenne",
      },
      haute: { bg: "bg-red-100", text: "text-red-800", label: "Haute" },
    };

    const config = priorityConfig[priorite] || priorityConfig.moyenne;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const columns = [
    { key: "titre", header: "Titre" },
    {
      key: "projet",
      header: "Projet",
      render: (row) => row.projet?.nom || "Non assigné",
    },
    {
      key: "dates",
      header: "Période",
      render: (row) => (
        <div className="text-sm">
          <div>{new Date(row.dateDebut).toLocaleDateString()}</div>
          <div>{new Date(row.dateFin).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      render: (row) => getStatusBadge(row.statut),
    },
    {
      key: "priorite",
      header: "Priorité",
      render: (row) => getPriorityBadge(row.priorite),
    },
    {
      key: "progression",
      header: "Progression",
      render: (row) => (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${row.progression}%` }}
          ></div>
        </div>
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
        <h1 className="text-2xl font-bold">Liste des Tâches</h1>
        <Button onClick={() => formModal.openModal(null)}>
          <Plus size={18} className="mr-2" /> Ajouter une tâche
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Table
          columns={columns}
          data={taches}
          onRowClick={(row) => detailsModal.openModal(row)}
          isLoading={isLoading}
        />
      </div>

      {/* Modal de création/modification */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.closeModal}
        title={formModal.data ? "Modifier une tâche" : "Ajouter une tâche"}
      >
        <TacheForm
          initialData={formModal.data}
          onSuccess={() => {
            invalidateQueries(["taches"]);
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
            Êtes-vous sûr de vouloir supprimer la tâche "
            {deleteModal.data?.titre}" ?
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

      {/* Modal de changement de statut */}
      <Modal
        isOpen={statusModal.isOpen}
        onClose={statusModal.closeModal}
        title="Changer le statut"
      >
        {statusModal.data && (
          <div className="p-4">
            <p className="mb-4">
              Changer le statut de la tâche "{statusModal.data.titre}"
            </p>
            <div className="space-y-4 mb-4">
              <div className="flex justify-between">
                <Button
                  variant={
                    statusModal.data.statut === "a_faire"
                      ? "primary"
                      : "outline"
                  }
                  onClick={() =>
                    statusMutation.mutate({
                      id: statusModal.data._id,
                      statut: "a_faire",
                    })
                  }
                >
                  À faire
                </Button>
                <Button
                  variant={
                    statusModal.data.statut === "en_cours"
                      ? "primary"
                      : "outline"
                  }
                  onClick={() =>
                    statusMutation.mutate({
                      id: statusModal.data._id,
                      statut: "en_cours",
                    })
                  }
                >
                  En cours
                </Button>
                <Button
                  variant={
                    statusModal.data.statut === "termine"
                      ? "primary"
                      : "outline"
                  }
                  onClick={() =>
                    statusMutation.mutate({
                      id: statusModal.data._id,
                      statut: "termine",
                    })
                  }
                >
                  Terminé
                </Button>
                <Button
                  variant={
                    statusModal.data.statut === "en_retard"
                      ? "primary"
                      : "outline"
                  }
                  onClick={() =>
                    statusMutation.mutate({
                      id: statusModal.data._id,
                      statut: "en_retard",
                    })
                  }
                >
                  En retard
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={statusModal.closeModal}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de détails */}
      <Modal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.closeModal}
        title="Détails de la tâche"
      >
        {detailsModal.data && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Titre</p>
                <p className="font-medium">{detailsModal.data.titre}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{detailsModal.data.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Projet</p>
                <p className="font-medium">
                  {detailsModal.data.projet?.nom || "Non assigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assigné à</p>
                <p className="font-medium">
                  {detailsModal.data.assigneA &&
                  detailsModal.data.assigneA.length > 0
                    ? detailsModal.data.assigneA
                        .map((u) => `${u.prenom} ${u.nom}`)
                        .join(", ")
                    : "Non assigné"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de début</p>
                <p className="font-medium">
                  {new Date(detailsModal.data.dateDebut).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de fin</p>
                <p className="font-medium">
                  {new Date(detailsModal.data.dateFin).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium">
                  {getStatusBadge(detailsModal.data.statut)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Priorité</p>
                <p className="font-medium">
                  {getPriorityBadge(detailsModal.data.priorite)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Progression</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${detailsModal.data.progression}%` }}
                    ></div>
                  </div>
                  <span>{detailsModal.data.progression}%</span>
                </div>
              </div>
            </div>

            {detailsModal.data.commentaires &&
              detailsModal.data.commentaires.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Commentaires</h3>
                  <div className="space-y-3">
                    {detailsModal.data.commentaires.map((commentaire, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium">
                            {commentaire.auteur?.prenom}{" "}
                            {commentaire.auteur?.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(commentaire.date).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm">{commentaire.texte}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  detailsModal.closeModal();
                  statusModal.openModal(detailsModal.data);
                }}
              >
                Changer le statut
              </Button>
              <Button onClick={detailsModal.closeModal}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TachesList;
