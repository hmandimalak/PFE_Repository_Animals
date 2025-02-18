"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Nunito } from 'next/font/google';
import { FaPaw, FaSmile, FaHeart, FaBars, FaBell } from "react-icons/fa";
import { useSession } from "next-auth/react";

const nunito = Nunito({ subsets: ['latin'] });

export default function Home() {
  const [user, setUser] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu toggle
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);


  useEffect(() => {
    const token = localStorage.getItem("access_token");
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
  
        // Fetch user profile
        fetch("http://127.0.0.1:8000/api/auth/profile/", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(response => response.json())
          .then(data => setUser(data))
          .catch(error => console.error("Error fetching user profile", error));
  
        // Fetch notifications
        fetch("http://127.0.0.1:8000/api/animals/notifications/", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(response => response.json())
          .then(data => {
            setNotifications(data);
            // Set notification count based on unread notifications
            setNotifCount(data.filter((notif) => !notif.lu).length);
          })
          .catch(error => console.error("Error fetching notifications", error));
  
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);
  
  const handleNotifClick = async (notifId) => {
    // Mark notification as read (set 'lu' to true)
    await fetch(`http://127.0.0.1:8000/api/animals/notifications/${notifId}/read/`, {
      method: "PUT", // Assuming you're using PUT to update the notification
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  
    // Update the notifications state
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notifId ? { ...notif, lu: true } : notif
      )
    );
  
    // Update the notification count
    setNotifCount((prevCount) => prevCount - 1); // Decrease count by 1
    setIsNotificationOpen(false); // Optionally, close the notification panel
  };
  

  const logout = () => {
   // Expire the cookies by setting them in the past
  document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
  document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";

  // Clear local storage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  // Redirect to login
  router.push("/login");
  };

  return (
    <div className="@container max-w-full resize-x overflow-auto">
    <div className={`min-h-screen bg-pastel-pink ${nunito.className}`}>
    {/* Navbar */}
<nav className="bg-white shadow-lg">
  <div className="max-w-10xl mx-auto px-10">
    <div className="flex justify-between items-center py-3 space-x-4">
      {/* Logo */}
      <div className="flex items-center mr-5">
        <Image
          src="/dogandcat.jpeg"
          alt="Animal Adoption Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="ml-2 text-xl font-semibold text-gray-800">
          Pawfect Home 🐶🐱
        </span>
      </div>

      {/* Mobile Menu Button (Hamburger) */}
      <div className="flex md:hidden">
        <button
          className="text-gray-800"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <FaBars />
        </button>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center mx-auto space-x-5 justify "> {/* Added mx-auto here */}
        {[{ label: "Nos Animaux", href: "/nos-animaux" },
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

{user && (
                  <div className="flex items-center space-x-4 ml-auto">
                    {/* Notification Button */}
                    <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="relative px-4 py-2 text-gray-800 hover:text-pastel-blue">
                      <FaBell className="text-xl" />
                      {notifCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {notifCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Panel */}
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

                    {/* Profile and Logout */}
                    <button onClick={() => router.push("/profile")} className="px-6 py-3 text-sm bg-pastel-blue text-white rounded-full hover:bg-pastel-green transition flex items-center">
                      <FaSmile className="mr-2" /> Profile
                    </button>
                    <button onClick={logout} className="px-6 py-3 text-sm bg-pastel-pink text-white rounded-full hover:bg-pastel-yellow hover:scale-105 transition-transform flex items-center">
                      <FaHeart className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>


      {/* Mobile Menu (Dropdown) */}
<div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"} bg-white shadow-lg`}>
  <div className="flex flex-col items-center py-4">
    {/* Links */}
    {[{ label: "Nos Animaux", href: "/nos-animaux" },
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

    {/* User Actions (Profile & Logout) */}
    {user && (
      <div className="flex flex-col items-center space-y-4 mt-6">
        <button
          onClick={() => router.push("/profile")}
          className="px-6 py-3 text-sm bg-pastel-blue text-white rounded-full hover:bg-pastel-green transition flex items-center"
        >
          <FaSmile className="mr-2" /> Profile
        </button>
        <button
          onClick={logout}
          className="px-6 py-3 text-sm bg-pastel-pink text-white rounded-full hover:bg-pastel-yellow hover:scale-105 transition-transform flex items-center"
        >
          <FaHeart className="mr-2" /> Logout
        </button>
      </div>
    )}
  </div>
</div>


      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Right Side: Search Bar and Welcome Message */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <h1 className="text-4xl font-bold text-pastel-blue">
              Bienvenue, {user ? user.nom : "Guest"}! 🐾
            </h1>

            {/* Search Bar */}
            <div className="w-full max-w-md">
              <input
                type="text"
                placeholder="Search for pets..."
                className="w-full px-4 py-2 rounded-full border border-pastel-blue focus:outline-none focus:ring-2 focus:ring-pastel-blue"
              />
            </div>
          </div>

          {/* Left Side: Cute Animal Photo */}
          <div className="flex items-center justify-center">
          <Image
  src="/dogandcat.jpeg"
  alt="Cute Animal"
  width={4000} // Increased width for better scaling
  height={1500} // Keeps good proportions
  className="shadow-lg hover:scale-110 transition-transform"
  style={{
    borderRadius: '42% 58% 23% 77% / 63% 35% 65% 37%', // Organic blob shape
    objectFit: 'cover', // Prevents distortion
    width: '100vw', // Sets width to full viewport width
    height: '50vh', // Increased height for better proportions
  }}
/>


</div>

        </div>

        {/* Scrollable Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-pastel-blue">Découvrez-en plus🌟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Our Team */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800">Notre équipe</h3>
              <p className="mt-2 text-gray-600">
              Rencontrez l'équipe passionnée derrière Pawfect Home.
              </p>
              <button
                onClick={() => router.push("/team")}
                className="mt-4 px-4 py-2 bg-pastel-green text-white rounded-full hover:bg-pastel-blue transition flex items-center"
              >
                <FaPaw className="mr-2" /> En savoir plus
              </button>
            </div>

            {/* Know More About Us */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800">
              Découvrez qui nous sommes
              </h3>
              <p className="mt-2 text-gray-600">
              Découvrez notre mission et comment nous aidons les animaux à trouver des foyers aimants
              </p>
              <button
                onClick={() => router.push("/about")}
                className="mt-4 px-4 py-2 bg-pastel-blue text-white rounded-full hover:bg-pastel-green transition flex items-center"
              >
                <FaHeart className="mr-2" /> En savoir plus
              </button>
            </div>

            {/* Adoption Process */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-gray-800">
              Processus d'adoption
              </h3>
              <p className="mt-2 text-gray-600">
              Découvrez comment adopter un compagnon animal dès aujourd'hui.
              </p>
              <button
                onClick={() => router.push("/adoption")}
                className="mt-4 px-4 py-2 bg-pastel-yellow text-white rounded-full hover:bg-pastel-pink transition flex items-center"
              >
                <FaSmile className="mr-2" /> En savoir plus
              </button>
            </div>
          </div>
        </div>
        <div id="our-services" className="mt-12 space-y-6">
  <h2 className="text-2xl font-bold text-pastel-blue text-center">Nos Services 🐶</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[
      {
        title: "Adoption",
        description: "Adopter un animal, c'est lui offrir une nouvelle chance et un foyer aimant. En adoptant, vous faites une différence dans sa vie et dans la vôtre.",
        image: "/adoption.jpg",
      },
      {
        title: "Service de Garde",
        description: "Besoin de soins pour votre animal pendant votre absence ? Nos soignants de confiance garantissent que votre animal soit en sécurité et heureux.",
        image: "/garderie.jpg",
      },
      {
        title: "Boutique",
        description: "Achetez des produits de qualité pour animaux afin de garder vos compagnons heureux et en bonne santé.",
        image: "/boutique.jpg",
      },
      {
        title: "Événement de Marche avec les Chiens",
        description: "Rejoignez-nous pour des événements de marche avec les chiens, l'occasion de socialiser et de faire de l'exercice avec d'autres amoureux des animaux.",
        image: "/marche.jpg",
      },
    ].map((service, index) => (
      <div key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center">
        {/* Smaller Image */}
        <div className="w-full h-48 overflow-hidden rounded-lg">
        <Image
          src={service.image}
          alt={service.title}
          width={500}  // Make sure the width is appropriate for your layout
          height={500}  // Adjust height to match the aspect ratio
          className="w-full h-full object-cover"
          quality={100}  // Set the quality to 100 (default is 75)
          sizes="(max-width: 640px) 100vw, 50vw"  // Adjust for responsiveness
        />
        </div>
        {/* Title and description */}
        <h3 className="text-lg font-semibold text-gray-800 mt-3">{service.title}</h3>
        <p className="mt-1 text-gray-600 text-center text-sm">{service.description}</p>
      </div>
    ))}
  </div>
</div>


      </div>
    </div>
    </div>
  );
}