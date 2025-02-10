"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/users/'); // Add this endpoint in Django
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="mb-2">
            <Link href={`/admin/users/${user.id}`} className="text-blue-500 hover:underline">
              {user.nom} {user.prenom} ({user.email})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}