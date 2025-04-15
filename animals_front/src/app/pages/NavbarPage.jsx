"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { FaPaw, FaSmile, FaHeart, FaBars, FaBell ,FaUser, FaSignOutAlt,} from "react-icons/fa";
import Link from "next/link";
import { authenticatedFetch } from '../../app/authInterceptor';


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
    const fetchData = async () => {
      const token = localStorage.getItem("access_token") || session?.accessToken;
      if (!token) return;

      try {
        // Fetch user profile and notifications in parallel
        const [profileResponse, animalResponse, boutiqueResponse] = await Promise.all([
          authenticatedFetch("http://127.0.0.1:8000/api/auth/profile/"),
          authenticatedFetch("http://127.0.0.1:8000/api/animals/notifications/"),
          authenticatedFetch("http://127.0.0.1:8000/api/boutique/notifications/")
        ]);

        // Handle profile response
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUser(profileData);
        }

        // Process notifications
        const processNotifications = async (response, type) => {
          if (!response.ok) return [];
          const data = await response.json();
          return Array.isArray(data) ? data.map(n => ({ ...n, type })) : [];
        };

        const [animalNotifications, boutiqueNotifications] = await Promise.all([
          processNotifications(animalResponse, 'animals'),
          processNotifications(boutiqueResponse, 'boutique')
        ]);

        const allNotifications = [...animalNotifications, ...boutiqueNotifications];
        setNotifications(allNotifications);
        setNotifCount(allNotifications.filter(n => !n.lu).length);

      } catch (error) {
        console.error("Fetch error:", error);
        handleLogout();
      }
    };

    fetchData();
  }, [session, status]);

  const handleProfileClick = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    try {
      await router.push("/profile");
    } finally {
      setIsNavigating(false);
    }
  };

  const handleLoginClick = () => router.push("/login");

  const handleLogout = async () => {
    try {
      // Clear all authentication tokens
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

  const handleNotifClick = async (notifId, notificationType) => {
    try {
      const endpoint = `http://127.0.0.1:8000/api/${notificationType}/notifications/${notifId}/read/`;
      await authenticatedFetch(endpoint, { method: "PUT" });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notifId ? { ...notif, lu: true } : notif
        )
      );
      setNotifCount(prev => prev - 1);
    } catch (error) {
      console.error("Notification update failed:", error);
    }
  };

  const isAuthenticated = () => !!user || !!session?.user;
  const getCurrentUser = () => user?.nom || session?.user?.name || "Guest";

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const notifPanel = document.getElementById('notification-panel');
      if (isNotificationOpen && notifPanel && !notifPanel.contains(event.target) && !event.target.closest('button[aria-label="Notifications"]')) {
        setIsNotificationOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNotificationOpen]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo and Site Name */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary/30 transition duration-300">
                <Image src="/adopti.png" alt="Logo" width={90} height={10} className="rounded-full border-2 border-primary" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { label: "Nos Animaux", href: "/nos-animaux" },
              { label: "Service de Garde", href: "/garderie" },
              { label: "Boutique", href: "/boutique" },
              { label: "Evenements", href: "/marche" },
              { label: "Blog", href: "/blog" },
              { label: "Nos Services", href: "#our-services" },
              { label: "FAQ", href: "/faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-dark px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary hover:text-primary transition duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Side: Notifications, Profile, Login/Logout */}
          <div className="flex items-center space-x-4">
            {isAuthenticated() && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNotificationOpen(!isNotificationOpen);
                  }}
                  className="relative p-2 text-dark hover:text-accent transition-colors"
                  aria-label="Notifications"
                >
                  <FaBell className="text-xl" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      {notifCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div 
                    id="notification-panel"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-10 border border-secondary"
                  >
                    <h3 className="text-dark font-semibold px-4 py-2 border-b border-secondary">Notifications</h3>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-2 border-b border-secondary/50 cursor-pointer hover:bg-secondary/20 transition ${notif.lu ? 'text-dark/60' : 'text-dark font-medium'}`}
                            onClick={() => handleNotifClick(notif.id, notif.type)}
                          >
                            {notif.lu ? <s>{notif.message}</s> : notif.message}
                          </div>
                        ))
                      ) : (
                        <p className="text-dark/60 text-sm px-4 py-3 text-center">Aucune notification</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile and Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated() ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-secondary/10 rounded-full pr-4 pl-2 py-1 hover:bg-secondary/20 transition-colors">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-2"
                      disabled={isNavigating}
                    >
                      <div className="bg-primary p-2 rounded-full text-white">
                        <FaUser className="text-lg" />
                      </div>
                      <span className="text-dark font-medium text-sm">
                        {getCurrentUser()}
                      </span>
                    </button>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-dark/10 hover:bg-dark/20 px-3 py-2 rounded-full transition-colors"
                  >
                    <FaSignOutAlt className="text-dark text-lg" />
                    <span className="text-dark font-medium text-sm">
                      Déconnexion
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-full hover:bg-primary transition-colors"
                >
                  <FaUser className="text-lg" />
                  <span>Connexion</span>
                </button>
              )}
            </div>

          

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-dark hover:text-primary focus:outline-none"
              >
                <FaBars className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="bg-white border-t border-secondary shadow-inner px-2 py-3 space-y-1">
          {[
            { label: "Nos Animaux", href: "/nos-animaux" },
            { label: "Service de Garde", href: "/garderie" },
            { label: "Boutique", href: "/boutique" },
            { label: "Evenements", href: "/marche" },
            { label: "Blog", href: "/blog" },
            { label: "Nos Services", href: "#our-services" },
            { label: "FAQ", href: "/faq" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:bg-secondary hover:text-primary transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}