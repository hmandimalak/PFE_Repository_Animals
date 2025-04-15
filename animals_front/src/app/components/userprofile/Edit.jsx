"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaKey, FaPen ,FaSave} from "react-icons/fa"; // Import the key and pen icons

export default function EditProfile({ setActiveSection }) {
  const [user, setUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    profilepicture: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/profile");
      return;
    }

    fetch("http://127.0.0.1:8000/api/auth/profile/", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        return response.json();
      })
      .then((data) => {
        setUser({
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email || "",
          telephone: data.telephone || "",
          adresse: data.adresse || "",
          profilepicture: null,
        });
        setPreview(data.profilepicture || null);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (files.length > 0) {
        setUser({ ...user, [name]: files[0] });
        setPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("You must be logged in to update your profile");
      return;
    }

    const formData = new FormData();
    formData.append("nom", user.nom);
    formData.append("prenom", user.prenom);
    formData.append("email", user.email);
    formData.append("telephone", user.telephone);
    formData.append("adresse", user.adresse);
    if (user.profilepicture) {
      formData.append("profilepicture", user.profilepicture);
    }

    if (showPasswordFields) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        setError("Les nouveaux mots de passe ne correspondent pas.");
        return;
      }
      formData.append("current_password", passwords.currentPassword);
      formData.append("new_password", passwords.newPassword);
    }

    fetch("http://127.0.0.1:8000/api/auth/profile/update/", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || "Failed to update profile");
          });
        }
        return response.json();
      })
      .then(() => {
        setSuccess("Profile updated successfully!");
        setTimeout(() => {
          if (setActiveSection) {
            setActiveSection("profile");
          } else {
            window.location.href = "/profile";
          }
        }, 1500);
      })
      .catch((error) => {
        setError(error.message || "Failed to update profile.");
      });
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="mb-10 text-center space-y-2">
            <h1 className="text-5xl font-extrabold text-primary">Modifier le Profil</h1>
            <p className="text-dark/80">Mettez à jour vos informations personnelles</p>
            <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
        </div>

        <form className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6 border-r-2 border-accent/20 pr-8">
            
            <div className="animate-slide-in-left">
              <label className="block text-sm font-semibold text-dark mb-2">
                Photo de Profil
              </label>
              <div 
                className="relative w-32 h-32 mx-auto rounded-full overflow-hidden cursor-pointer group"
                onClick={() => document.getElementById('profilepicture').click()}
              >
                <img 
                  src={preview || '/default-profile.png'} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaPen className="text-white text-xl" />
                </div>
                <input 
                  type="file" 
                  id="profilepicture" 
                  name="profilepicture" 
                  onChange={handleChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="animate-slide-in-left delay-100">
              <label className="block text-sm font-semibold text-dark mb-2">
                Nom
                <span className="text-primary"> *</span>
              </label>
              <input
                type="text"
                name="nom"
                value={user.nom}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="animate-slide-in-left delay-200">
              <label className="block text-sm font-semibold text-dark mb-2">
                Prénom
                <span className="text-primary"> *</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={user.prenom}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          
           </div>

            {/* Right Column */}
            <div className="space-y-6 pl-8">
            <div className="animate-slide-in-right">
              <label className="block text-sm font-semibold text-dark mb-2">
                Email
                <span className="text-primary"> *</span>
              </label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
                className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="animate-slide-in-right delay-100">
              <label className="block text-sm font-semibold text-dark mb-2">
                Téléphone
              </label>
              <input
                type="text"
                name="telephone"
                value={user.telephone}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="animate-slide-in-right delay-200">
              <label className="block text-sm font-semibold text-dark mb-2">
                Adresse
              </label>
              <input
                type="text"
                name="adresse"
                value={user.adresse}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="animate-fade-in">
              <button 
                type="button" 
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="w-full py-3 bg-primary/10 text-primary rounded-xl border-2 border-primary flex items-center justify-center gap-2 hover:bg-primary/20 transition-all"
              >
                <FaKey className="text-lg" />
                Changer le mot de passe
              </button>
            </div>

            {showPasswordFields && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Mot de passe actuel
                    <span className="text-primary"> *</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Nouveau mot de passe
                    <span className="text-primary"> *</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Confirmer le mot de passe
                    <span className="text-primary"> *</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            )}
            </div>

            {/* Submit Button */}
          <div className="col-span-2 mt-8 animate-fade-in-up">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 hover:scale-[1.02] transition-transform shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <FaSave className="text-xl" />
                  Sauvegarder les modifications
                </>
              )}
            </button>
          </div>
        </form>
    </div>
);
}