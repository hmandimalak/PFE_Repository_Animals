"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'


import { 
  FaUserPlus, FaLock, FaIdCard, FaEnvelope, 
  FaPhone, FaHome, FaImage, FaCheck, FaPaw, FaDog, FaCat ,FaEye, FaEyeSlash
} from "react-icons/fa";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "Proprietaire",
    adresse: "",
    password: "",
    confirmPassword: "",
    profilepicture: null,
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      setFormData({
        ...formData,
        [name]: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Special handler for phone input
  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      telephone: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
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
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Exclude confirmPassword from the data sent to the backend
    const { confirmPassword, ...dataToSend } = formData;
    const data = new FormData();
    for (const key in dataToSend) {
      data.append(key, dataToSend[key]);
    }

    try {
      const response = await fetch("http://127.0.0.1:8001/api/auth/register/", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok) {
        setSuccess(true);
        setErrors({});
        // Reset form fields
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          role: "Proprietaire",
          adresse: "",
          password: "",
          confirmPassword: "",
          profilepicture: null,
        });
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
    <div className="min-h-screen bg-gradient-to-br from-secondary to-white py-12 relative overflow-hidden">
      {/* Animated pet silhouettes in background */}
      <div className="absolute top-10 left-10 opacity-10 animate-bounce">
        <FaDog className="w-24 h-24 text-primary" />
      </div>
      <div className="absolute top-40 right-20 opacity-10 animate-pulse">
        <FaCat className="w-32 h-32 text-accent" />
      </div>
      <div className="absolute bottom-20 left-1/4 opacity-10 animate-bounce delay-300">
        <FaPaw className="w-20 h-20 text-primary" />
      </div>
      <div className="absolute top-60 left-3/4 opacity-10 animate-pulse delay-500">
        <FaDog className="w-28 h-28 text-dark transform rotate-12" />
      </div>
      <div className="absolute bottom-40 right-1/3 opacity-10 animate-bounce delay-700">
        <FaPaw className="w-16 h-16 text-accent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Left side - Animal image panel */}
            <div className="md:w-2/5 bg-gradient-to-br from-primary to-dark p-8 text-white relative hidden md:block">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-6">
                    <FaPaw className="h-8 w-8 mr-3 text-secondary" />
                    <h2 className="text-2xl font-bold">Adopti</h2>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Trouvez la patte-faite famille pour votre compagnon</h3>
                  <p className="text-secondary mb-6">
                    Rejoignez notre communauté dédiée aux amoureux des animaux et aux propriétaires responsables.
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
                      <div className="text-sm uppercase tracking-wider mb-1">Devenez membre</div>
                      <div className="text-xl font-bold">Pour un monde plus heureux pour nos amis à quatre pattes</div>
                    </div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="mt-8 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                  <p className="italic text-sm text-secondary">"Grâce à adopti, j'ai trouvé la famille idéale pour mon chaton. Le processus était simple et rassurant."</p>
                  <p className="text-accent text-sm mt-2">— Sophie, membre depuis 2024</p>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="md:w-3/5 p-8 md:p-10">
              {/* En-tête */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <div className="mx-auto h-16 w-16 bg-secondary rounded-full flex items-center justify-center">
                    <FaUserPlus className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-dark mb-2">
                  Rejoignez Notre Communauté
                </h1>
                <p className="text-dark/70">
                  Créez votre compte pour commencer votre aventure avec Adopti
                </p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="space-y-5"> 
                  {/* Photo de profil */}
                  <div className="col-span-full">
  <label className="block text-sm font-medium text-dark mb-2">
    Photo de Profil
  </label>
  <div className="relative group">
    <input
      id="profilepicture"
      name="profilepicture"
      type="file"
      accept="image/*"
      onChange={handleChange}
      className="hidden"
    />
    <label 
      htmlFor="profilepicture" 
      className="cursor-pointer flex flex-col items-center justify-center h-24 border border-dashed border-secondary rounded-lg hover:border-accent transition-all bg-secondary/10 hover:bg-secondary/20"
    >
      {formData.profilepicture ? (
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <img 
            src={URL.createObjectURL(formData.profilepicture)}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-dark/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-medium bg-dark/60 px-2 py-1 rounded-md">
              Modifier
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center p-2">
          <FaImage className="h-6 w-6 text-primary mb-1 group-hover:text-accent transition-colors" />
          <span className="text-xs text-primary text-center">Cliquer pour upload</span>
          <p className="text-[0.65rem] text-dark/50 mt-0.5">PNG, JPG (max 2MB)</p>
        </div>
      )}
    </label>
  </div>
</div>

                  {/* Input fields with stylish icons */}
                  {/* Nom */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-dark">Nom de famille</label>
        <div className="relative">
              <FaIdCard className="absolute left-3 top-3 text-primary" />

          <input
            id="nom"
            name="nom"
            type="text"
            placeholder="Nom de famille"
            required
            className={`w-full pl-10 pr-3 py-2 border ${
              errors.nom ? "border-red-500" : "border-secondary"
            } rounded-lg focus:ring-2 focus:ring-accent focus:border-accent`}
            value={formData.nom}
            onChange={handleChange}
          />
                    {errors.nom && (
                      <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
        <label className="block text-sm font-medium text-dark">Prénom</label>
        <div className="relative">
              <FaIdCard className="absolute left-3 top-3 text-primary" />

                    <input
                      id="prenom"
                      name="prenom"
                      type="text"
                      required
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.prenom ? "border-red-500" : "border-secondary"
                      } rounded-lg focus:ring-2 focus:ring-accent focus:border-accent`}
                      placeholder="Prénom"
                      value={formData.prenom}
                      onChange={handleChange}
                    />
                    {errors.prenom && (
                      <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>
                    )}
                  </div>

                  </div>

                 <div className="space-y-2">
        <label className="block text-sm font-medium text-dark">Adresse email</label>
        <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-primary" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.email ? "border-red-500" : "border-secondary"
                      } rounded-lg focus:ring-2 focus:ring-accent focus:border-accent`}
                      placeholder="Adresse email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  </div>

                 <div className="space-y-2">
  <label className="block text-sm font-medium text-dark">Téléphone</label>
  <div className="relative">
    <FaPhone className="absolute left-3 top-3 text-primary z-10" />
    <PhoneInput
      country={'tn'}
      value={formData.telephone}
      onChange={handlePhoneChange}
      inputProps={{
        name: 'telephone',
        id: 'telephone',
        required: true,
        className: `w-full pl-10 pr-3 py-2 border ${
          errors.telephone ? "border-red-500" : "border-secondary"
        } rounded-lg focus:ring-2 focus:ring-accent focus:border-accent`
      }}
      containerClass="relative" // Ajouté
      inputStyle={{ paddingLeft: '40px' }} // Ajouté
      buttonStyle={{ display: 'none' }} // Ajouté
    />
    {errors.telephone && (
      <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
    )}
  </div>
</div>

                 <div className="space-y-2">
        <label className="block text-sm font-medium text-dark">Adresse complète</label>
        <div className="relative">
              <FaHome className="absolute left-3 top-3 text-primary" />

                    <input
                      id="adresse"
                      name="adresse"
                      type="text"
                      required
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.adresse ? "border-red-500" : "border-secondary"
                      } rounded-lg focus:ring-2 focus:ring-accent focus:border-accent`}
                      placeholder="Adresse complète"
                      value={formData.adresse}
                      onChange={handleChange}
                    />
                    {errors.adresse && (
                      <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>
                    )}
                  </div>
                  </div>

                  {/* Password Field */}
<div className="space-y-2">
        <label className="block text-sm font-medium text-dark">Mot de passe</label>
        <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-primary" />

  <input
    id="password"
    name="password"
    type={showPassword ? "text" : "password"}
    required
    className={`w-full pl-10 pr-10 py-2 border ${
      errors.password ? "border-red-500" : "border-secondary"
    } rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all`}
    placeholder="Mot de passe"
    value={formData.password}
    onChange={handleChange}
  />
  <button
    type="button"
    onClick={togglePasswordVisibility}
    className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary hover:text-accent transition-colors z-10"
  >
    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
  </button>
  {errors.password && (
    <p className="text-red-500 text-xs mt-1 absolute">{errors.password}</p>
  )}
</div>
</div>

{/* Confirm Password Field */}
<div className="space-y-2">
        <label className="block text-sm font-medium text-dark">Confirmation mot de passe</label>
        <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-primary" />

  <input
    id="confirmPassword"
    name="confirmPassword"
    type={showPassword ? "text" : "password"}
    required
    className={`w-full pl-10 pr-10 py-2 border ${
      errors.confirmPassword ? "border-red-500" : "border-secondary"
    } rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all`}
    placeholder="Confirmation mot de passe"
    value={formData.confirmPassword}
    onChange={handleChange}
  />
  <button
    type="button"
    onClick={togglePasswordVisibility}
    className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary hover:text-accent transition-colors z-10"
  >
    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
  </button>
  {errors.confirmPassword && (
    <p className="text-red-500 text-xs mt-1 absolute">{errors.confirmPassword}</p>
  )}
</div>
</div>
</div>
                </div>
                
                {/* Pet lover badge */}
                <div className="flex items-center mt-6 bg-secondary/30 p-3 rounded-lg border border-secondary">
                  <div className="mr-3">
                    <FaPaw className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-dark">Vous rejoignez une communauté d'amoureux des animaux engagés pour leur bien-être!</p>
                  </div>
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  <FaPaw className="mr-2" />
                  Créer mon compte
                </button>
              </form>

              {/* Lien de connexion */}
              <div className="mt-6 text-center text-sm text-dark/70">
                Déjà membre ?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-accent hover:text-primary"
                >
                  Connectez-vous ici
                </Link>
              </div>
            </div>
          </div>
        </div>
        

        {/* Paw prints decoration at bottom */}
        <div className="flex justify-center mt-8 space-x-2">
          <FaPaw className="h-4 w-4 text-primary opacity-70" />
          <FaPaw className="h-4 w-4 text-accent opacity-70" />
          <FaPaw className="h-4 w-4 text-dark opacity-40" />
          <FaPaw className="h-4 w-4 text-primary opacity-70" />
          <FaPaw className="h-4 w-4 text-accent opacity-70" />
        </div>
      </div>
    </div>
  );
}