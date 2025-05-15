"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import Navbar from '../../pages/NavbarPage';
import { FaLock, FaEnvelope, FaPaw, FaDog, FaCat, FaGoogle, FaSignInAlt, FaKey, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { data: session } = useSession();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setError("Google login failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
  setShowPassword(!showPassword);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Login failed");

      document.cookie = `access_token=${data.access}; path=/; max-age=86400`;
      document.cookie = `refresh_token=${data.refresh}; path=/; max-age=86400`;

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      setTimeout(() => {
        router.push("/");
      }, 300);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={"min-h-screen bg-gradient-to-b from-secondary to-white ${nunito.className}"}>            
    <div className="sticky top-0 w-full z-50 bg-white shadow-md">
        <Navbar />
    </div>
      {/* Animated pet silhouettes in background - slightly different positioning */}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="md:flex flex-row-reverse">
            {/* Right side - Animal image panel (reversed from register page) */}
            <div className="md:w-2/5 bg-gradient-to-bl from-primary to-accent p-8 text-white relative hidden md:block">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-6">
                    <FaPaw className="h-8 w-8 mr-3 text-white" />
                    <h2 className="text-2xl font-bold">Adopti</h2>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Heureux de vous revoir</h3>
                  <p className="text-white mb-6">
                    Connectez-vous pour retrouver votre espace personnel et continuer à partager votre amour pour les animaux.
                  </p>
                </div>

                {/* Animal image showcase - different style */}
                <div className="relative h-64 rounded-xl overflow-hidden mt-4 shadow-lg">
                  <img 
                    src="animals.jpg" 
                    alt="Happy pets" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <div className="text-lg font-bold mb-1">Connectez-vous pour continuer</div>
                      <div className="text-sm">Votre aventure avec Adopti continue ici</div>
                    </div>
                  </div>
                </div>

                {/* Different style of decorative element */}
                <div className="flex justify-center space-x-3 mt-8">
                  <div className="h-3 w-3 rounded-full bg-white opacity-50"></div>
                  <div className="h-3 w-3 rounded-full bg-white opacity-70"></div>
                  <div className="h-3 w-3 rounded-full bg-white opacity-90"></div>
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                </div>
              </div>
            </div>

            {/* Left side - Form (reversed from register page) */}
            <div className="md:w-3/5 p-8 md:p-10">
              {/* En-tête - different icon and styling */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                    <FaKey className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-dark mb-2">
                  Connexion
                </h1>
                <p className="text-dark/70">
                  Accédez à votre espace Pawfect Home
                </p>
              </div>

              {/* Formulaire - simplified from register */}
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
                      required
                      className="w-full pl-10 pr-3 py-3 border-2 border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Adresse email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

<div className="relative">
  {/* Left Icon */}
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <FaLock className="h-5 w-5 text-primary" />
  </div>

  {/* Password Input */}
  <input
    id="password"
    name="password"
    type={showPassword ? "text" : "password"}
    required
    className="w-full pl-10 pr-10 py-3 border-2 border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
    placeholder="Mot de passe"
    value={formData.password}
    onChange={handleChange}
  />

  {/* Toggle Button */}
  <button
    type="button"
    onClick={togglePasswordVisibility}
    className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary hover:text-accent transition-colors"
    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
  >
    {showPassword ? (
      <FaEyeSlash className="h-5 w-5" />
    ) : (
      <FaEye className="h-5 w-5" />
    )}
  </button>
</div>
                
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    
                    <div className="text-sm">
                      <Link
                        href="/forgot"
                        className="font-medium text-primary hover:text-accent transition-colors"
                      >
                        Mot de passe oublié?
                      </Link>
                    </div>
                  </div>

                  {/* Different style of highlight box */}
                  <div className="px-4 py-3 bg-primary/10 border-l-4 border-primary rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaPaw className="h-5 w-5 text-primary" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-dark">
                          Connectez-vous pour retrouver vos compagnons à quatre pattes
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bouton de connexion - different style */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 bg-primary text-white font-medium rounded-lg shadow-lg hover:bg-accent transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      "Connexion en cours..."
                    ) : (
                      <>
                        Se Connecter
                        <FaArrowRight className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Google OAuth Button - different style */}
              <div className="mt-6">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-white border border-gray-300 text-dark font-medium rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center"
                >
                  <FaGoogle className="mr-2 text-primary" />
                  {loading ? "Connexion en cours..." : "Continuer avec Google"}
                </button>
              </div>

              {/* Lien d'inscription - different styling */}
              <div className="mt-8 py-4 border-t border-gray-200 text-center">
                <p className="text-dark/70">
                  Pas encore membre ? {' '}
                  <Link
                    href="/register"
                    className="font-semibold text-primary hover:underline"
                  >
                    Créez un compte
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Different footer decoration */}
        <div className="flex justify-center mt-8">
          <div className="px-4 py-2 bg-primary/20 rounded-full text-xs text-primary font-medium flex items-center">
            <FaPaw className="mr-2" /> Adopti © 2025
          </div>
        </div>
      </div>
    </div>
  );
}