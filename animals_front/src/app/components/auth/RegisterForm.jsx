"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import Link from 'next/link';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "Proprietaire",
    adresse: "",
    password: "",
    confirmPassword: "",  // New confirmPassword field
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.nom) newErrors.nom = "Le nom est requis";
    if (!formData.prenom) newErrors.prenom = "Le prénom est requis";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.telephone || formData.telephone.length < 8) {
      newErrors.telephone = "Numéro de téléphone invalide";
    }
    if (!formData.adresse) newErrors.adresse = "L'adresse est requise";
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }
    // Check if password and confirm password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok) {
        setSuccess(true);
        setErrors({});
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          role: "Proprietaire",
          adresse: "",
          password: "",
          confirmPassword: "", // Reset the confirm password field
        });

        // ✅ Redirect to the login page
        router.push("/login");
      } else {
        setErrors(result);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ api: "Une erreur est survenue lors de l'inscription." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
        </div>

        {errors.api && (
          <div className="text-red-500 text-sm text-center">
            {errors.api}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="nom" className="sr-only">
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nom"
                value={formData.nom}
                onChange={handleChange}
              />
              {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
            </div>

            <div>
              <label htmlFor="prenom" className="sr-only">
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={handleChange}
              />
              {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="telephone" className="sr-only">
                Téléphone
              </label>
              <input
                id="telephone"
                name="telephone"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Téléphone"
                value={formData.telephone}
                onChange={handleChange}
              />
              {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
            </div>

            <div>
              <label htmlFor="adresse" className="sr-only">
                Adresse
              </label>
              <input
                id="adresse"
                name="adresse"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Adresse"
                value={formData.adresse}
                onChange={handleChange}
              />
              {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse}</p>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign up
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
