// src/pages/login/Login.jsx
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
  email: yup.string().email("Email invalide").required("Email requis"),
  password: yup.string().required("Mot de passe requis"),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data);
      if (result.success) {
        toast.success("Connexion réussie");
        navigate("/projets");
      } else {
        toast.error(result.error || "Échec de la connexion");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion
          </h2>
        </div>
        <FormProvider {...methods}>
          <form
            className="mt-8 space-y-6"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <Field
              name="email"
              label="Email"
              type="email"
              placeholder="Votre email"
              required
            />
            <Field
              name="password"
              label="Mot de passe"
              type="password"
              placeholder="Votre mot de passe"
              required
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Se souvenir de moi
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Mot de passe oublié?
                </a>
              </div>
            </div>
            <div>
              <Button type="submit" variant="primary" className="w-full">
                Se connecter
              </Button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  S'inscrire
                </Link>
              </p>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default Login;
