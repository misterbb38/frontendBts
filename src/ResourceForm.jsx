import { useState, useEffect } from "react";
import { X } from "lucide-react";

const ResourceForm = ({
  isOpen,
  onClose,
  title,
  schema,
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Réinitialiser le formulaire quand initialData change
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Gérer les différents types d'input
    const inputValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation basée sur le schéma
    const newErrors = {};
    let isValid = true;

    schema.forEach((field) => {
      // Vérifier les champs requis
      if (
        field.required &&
        (!formData[field.name] || formData[field.name] === "")
      ) {
        newErrors[field.name] = "Ce champ est requis";
        isValid = false;
      }

      // Validation personnalisée si présente
      if (field.validate && formData[field.name]) {
        const error = field.validate(formData[field.name], formData);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // Soumettre le formulaire si tout est valide
    onSubmit(formData);
  };

  // Fonction pour rendre le champ approprié selon son type
  const renderField = (field) => {
    const { name, label, type, options, placeholder, disabled } = field;

    switch (type) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "date":
        return (
          <input
            type={type}
            name={name}
            id={name}
            value={formData[name] || ""}
            onChange={handleChange}
            placeholder={placeholder || ""}
            disabled={disabled || isSubmitting}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
              errors[name] ? "border-red-500" : ""
            }`}
          />
        );

      case "select":
        return (
          <select
            name={name}
            id={name}
            value={formData[name] || ""}
            onChange={handleChange}
            disabled={disabled || isSubmitting}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
              errors[name] ? "border-red-500" : ""
            }`}
          >
            <option value="">Sélectionner...</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            name={name}
            id={name}
            value={formData[name] || ""}
            onChange={handleChange}
            placeholder={placeholder || ""}
            disabled={disabled || isSubmitting}
            rows={4}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
              errors[name] ? "border-red-500" : ""
            }`}
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            name={name}
            id={name}
            checked={formData[name] || false}
            onChange={handleChange}
            disabled={disabled || isSubmitting}
            className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${
              errors[name] ? "border-red-500" : ""
            }`}
          />
        );

      // Autres types de champs peuvent être ajoutés ici

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 py-4">
              <div className="space-y-4">
                {schema.map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderField(field)}
                    {errors[field.name] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResourceForm;
