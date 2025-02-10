"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";  // ✅ Correct import

export default function UserDetails() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();  // ✅ Get all route parameters
  const userId = params.userId;  // ✅ Extract userId from params


  useEffect(() => {
    if (!userId) return;  // Ensure userId is available before making API call
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/auth/users/${userId}/`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Details</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user.nom} {user.prenom}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.telephone}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Address:</strong> {user.adresse}</p>
      </div>
    </div>
  );
}