import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <ul>
        <li className="mb-3">
          <Link href="/admin/users" className="hover:text-gray-400">
            Users
          </Link>
        </li>
        <li className="mb-3">
          <Link href="/admin/animals" className="hover:text-gray-400">
            Animals
          </Link>
        </li>
      </ul>
    </div>
  );
}