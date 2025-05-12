// src/pages/register/Register.jsx
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";

const schema = yup.object().shape({
  nom: yup.string().required("Nom requis"),
  prenom: yup.string().required("Prénom requis"),
  email: yup.string().email("Email invalide").required("Email requis"),
  password: yup
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .required("Mot de passe requis"),
  confirmPassword: yup
    .string()
    .oneOf(
      [yup.ref("password"), null],
      "Les mots de passe doivent correspondre"
    )
    .required("Confirmation du mot de passe requise"),
  role: yup.string().required("Rôle requis"),
  telephone: yup.string(),
});

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
      telephone: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Supprimer le champ confirmPassword avant d'envoyer au serveur
      const { confirmPassword, ...userData } = data;

      const result = await registerUser(userData);
      if (result.success) {
        toast.success("Inscription réussie");
        navigate("/projets");
      } else {
        toast.error(result.error || "Échec de l'inscription");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    }
  };

  const roles = [
    { value: "admin", label: "Administrateur" },
    { value: "directeur", label: "Directeur" },
    { value: "secretaire", label: "Secrétaire" },
    { value: "comptable", label: "Comptable" },
    { value: "ingenieur", label: "Ingénieur" },
    { value: "technicien", label: "Technicien" },
    { value: "chef_chantier", label: "Chef de chantier" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inscription
          </h2>
        </div>
        <FormProvider {...methods}>
          <form
            className="mt-8 space-y-6"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-2 gap-4">
              <Field name="nom" label="Nom" placeholder="Votre nom" required />
              <Field
                name="prenom"
                label="Prénom"
                placeholder="Votre prénom"
                required
              />
            </div>
            <Field
              name="email"
              label="Email"
              type="email"
              placeholder="Votre email"
              required
            />
            <Field
              name="telephone"
              label="Téléphone"
              placeholder="Votre numéro de téléphone"
            />
            <Field name="role" label="Rôle" type="select" required>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Field>
            <Field
              name="password"
              label="Mot de passe"
              type="password"
              placeholder="Votre mot de passe"
              required
            />
            <Field
              name="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              placeholder="Confirmez votre mot de passe"
              required
            />
            <div>
              <Button type="submit" variant="primary" className="w-full">
                S'inscrire
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default Register;
