"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaKey, FaPen } from "react-icons/fa"; // Import the key and pen icons

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-pastel-pink-100 to-blue-100">
  <div className="bg-white p-6 shadow-lg rounded-lg max-w-md w-full">
    <h1 className="text-5xl text-center font-bold text-pastel-pink mb-6">
      Modifier votre profil
    </h1>
        <div 
          className="relative mx-auto mb-4 h-24 w-24 rounded-full overflow-hidden cursor-pointer group"
          onClick={() => document.getElementById('profilepicture').click()} // Make the entire div clickable
        >
          <img 
            src={preview || "/default-profile.png"} 
            alt="Profile" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="nom" value={user.nom} onChange={handleChange} placeholder="Nom" className="w-full p-3 border rounded" />
          <input type="text" name="prenom" value={user.prenom} onChange={handleChange} placeholder="Prénom" className="w-full p-3 border rounded" />
          <input type="email" name="email" value={user.email} onChange={handleChange} placeholder="Email" className="w-full p-3 border rounded" />
          <input type="text" name="telephone" value={user.telephone} onChange={handleChange} placeholder="Téléphone" className="w-full p-3 border rounded" />
          <input type="text" name="adresse" value={user.adresse} onChange={handleChange} placeholder="Adresse" className="w-full p-3 border rounded" />
          
          <button 
            type="button" 
            onClick={() => setShowPasswordFields(!showPasswordFields)} 
            className="btn-secondary mt-4 flex items-center justify-center w-full"
          >
            <FaKey className="mr-2" /> Changer Mot de Passe
          </button>
          
          {showPasswordFields && (
            <>
              <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} placeholder="Mot de passe actuel" className="w-full p-3 border rounded" />
              <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} placeholder="Nouveau mot de passe" className="w-full p-3 border rounded" />
              <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} placeholder="Confirmer le mot de passe" className="w-full p-3 border rounded" />
            </>
          )}
          {success && <p className="text-green-500 text-center">{success}</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Save Changes</button>
        </form>
      </div>
    </div>
  );
}