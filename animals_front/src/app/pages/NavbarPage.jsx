"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { FaPaw, FaSmile, FaHeart, FaBars, FaBell } from "react-icons/fa";
import Link from "next/link";


export default function Navbar() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Check for normal authentication
    const token = localStorage.getItem("access_token") || session?.accessToken;
    console.log("Token available:", !!token); // Debug log

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        // Fetch user profile for normal auth
        fetch("http://127.0.0.1:8000/api/auth/profile/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => setUser(data))
          .catch((error) => console.error("Error fetching user profile", error));

        // Fetch notifications with proper authentication
        fetch("http://127.0.0.1:8000/api/animals/notifications/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log("Notifications data:", data); // Debug log
            const notificationsList = Array.isArray(data) ? data : [];
            setNotifications(notificationsList);
            setNotifCount(notificationsList.filter((n) => !n.lu).length);
          })
          .catch((error) => {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
            setNotifCount(0);
          });
      } catch (error) {
        console.error("Invalid token", error);
      }

      if (session?.user) {
        setUser(session.user);
      }
    }
  }, [session, status]);

  const handleProfileClick = async () => {
    if (isNavigating) return; // Prevent multiple clicks

    try {
      setIsNavigating(true);

      // Wait for session to stabilize
      await new Promise((resolve) => setTimeout(resolve, 500)); // Adjust timeout as needed

      if ((status === "authenticated" && session?.user) || user) {
        console.log("User profile:", user || session.user);
        await router.push("/profile");
      }
    } finally {
      setIsNavigating(false);
    }
  };

  const handleLoginClick = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  const isAuthenticated = () => !!user || !!session?.user;
  const getCurrentUser = () => (user ? user.nom : session?.user?.name || "Guest");

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-10xl mx-auto px-10">
        <div className="flex justify-between items-center py-3 space-x-4">
          <div className="flex items-center mr-5">
          <Link href="/">
            <Image src="/dogandcat.jpeg" alt="Logo" width={40} height={40} className="rounded-full" />
            <span className="ml-2 text-xl font-semibold text-gray-800" >Pawfect Home 🐶🐱</span>
          </Link>

          </div>

          <div className="hidden md:flex items-center mx-auto space-x-5">
            {[
              { label: "Nos Animaux", href: "/nos-animaux" },
              { label: "Service de Garde", href: "/garderie" },
              { label: "Boutique", href: "/boutique" },
              { label: "Faire un Don", href: "/faire-un-don" },
              { label: "Blog", href: "/blog" },
              { label: "Nos Services", href: "#our-services" },
              { label: "FAQ", href: "/faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-800 px-3 py-2 rounded-full text-sm font-medium hover:bg-pastel-blue hover:text-white transition"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu (Dropdown) */}
          <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"} bg-white shadow-lg`}>
            <div className="flex flex-col items-center py-4">
              {[
                { label: "Nos Animaux", href: "/nos-animaux" },
                { label: "Service de Garde", href: "/garderie" },
                { label: "Boutique", href: "/boutique" },
                { label: "Faire un Don", href: "/faire-un-don" },
                { label: "Blog", href: "/blog" },
                { label: "Nos Services", href: "#our-services" },
                { label: "FAQ", href: "/faq" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-pastel-blue hover:text-white transition"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated() && (
              <>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative px-4 py-2 text-gray-800 hover:text-pastel-blue"
                >
                  <FaBell className="text-xl" />
                  {notifCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {notifCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-10 top-12 w-64 bg-white shadow-lg rounded-lg p-3">
                    <h3 className="text-gray-800 font-bold">Notifications</h3>
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-2 border-b text-gray-600 cursor-pointer"
                          onClick={() => handleNotifClick(notif.id)}
                        >
                          {notif.lu ? <s>{notif.message}</s> : notif.message}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No new notifications</p>
                    )}
                  </div>
                )}
              </>
            )}

            {isAuthenticated() ? (
              <>
                <button
                  onClick={handleProfileClick}
                  className="px-6 py-3 text-sm bg-pastel-blue text-white rounded-full hover:bg-pastel-green transition flex items-center"
                >
                  <FaSmile className="mr-2" /> {getCurrentUser()}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 text-sm bg-pastel-pink text-white rounded-full hover:bg-pastel-yellow hover:scale-105 transition-transform flex items-center"
                >
                  <FaHeart className="mr-2" /> Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="px-6 py-3 text-sm bg-pastel-blue text-white rounded-full hover:bg-pastel-green transition flex items-center"
              >
                <FaSmile className="mr-2" /> Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}