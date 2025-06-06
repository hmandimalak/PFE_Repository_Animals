"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { 
  FaLock, FaEnvelope, FaPaw, FaDog, FaCat, 
  FaKey, FaCheckCircle, FaArrowRight, FaShieldAlt
} from "react-icons/fa";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!token || !email) {
      setError("Lien de réinitialisation invalide");
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8001/api/auth/password-reset/confirm/", {
        token,
        email,
        password,
        confirm_password: confirmPassword,
      });

      setMessage(response.data.message || "Mot de passe réinitialisé avec succès!");
      setError("");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || "Erreur lors de la réinitialisation du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-white py-12 relative overflow-hidden">
      {/* Animated pet silhouettes in background */}
      <div className="absolute top-20 right-10 opacity-10 animate-bounce">
        <FaDog className="w-24 h-24 text-primary" />
      </div>
      <div className="absolute bottom-40 left-20 opacity-10 animate-pulse">
        <FaCat className="w-32 h-32 text-dark" />
      </div>
      <div className="absolute top-60 right-1/4 opacity-10 animate-bounce delay-300">
        <FaPaw className="w-20 h-20 text-primary" />
      </div>
      <div className="absolute bottom-20 left-2/3 opacity-10 animate-pulse delay-500">
        <FaDog className="w-28 h-28 text-dark transform -rotate-12" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Left side - Form */}
            <div className="md:w-3/5 p-8 md:p-10">
              {/* En-tête */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                    <FaShieldAlt className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-dark mb-2">
                  Réinitialisation du mot de passe
                </h1>
                <p className="text-dark/70">
                  Créez un nouveau mot de passe sécurisé
                </p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email || ""}
                      disabled
                      className="w-full pl-10 pr-3 py-3 border-2 border-primary/30 rounded-lg bg-gray-50"
                      placeholder="Adresse email"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Nouveau mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Confirmer le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-600 px-4 py-3 rounded-lg text-sm">
                      {message}
                    </div>
                  )}

                  {/* Highlight box */}
                  <div className="px-4 py-3 bg-primary/10 border-l-4 border-primary rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaPaw className="h-5 w-5 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-dark">
                          Choisissez un mot de passe fort pour protéger votre compte Adopti
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading || !token || !email}
                    className="w-full py-3 px-6 bg-primary text-white font-medium rounded-lg shadow-lg hover:bg-accent transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      "Réinitialisation en cours..."
                    ) : (
                      <>
                        Réinitialiser le mot de passe
                        <FaArrowRight className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Login link */}
              <div className="mt-8 py-4 border-t border-gray-200 text-center">
                <p className="text-dark/70">
                  Vous vous souvenez de votre mot de passe ? {' '}
                  <Link
                    href="/login"
                    className="font-semibold text-primary hover:underline"
                  >
                    Connectez-vous
                  </Link>
                </p>
              </div>
            </div>

            {/* Right side - Image panel */}
            <div className="md:w-2/5 bg-gradient-to-bl from-primary to-accent p-8 text-white relative hidden md:block">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-6">
                    <FaPaw className="h-8 w-8 mr-3 text-white" />
                    <h2 className="text-2xl font-bold">Adopti</h2>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Sécurisez votre compte</h3>
                  <p className="text-white mb-6">
                    Créez un nouveau mot de passe pour sécuriser votre compte et continuer à utiliser nos services.
                  </p>
                </div>

                {/* Animal image showcase */}
                <div className="relative h-64 rounded-xl overflow-hidden mt-4 shadow-lg">
                  <img 
                    src="animals.jpg" 
                    alt="Happy pets" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <div className="text-lg font-bold mb-1">Protection renforcée</div>
                      <div className="text-sm">Un mot de passe fort protège votre espace Adopti</div>
                    </div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="flex justify-center space-x-3 mt-8">
                  <div className="h-3 w-3 rounded-full bg-white opacity-50"></div>
                  <div className="h-3 w-3 rounded-full bg-white opacity-70"></div>
                  <div className="h-3 w-3 rounded-full bg-white opacity-90"></div>
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer decoration */}
        <div className="flex justify-center mt-8">
          <div className="px-4 py-2 bg-primary/20 rounded-full text-xs text-primary font-medium flex items-center">
            <FaPaw className="mr-2" /> Adopti © 2025
          </div>
        </div>
      </div>
    </div>
  );
}