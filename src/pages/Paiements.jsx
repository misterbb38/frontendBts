// import { useState, useEffect } from "react";
// import {
//   CreditCard,
//   AlertCircle,
//   DollarSign,
//   Calendar,
//   Users,
// } from "lucide-react";
// import api from "../api";
// import ResourceTable from "../ResourceTable";
// import ResourceForm from "../ResourceForm";

// const Paiements = () => {
//   const [paiements, setPaiements] = useState([]);
//   const [ouvriers, setOuvriers] = useState([]);
//   const [projets, setProjets] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [currentPaiement, setCurrentPaiement] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [filtres, setFiltres] = useState({
//     projet: "",
//     ouvrier: "",
//     mois: "",
//   });

//   // Chargement initial des données
//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const [paiementsData, ouvriersData, projetsData, usersData] =
//           await Promise.all([
//             api.get("/paiements"),
//             api.get("/ouvriers"),
//             api.get("/projets"),
//             api.get("/users"),
//           ]);

//         setPaiements(paiementsData);
//         setOuvriers(ouvriersData);
//         setProjets(projetsData);
//         setUsers(usersData);
//       } catch (err) {
//         console.error("Erreur lors du chargement des données:", err);
//         setError(
//           "Impossible de charger les paiements. Veuillez réessayer plus tard."
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Ajouter un nouveau paiement
//   const handleAddPaiement = () => {
//     setCurrentPaiement(null);
//     setShowForm(true);
//   };

//   // Éditer un paiement
//   const handleEditPaiement = (paiement) => {
//     setCurrentPaiement(paiement);
//     setShowForm(true);
//   };

//   // Soumettre le formulaire (création ou édition)
//   const handleSubmitForm = async (formData) => {
//     setIsSubmitting(true);
//     setError(null);

//     try {
//       if (currentPaiement) {
//         // Mise à jour
//         await api.put(`/paiements/${currentPaiement._id}`, formData);
//       } else {
//         // Création
//         await api.post("/paiements", formData);
//       }

//       // Recharger la liste
//       const newPaiements = await api.get("/paiements");
//       setPaiements(newPaiements);
//       setShowForm(false);
//     } catch (err) {
//       console.error("Erreur lors de la sauvegarde:", err);
//       setError(
//         "Impossible de sauvegarder le paiement. Veuillez vérifier les données."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Mise à jour des filtres
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFiltres((prev) => ({ ...prev, [name]: value }));
//   };

//   // Réinitialiser les filtres
//   const resetFiltres = () => {
//     setFiltres({
//       projet: "",
//       ouvrier: "",
//       mois: "",
//     });
//   };

//   // Filtrer les paiements
//   const paiementsFiltres = paiements.filter((paiement) => {
//     if (filtres.projet && paiement.projet?._id !== filtres.projet) return false;
//     if (filtres.ouvrier && paiement.ouvrier?._id !== filtres.ouvrier)
//       return false;
//     if (filtres.mois) {
//       const date = new Date(paiement.datePaiement);
//       const moisAnnee = `${date.getFullYear()}-${String(
//         date.getMonth() + 1
//       ).padStart(2, "0")}`;
//       if (moisAnnee !== filtres.mois) return false;
//     }
//     return true;
//   });

//   // Générer la liste des mois disponibles
//   const getMoisDisponibles = () => {
//     const mois = new Set();

//     paiements.forEach((paiement) => {
//       if (paiement.datePaiement) {
//         const date = new Date(paiement.datePaiement);
//         const moisAnnee = `${date.getFullYear()}-${String(
//           date.getMonth() + 1
//         ).padStart(2, "0")}`;
//         mois.add(moisAnnee);
//       }
//     });

//     return Array.from(mois)
//       .sort()
//       .map((moisAnnee) => {
//         const [annee, mois] = moisAnnee.split("-");
//         const nomMois = new Date(
//           annee,
//           parseInt(mois) - 1,
//           1
//         ).toLocaleDateString("fr-FR", { month: "long" });
//         return {
//           value: moisAnnee,
//           label: `${nomMois} ${annee}`,
//         };
//       });
//   };

//   // Définition des colonnes du tableau
//   const fields = [
//     {
//       key: "ouvrier",
//       label: "Ouvrier",
//       sortable: true,
//       render: (item) => {
//         const ouv = item.ouvrier;
//         return ouv ? `${ouv.prenom} ${ouv.nom}` : "N/A";
//       },
//     },
//     {
//       key: "projet",
//       label: "Projet",
//       sortable: true,
//       render: (item) => {
//         const proj = item.projet;
//         return proj ? proj.nom : "N/A";
//       },
//     },
//     {
//       key: "montant",
//       label: "Montant",
//       sortable: true,
//       render: (item) => formatCurrency(item.montant),
//     },
//     {
//       key: "datePaiement",
//       label: "Date de paiement",
//       sortable: true,
//       render: (item) => formatDate(item.datePaiement),
//     },
//     {
//       key: "periode",
//       label: "Période",
//       sortable: false,
//       render: (item) =>
//         `${formatDate(item.periode?.debut)} au ${formatDate(
//           item.periode?.fin
//         )}`,
//     },
//     { key: "nombreJours", label: "Jours", sortable: true },
//     {
//       key: "modePaiement",
//       label: "Mode",
//       sortable: true,
//       render: (item) => formatModePaiement(item.modePaiement),
//     },
//     {
//       key: "statut",
//       label: "Statut",
//       sortable: true,
//       render: (item) => (
//         <span
//           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
//             item.statut
//           )}`}
//         >
//           {formatStatut(item.statut)}
//         </span>
//       ),
//     },
//     {
//       key: "effectuePar",
//       label: "Effectué par",
//       sortable: false,
//       render: (item) => {
//         const user = item.effectuePar;
//         return user ? `${user.prenom} ${user.nom}` : "N/A";
//       },
//     },
//   ];

//   // Schéma du formulaire d'ajout/édition de paiement
//   const paiementSchema = [
//     {
//       name: "ouvrier",
//       label: "Ouvrier",
//       type: "select",
//       required: true,
//       options: ouvriers.map((o) => ({
//         value: o._id,
//         label: `${o.prenom} ${o.nom} (${formatMetier(o.metier)})`,
//       })),
//     },
//     {
//       name: "projet",
//       label: "Projet",
//       type: "select",
//       required: true,
//       options: projets.map((p) => ({
//         value: p._id,
//         label: p.nom,
//       })),
//     },
//     { name: "montant", label: "Montant (XOF)", type: "number", required: true },
//     {
//       name: "datePaiement",
//       label: "Date de paiement",
//       type: "date",
//       required: true,
//     },
//     {
//       name: "periode.debut",
//       label: "Début de période",
//       type: "date",
//       required: true,
//     },
//     {
//       name: "periode.fin",
//       label: "Fin de période",
//       type: "date",
//       required: true,
//     },
//     {
//       name: "nombreJours",
//       label: "Nombre de jours",
//       type: "number",
//       required: true,
//     },
//     {
//       name: "tauxJournalier",
//       label: "Taux journalier (XOF)",
//       type: "number",
//       required: true,
//     },
//     {
//       name: "modePaiement",
//       label: "Mode de paiement",
//       type: "select",
//       required: true,
//       options: [
//         { value: "espece", label: "Espèce" },
//         { value: "cheque", label: "Chèque" },
//         { value: "virement", label: "Virement" },
//         { value: "mobile_money", label: "Mobile Money" },
//       ],
//     },
//     { name: "reference", label: "Référence du paiement", type: "text" },
//     {
//       name: "statut",
//       label: "Statut",
//       type: "select",
//       required: true,
//       options: [
//         { value: "en_attente", label: "En attente" },
//         { value: "complete", label: "Complété" },
//         { value: "annule", label: "Annulé" },
//       ],
//     },
//     {
//       name: "effectuePar",
//       label: "Effectué par",
//       type: "select",
//       required: true,
//       options: users.map((u) => ({
//         value: u._id,
//         label: `${u.prenom} ${u.nom}`,
//       })),
//     },
//     { name: "commentaire", label: "Commentaire", type: "textarea" },
//   ];

//   // Fonctions utilitaires de formatage
//   const formatMetier = (metier) => {
//     const formats = {
//       macon: "Maçon",
//       manoeuvre: "Manœuvre",
//       coffreur: "Coffreur",
//       ferrailleur: "Ferrailleur",
//       electricien: "Électricien",
//       plombier: "Plombier",
//       peintre: "Peintre",
//       carreleur: "Carreleur",
//       platrier: "Plâtrier",
//       menuisier_alu: "Menuisier Aluminium",
//       menuisier_bois: "Menuisier Bois",
//       menuisier_metallique: "Menuisier Métallique",
//     };
//     return formats[metier] || metier;
//   };

//   const formatModePaiement = (mode) => {
//     const formats = {
//       espece: "Espèce",
//       cheque: "Chèque",
//       virement: "Virement",
//       mobile_money: "Mobile Money",
//     };
//     return formats[mode] || mode;
//   };

//   const formatStatut = (statut) => {
//     const formats = {
//       en_attente: "En attente",
//       complete: "Complété",
//       annule: "Annulé",
//     };
//     return formats[statut] || statut;
//   };

//   const getStatusColor = (statut) => {
//     const colors = {
//       en_attente: "bg-yellow-100 text-yellow-800",
//       complete: "bg-green-100 text-green-800",
//       annule: "bg-red-100 text-red-800",
//     };
//     return colors[statut] || "bg-gray-100 text-gray-800";
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat("fr-FR", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     }).format(date);
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return "0 XOF";
//     return new Intl.NumberFormat("fr-FR", {
//       style: "currency",
//       currency: "XOF",
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   // Calcul des statistiques
//   const statsTotal = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
//   const statsMoisCourant = paiements
//     .filter((p) => {
//       const date = new Date(p.datePaiement);
//       const maintenant = new Date();
//       return (
//         date.getMonth() === maintenant.getMonth() &&
//         date.getFullYear() === maintenant.getFullYear()
//       );
//     })
//     .reduce((sum, p) => sum + (p.montant || 0), 0);
//   const statsNbPaiements = paiements.length;

//   return (
//     <div className="space-y-6">
//       <div className="sm:flex sm:items-center sm:justify-between">
//         <div className="flex items-center">
//           <CreditCard className="h-6 w-6 text-primary mr-2" />
//           <h1 className="text-2xl font-bold text-gray-800">
//             Gestion des Paiements
//           </h1>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 p-4 rounded-lg">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <AlertCircle className="h-5 w-5 text-red-400" />
//             </div>
//             <div className="ml-3">
//               <h3 className="text-sm font-medium text-red-800">
//                 Une erreur est survenue
//               </h3>
//               <div className="mt-2 text-sm text-red-700">
//                 <p>{error}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Statistiques rapides */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h2 className="text-sm font-medium text-gray-600">Total payé</h2>
//               <p className="text-3xl font-bold text-gray-800">
//                 {formatCurrency(statsTotal)}
//               </p>
//             </div>
//             <DollarSign className="h-12 w-12 text-green-500" />
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h2 className="text-sm font-medium text-gray-600">
//                 Mois courant
//               </h2>
//               <p className="text-3xl font-bold text-gray-800">
//                 {formatCurrency(statsMoisCourant)}
//               </p>
//             </div>
//             <Calendar className="h-12 w-12 text-blue-500" />
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h2 className="text-sm font-medium text-gray-600">
//                 Nombre de paiements
//               </h2>
//               <p className="text-3xl font-bold text-gray-800">
//                 {statsNbPaiements}
//               </p>
//             </div>
//             <Users className="h-12 w-12 text-purple-500" />
//           </div>
//         </div>
//       </div>

//       {/* Filtres */}
//       <div className="bg-white shadow rounded-lg p-6">
//         <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label
//               htmlFor="ouvrier"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Ouvrier
//             </label>
//             <select
//               id="ouvrier"
//               name="ouvrier"
//               value={filtres.ouvrier}
//               onChange={handleFilterChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
//             >
//               <option value="">Tous les ouvriers</option>
//               {ouvriers.map((o) => (
//                 <option key={o._id} value={o._id}>
//                   {o.prenom} {o.nom}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label
//               htmlFor="projet"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Projet
//             </label>
//             <select
//               id="projet"
//               name="projet"
//               value={filtres.projet}
//               onChange={handleFilterChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
//             >
//               <option value="">Tous les projets</option>
//               {projets.map((p) => (
//                 <option key={p._id} value={p._id}>
//                   {p.nom}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label
//               htmlFor="mois"
//               className="block text-sm font-medium text-gray-700"
//             >
//               Mois
//             </label>
//             <select
//               id="mois"
//               name="mois"
//               value={filtres.mois}
//               onChange={handleFilterChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
//             >
//               <option value="">Tous les mois</option>
//               {getMoisDisponibles().map((m) => (
//                 <option key={m.value} value={m.value}>
//                   {m.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={resetFiltres}
//             className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
//           >
//             Réinitialiser les filtres
//           </button>
//         </div>
//       </div>

//       <ResourceTable
//         title="Liste des paiements"
//         fields={fields}
//         data={paiementsFiltres}
//         onEdit={handleEditPaiement}
//         onAdd={handleAddPaiement}
//         isLoading={isLoading}
//         noDataMessage="Aucun paiement enregistré"
//       />

//       {/* Formulaire d'ajout/édition de paiement */}
//       <ResourceForm
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         title={currentPaiement ? "Modifier le paiement" : "Ajouter un paiement"}
//         schema={paiementSchema}
//         initialData={
//           currentPaiement || {
//             datePaiement: new Date().toISOString().split("T")[0],
//             statut: "en_attente",
//           }
//         }
//         onSubmit={handleSubmitForm}
//         isSubmitting={isSubmitting}
//       />
//     </div>
//   );
// };

// export default Paiements;

import { useState, useEffect } from "react";
import {
  CreditCard,
  AlertCircle,
  DollarSign,
  Calendar,
  Users,
} from "lucide-react";
import api from "../api";
import ResourceTable from "../ResourceTable";
import ResourceForm from "../ResourceForm";

const Paiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [ouvriers, setOuvriers] = useState([]);
  const [projets, setProjets] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPaiement, setCurrentPaiement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filtres, setFiltres] = useState({
    projet: "",
    ouvrier: "",
    mois: "",
  });

  // Fonctions utilitaires de formatage - DÉPLACÉES ICI AVANT LEUR UTILISATION
  const formatMetier = (metier) => {
    const formats = {
      macon: "Maçon",
      manoeuvre: "Manœuvre",
      coffreur: "Coffreur",
      ferrailleur: "Ferrailleur",
      electricien: "Électricien",
      plombier: "Plombier",
      peintre: "Peintre",
      carreleur: "Carreleur",
      platrier: "Plâtrier",
      menuisier_alu: "Menuisier Aluminium",
      menuisier_bois: "Menuisier Bois",
      menuisier_metallique: "Menuisier Métallique",
    };
    return formats[metier] || metier;
  };

  const formatModePaiement = (mode) => {
    const formats = {
      espece: "Espèce",
      cheque: "Chèque",
      virement: "Virement",
      mobile_money: "Mobile Money",
    };
    return formats[mode] || mode;
  };

  const formatStatut = (statut) => {
    const formats = {
      en_attente: "En attente",
      complete: "Complété",
      annule: "Annulé",
    };
    return formats[statut] || statut;
  };

  const getStatusColor = (statut) => {
    const colors = {
      en_attente: "bg-yellow-100 text-yellow-800",
      complete: "bg-green-100 text-green-800",
      annule: "bg-red-100 text-red-800",
    };
    return colors[statut] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 XOF";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [paiementsData, ouvriersData, projetsData, usersData] =
          await Promise.all([
            api.get("/paiements"),
            api.get("/ouvriers"),
            api.get("/projets"),
            api.get("/users"),
          ]);

        setPaiements(paiementsData);
        setOuvriers(ouvriersData);
        setProjets(projetsData);
        setUsers(usersData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          "Impossible de charger les paiements. Veuillez réessayer plus tard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Ajouter un nouveau paiement
  const handleAddPaiement = () => {
    setCurrentPaiement(null);
    setShowForm(true);
  };

  // Éditer un paiement
  const handleEditPaiement = (paiement) => {
    setCurrentPaiement(paiement);
    setShowForm(true);
  };

  // Soumettre le formulaire (création ou édition)
  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Convertir les valeurs numériques
      const preparedData = {
        ...formData,
        montant: Number(formData.montant),
        nombreJours: Number(formData.nombreJours),
        tauxJournalier: Number(formData.tauxJournalier),
      };

      if (currentPaiement) {
        // Mise à jour
        await api.put(`/paiements/${currentPaiement._id}`, preparedData);
      } else {
        // Création
        await api.post("/paiements", preparedData);
      }

      // Recharger la liste
      const newPaiements = await api.get("/paiements");
      setPaiements(newPaiements);
      setShowForm(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError(
        "Impossible de sauvegarder le paiement. Veuillez vérifier les données."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mise à jour des filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltres((prev) => ({ ...prev, [name]: value }));
  };

  // Réinitialiser les filtres
  const resetFiltres = () => {
    setFiltres({
      projet: "",
      ouvrier: "",
      mois: "",
    });
  };

  // Filtrer les paiements
  const paiementsFiltres = paiements.filter((paiement) => {
    if (filtres.projet && paiement.projet?._id !== filtres.projet) return false;
    if (filtres.ouvrier && paiement.ouvrier?._id !== filtres.ouvrier)
      return false;
    if (filtres.mois) {
      const date = new Date(paiement.datePaiement);
      const moisAnnee = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (moisAnnee !== filtres.mois) return false;
    }
    return true;
  });

  // Générer la liste des mois disponibles
  const getMoisDisponibles = () => {
    const mois = new Set();

    paiements.forEach((paiement) => {
      if (paiement.datePaiement) {
        const date = new Date(paiement.datePaiement);
        const moisAnnee = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        mois.add(moisAnnee);
      }
    });

    return Array.from(mois)
      .sort()
      .map((moisAnnee) => {
        const [annee, mois] = moisAnnee.split("-");
        const nomMois = new Date(
          annee,
          parseInt(mois) - 1,
          1
        ).toLocaleDateString("fr-FR", { month: "long" });
        return {
          value: moisAnnee,
          label: `${nomMois} ${annee}`,
        };
      });
  };

  // Définition des colonnes du tableau
  const fields = [
    {
      key: "ouvrier",
      label: "Ouvrier",
      sortable: true,
      render: (item) => {
        const ouv = item.ouvrier;
        return ouv ? `${ouv.prenom} ${ouv.nom}` : "N/A";
      },
    },
    {
      key: "projet",
      label: "Projet",
      sortable: true,
      render: (item) => {
        const proj = item.projet;
        return proj ? proj.nom : "N/A";
      },
    },
    {
      key: "montant",
      label: "Montant",
      sortable: true,
      render: (item) => formatCurrency(item.montant),
    },
    {
      key: "datePaiement",
      label: "Date de paiement",
      sortable: true,
      render: (item) => formatDate(item.datePaiement),
    },
    {
      key: "periode",
      label: "Période",
      sortable: false,
      render: (item) =>
        `${formatDate(item.periode?.debut)} au ${formatDate(
          item.periode?.fin
        )}`,
    },
    { key: "nombreJours", label: "Jours", sortable: true },
    {
      key: "modePaiement",
      label: "Mode",
      sortable: true,
      render: (item) => formatModePaiement(item.modePaiement),
    },
    {
      key: "statut",
      label: "Statut",
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            item.statut
          )}`}
        >
          {formatStatut(item.statut)}
        </span>
      ),
    },
    {
      key: "effectuePar",
      label: "Effectué par",
      sortable: false,
      render: (item) => {
        const user = item.effectuePar;
        return user ? `${user.prenom} ${user.nom}` : "N/A";
      },
    },
  ];

  // Schéma du formulaire d'ajout/édition de paiement
  const paiementSchema = [
    {
      name: "ouvrier",
      label: "Ouvrier",
      type: "select",
      required: true,
      options: ouvriers.map((o) => ({
        value: o._id,
        label: `${o.prenom} ${o.nom} (${formatMetier(o.metier)})`,
      })),
    },
    {
      name: "projet",
      label: "Projet",
      type: "select",
      required: true,
      options: projets.map((p) => ({
        value: p._id,
        label: p.nom,
      })),
    },
    { name: "montant", label: "Montant (XOF)", type: "number", required: true },
    {
      name: "datePaiement",
      label: "Date de paiement",
      type: "date",
      required: true,
    },
    {
      name: "periode.debut",
      label: "Début de période",
      type: "date",
      required: true,
    },
    {
      name: "periode.fin",
      label: "Fin de période",
      type: "date",
      required: true,
    },
    {
      name: "nombreJours",
      label: "Nombre de jours",
      type: "number",
      required: true,
    },
    {
      name: "tauxJournalier",
      label: "Taux journalier (XOF)",
      type: "number",
      required: true,
    },
    {
      name: "modePaiement",
      label: "Mode de paiement",
      type: "select",
      required: true,
      options: [
        { value: "espece", label: "Espèce" },
        { value: "cheque", label: "Chèque" },
        { value: "virement", label: "Virement" },
        { value: "mobile_money", label: "Mobile Money" },
      ],
    },
    { name: "reference", label: "Référence du paiement", type: "text" },
    {
      name: "statut",
      label: "Statut",
      type: "select",
      required: true,
      options: [
        { value: "en_attente", label: "En attente" },
        { value: "complete", label: "Complété" },
        { value: "annule", label: "Annulé" },
      ],
    },
    {
      name: "effectuePar",
      label: "Effectué par",
      type: "select",
      required: true,
      options: users.map((u) => ({
        value: u._id,
        label: `${u.prenom} ${u.nom}`,
      })),
    },
    { name: "commentaire", label: "Commentaire", type: "textarea" },
  ];

  // Calcul des statistiques
  const statsTotal = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
  const statsMoisCourant = paiements
    .filter((p) => {
      const date = new Date(p.datePaiement);
      const maintenant = new Date();
      return (
        date.getMonth() === maintenant.getMonth() &&
        date.getFullYear() === maintenant.getFullYear()
      );
    })
    .reduce((sum, p) => sum + (p.montant || 0), 0);
  const statsNbPaiements = paiements.length;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <CreditCard className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Paiements
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Une erreur est survenue
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">Total payé</h2>
              <p className="text-3xl font-bold text-gray-800">
                {formatCurrency(statsTotal)}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Mois courant
              </h2>
              <p className="text-3xl font-bold text-gray-800">
                {formatCurrency(statsMoisCourant)}
              </p>
            </div>
            <Calendar className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Nombre de paiements
              </h2>
              <p className="text-3xl font-bold text-gray-800">
                {statsNbPaiements}
              </p>
            </div>
            <Users className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="ouvrier"
              className="block text-sm font-medium text-gray-700"
            >
              Ouvrier
            </label>
            <select
              id="ouvrier"
              name="ouvrier"
              value={filtres.ouvrier}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Tous les ouvriers</option>
              {ouvriers.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.prenom} {o.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="projet"
              className="block text-sm font-medium text-gray-700"
            >
              Projet
            </label>
            <select
              id="projet"
              name="projet"
              value={filtres.projet}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Tous les projets</option>
              {projets.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="mois"
              className="block text-sm font-medium text-gray-700"
            >
              Mois
            </label>
            <select
              id="mois"
              name="mois"
              value={filtres.mois}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="">Tous les mois</option>
              {getMoisDisponibles().map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFiltres}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <ResourceTable
        title="Liste des paiements"
        fields={fields}
        data={paiementsFiltres}
        onEdit={handleEditPaiement}
        onAdd={handleAddPaiement}
        isLoading={isLoading}
        noDataMessage="Aucun paiement enregistré"
      />

      {/* Formulaire d'ajout/édition de paiement */}
      <ResourceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={currentPaiement ? "Modifier le paiement" : "Ajouter un paiement"}
        schema={paiementSchema}
        initialData={
          currentPaiement || {
            datePaiement: new Date().toISOString().split("T")[0],
            statut: "en_attente",
          }
        }
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Paiements;
