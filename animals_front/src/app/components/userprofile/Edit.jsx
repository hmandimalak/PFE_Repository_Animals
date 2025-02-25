"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfile() {
  const [user, setUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
        setUser(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    fetch("http://127.0.0.1:8000/api/auth/profile/update/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update profile");
        }
        return response.json();
      })
      .then(() => {
        setSuccess("Profile updated successfully!");
        setTimeout(() => router.push("/profile"), 2000);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        setError("Failed to update profile.");
      });
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pastel-pink">
      <h1 className="text-3xl font-bold text-pastel-pink mb-6">Edit Your Profile</h1>

      <form
        onSubmit={handleSubmit}
         className="bg-white p-4 shadow-lg rounded-lg"
      >
        <input
          type="text"
          name="nom"
          value={user.nom}
          onChange={handleChange}
          placeholder="Nom"
          className="w-full p-3 border-2 border-pastel-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink focus:border-transparent"
        />
        <input
          type="text"
          name="prenom"
          value={user.prenom}
          onChange={handleChange}
          placeholder="Prénom"
          className="w-full p-3 border-2 border-pastel-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink focus:border-transparent"
        />
        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 border-2 border-pastel-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink focus:border-transparent"
        />
        <input
          type="text"
          name="telephone"
          value={user.telephone}
          onChange={handleChange}
          placeholder="Téléphone"
          className="w-full p-3 border-2 border-pastel-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink focus:border-transparent"
        />
        <input
          type="text"
          name="adresse"
          value={user.adresse}
          onChange={handleChange}
          placeholder="Adresse"
          className="w-full p-3 border-2 border-pastel-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-pink focus:border-transparent"
        />

        {success && (
          <p className="text-green-500 text-center">{success}</p>
        )}
        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-pastel-pink text-white rounded-lg hover:bg-pastel-pink-dark transition-all duration-300"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="w-full px-4 py-2 mt-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all duration-300"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}