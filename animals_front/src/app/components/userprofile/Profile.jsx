"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login"); // Redirect if not logged in
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
        console.error("Error fetching user profile:", error);
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>

      <div className="mt-6 p-6 bg-white shadow-md rounded-lg w-96">
        <p><strong>Nom:</strong> {user.nom}</p>
        <p><strong>Prénom:</strong> {user.prenom}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Téléphone:</strong> {user.telephone}</p>
        <p><strong>Adresse:</strong> {user.adresse}</p>
        <p><strong>Role:</strong> {user.role}</p>

        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push("/editprofile")}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}
