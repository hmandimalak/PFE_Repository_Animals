"use client";
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Nunito } from "next/font/google";
import { FaPaw, FaDog, FaCat, FaGoogle, FaHeart, FaSmile, FaArrowRight, FaHome, FaShoppingBag, FaWalking, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaLink, FaEnvelopeOpen, FaPaperPlane, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaSearch } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import Navbar from "./NavbarPage";
import { authenticatedFetch } from '../../app/authInterceptor'

const nunito = Nunito({ subsets: ["latin"] });

export default function Home() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animalType, setAnimalType] = useState(""); // 'chat' or 'chien'
  const [species, setSpecies] = useState(""); // Specific species (e.g., 'Persian', 'Labrador')
  const [searchResults, setSearchResults] = useState([]); // Store search results
  const scrollContainerRef = useRef(null);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState(null);
  

  const speciesOptions = {
    chien: [
      "Berger Allemand",
      "Labrador Retriever",
      "Golden Retriever",
      "Bulldog",
      "Rottweiler",
      "Husky Sibérien",
      "Beagle",
      "Caniche",
      "Chihuahua",
      "Yorkshire Terrier",
      "Autre",
    ],
    chat: [
      "Persan",
      "Siamois",
      "Maine Coon",
      "Bengal",
      "British Shorthair",
      "Ragdoll",
      "Sphynx",
      "Abyssin",
      "Sacré de Birmanie",
      "Européen",
      "Autre",
    ],
  };

  useEffect(() => {
    // Check for normal authentication
    const token = localStorage.getItem("access_token") || session?.accessToken;

    if (session?.accessToken) {
      // Store tokens securely
      localStorage.setItem("access_token", session.accessToken);
      console.log("Access token:", session.accessToken);
      if (session.refreshToken) {
        localStorage.setItem("refresh_token", session.refreshToken);
      }
      router.push("/");
    }

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        // Fetch user profile for normal auth
        fetch("http://127.0.0.1:8000/api/auth/profile/", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => response.json())
          .then((data) => setUser(data))
          .catch((error) => console.error("Error fetching user profile", error));
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false });
      return () => container.removeEventListener('wheel', handleScroll);
    }
  }, [session, status]);

  const handleScroll = (e) => {
    e.preventDefault();
    scrollContainerRef.current.scrollLeft += e.deltaY;
  };

  const handleSearch = async () => {
    try {
      // Build query parameters dynamically
      const queryParams = new URLSearchParams();
      if (animalType) queryParams.append("type", animalType);
      if (species) queryParams.append("species", species);
  
      // Construct the full URL
      const url = `http://127.0.0.1:8000/api/animals/search/?${queryParams.toString()}`;
  
      // Fetch data from the API
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
  
      const data = await response.json();
      setSearchResults(data); // Update search results
      setHasSearched(true); // Set hasSearched to true after a search is performed
    } catch (error) {
      console.error("Error searching animals:", error);
    }
  };

  const handleAnimalTypeSelect = (type) => {
    if (animalType === type) {
      // If clicking the already selected type, deselect it
      setAnimalType("");
      setSpecies(""); // Also clear the species when deselecting type
    } else {
      // Select the new type and clear species
      setAnimalType(type);
      setSpecies("");
    }
  };

  const handleSpeciesSelect = (breed) => {
    setSpecies(breed === species ? "" : breed);
  };

  const handleAdoptClick = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/animals/demandes-adoption/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animal: selectedAnimal.id }),
      });

      if (response.ok) {
        alert("Demande d'adoption envoyée avec succès!");
        setIsModalOpen(false);
      } else if (response.status === 401) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        router.push("/login");
      } else {
        alert("Erreur lors de l'envoi de la demande d'adoption. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Erreur de connexion. Veuillez vérifier votre connexion internet.");
    }
  };

  const handleSeeAllResults = () => {
    // Redirect to the animaux page with search query as URL parameters
    const queryParams = new URLSearchParams();
    if (animalType) queryParams.append("type", animalType);
    if (species) queryParams.append("species", species);

    router.push(`/nos-animaux?${queryParams.toString()}`);
  };

  const fetchAnimalDetails = async (animalId) => {
    setLoading(true);
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/animals/${animalId}/`);
        const data = await response.json();
        setSelectedAnimal(data);
        setIsModalOpen(true);
    } catch (error) {
        console.error('Failed to fetch animal details', error);
    } finally {
        setLoading(false);
    }
  };

  const getCurrentUser = () => {
    if (user) {
      return user.nom; // Normal auth
    } else if (session?.user) {
      return session.user.name; // Google auth
    }
    return "Guest";
  };

  return (
    <div className={"min-h-screen bg-gradient-to-b from-secondary via-secondary/30 to-white ${nunito.className}"}>
      {/* Fixed Navbar at top */}
      <div className="sticky top-0 w-full z-50 bg-white shadow-md">
        <Navbar />
      </div>
      
      
      {/* Main Content */}
      <div className="relative overflow-hidden">
      {/* Animated background elements */}
        <div className="absolute top-20 right-10 opacity-11 animate-bounce">
          <FaDog className="w-24 h-24 text-dark" />
        </div>

        <div className="absolute bottom-40 left-18 opacity-11 animate-pulse">
          <FaCat className="w-32 h-32 text-dark" />
        </div>
        <div className="absolute top-1/3 left-20 transform -translate-y-1/2">
          <FaPaw className="w-16 h-16 text-primary animate-pulse" />
        </div>
        <div className="absolute top-1/2 right-20 transform -translate-y-1/2">
          <FaPaw className="w-16 h-16 text-dark animate-pulse" />
        </div>
  
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side: Welcome Message and Search */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <h1 className="text-4xl font-bold text-dark">
                Bienvenue, {getCurrentUser()}! 🐾
              </h1>
  
              {/* New Button-based Search UI */}
              <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-dark mb-4">Je recherche un...</h2>
                  
                  {/* Animal Type Buttons */}
                  <div className="flex justify-center space-x-4 mb-6">
                    <button
                      onClick={() => handleAnimalTypeSelect("chien")}
                      className={`flex flex-col items-center justify-center px-6 py-4 rounded-xl shadow-md transition-all ${
                        animalType === "chien" 
                          ? "bg-primary text-white scale-105" 
                          : "bg-white text-dark hover:bg-primary/10"
                      }`}
                    >
                      <FaDog className={`text-3xl ${animalType === "chien" ? "text-white" : "text-primary"} mb-2`} />
                      <span className="font-medium">Chien</span>
                    </button>
                    
                    <button
                      onClick={() => handleAnimalTypeSelect("chat")}
                      className={`flex flex-col items-center justify-center px-6 py-4 rounded-xl shadow-md transition-all ${
                        animalType === "chat" 
                          ? "bg-accent text-white scale-105" 
                          : "bg-white text-dark hover:bg-accent/10"
                      }`}
                    >
                      <FaCat className={`text-3xl ${animalType === "chat" ? "text-white" : "text-accent"} mb-2`} />
                      <span className="font-medium">Chat</span>
                    </button>
                  </div>
                  
                  {/* Species/Breed Selection Buttons - Only show if animal type is selected */}
                  {animalType && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-dark mb-3">Race</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {speciesOptions[animalType]?.map((breed) => (
                          <button
                            key={breed}
                            onClick={() => handleSpeciesSelect(breed)}
                            className={`px-3 py-1 rounded-full text-sm transition-all ${
                              species === breed
                                ? animalType === "chien" 
                                  ? "bg-primary text-white" 
                                  : "bg-accent text-white"
                                : "bg-gray-100 text-dark hover:bg-gray-200"
                            }`}
                          >
                            {breed}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Search Button */}
                  <button
                    onClick={handleSearch}
                    className="flex items-center justify-center mx-auto px-6 py-3 bg-dark text-white rounded-full hover:bg-primary transition duration-300 shadow-md"
                    disabled={!animalType}
                  >
                    <FaSearch className="mr-2" />
                    Rechercher
                  </button>
                </div>
              </div>
            </div>
  
            {/* Right Side: Cute Animal Photo */}
            <div className="flex items-center justify-center">
              <Image
                src="/dogandcat.jpeg"
                alt="Cute Animal"
                width={4000}
                height={1500}
                className="shadow-lg hover:scale-105 transition-transform border-4 border-primary"
                style={{
                  borderRadius: "42% 58% 23% 77% / 63% 35% 65% 37%",
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  maxHeight: "400px"
                }}
              />
            </div>
          </div>
  
          {/* Search Results Section */}
          {hasSearched && (
            <div className="bg-white rounded-3xl shadow-2xl mt-8 p-8">
              <h2 className="text-2xl font-bold text-dark mb-6 border-l-4 border-primary pl-4">
                Résultats de recherche
              </h2>
              
              {/* Search filters display */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {animalType && (
                  <span className={`px-3 py-1 rounded-full text-sm text-white ${animalType === "chien" ? "bg-primary" : "bg-accent"}`}>
                    {animalType === "chien" ? "Chien" : "Chat"}
                  </span>
                )}
                {species && (
                  <span className="px-3 py-1 rounded-full text-sm bg-gray-200 text-dark">
                    {species}
                  </span>
                )}
              </div>
              
              {/* Scrollable Container */}
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 py-4 scroll-smooth hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((animal) => (
                    <div
                      key={animal.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 cursor-pointer flex-shrink-0 border-2 border-primary/20"
                      style={{ width: '280px' }}
                      onClick={() => fetchAnimalDetails(animal.id)}
                    >
                      {/* Image Container */}
                      <div className="w-full h-48 overflow-hidden rounded-t-xl relative">
                        {animal.image ? (
                          <Image
                            src={`http://127.0.0.1:8000${animal.image}`}
                            alt={animal.nom}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <FaPaw className="text-4xl text-primary/30" />
                          </div>
                        )}
                      </div>
                      {/* Animal Name */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-dark">{animal.nom}</h3>
                        <p className="text-sm text-primary">{animal.espece}</p>
                        <div className="flex items-center mt-2">
                          <FaPaw className="text-accent mr-2" />
                          <span className="text-dark/70 text-sm">{animal.race}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-8">
                    <p className="text-dark/80">Aucun animal trouvé. Essayez d'autres critères de recherche.</p>
                  </div>
                )}
              </div>
  
              {/* See All Results Button */}
              {searchResults.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleSeeAllResults}
                    className="px-6 py-2 bg-primary text-white rounded-full hover:bg-accent transition-colors flex items-center justify-center mx-auto"
                  >
                    Voir tous les résultats
                    <FaArrowRight className="ml-2" />
                  </button>
                </div>
              )}
            </div>
          )}
  
         {/* Discover More Section */}
<div className="mt-12 space-y-6">
  <h2 className="text-2xl font-bold text-dark">Découvrez-en plus 🌟</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
     {/* Know More About Us */}
     <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105 border-t-4 border-accent">
      <h3 className="text-xl font-semibold text-dark">
        Découvrez qui nous sommes
      </h3>
      <p className="mt-2 text-dark/70">
        Notre mission et notre vision pour le monde animal.
      </p>
      <button
        onClick={() => setSelectedSection(selectedSection === 'about' ? null : 'about')}
        className="mt-4 px-4 py-2 bg-primary text-white rounded-full hover:bg-accent transition flex items-center shadow-md"
      >
        <FaHeart className="mr-2" /> 
        {selectedSection === 'about' ? 'Fermer' : 'En savoir plus'}
      </button>
      {selectedSection === 'about' && (
        <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
          <h4 className="font-bold mb-2 text-primary">Notre Histoire</h4>
          <p className="text-sm text-dark/80">
            Fondée en 2020, Adopti a déjà sauvé plus de 10 000 animaux. 
            Notre réseau de 50 refuges partenaires et notre plateforme innovante
            révolutionnent l'adoption responsable en France.
          </p>
        </div>
      )}
    </div>
    {/* Our Team */}
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105 border-t-4 border-primary">
      <h3 className="text-xl font-semibold text-dark">Notre équipe</h3>
      <p className="mt-2 text-dark/70">
        Rencontrez l'équipe passionnée derrière Adopti.
      </p>
      <button
        onClick={() => setSelectedSection(selectedSection === 'team' ? null : 'team')}
        className="mt-4 px-4 py-2 bg-accent text-white rounded-full hover:bg-primary transition flex items-center shadow-md"
       
      >
        <FaPaw className="mr-2" /> 
        {selectedSection === 'team' ? 'Fermer' : 'En savoir plus'}
      </button>
      {selectedSection === 'team' && (
        <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
          <h4 className="font-bold mb-2 text-primary">Notre Engagement</h4>
          <p className="text-sm text-dark/80">
            Une équipe de 15 professionnels dévoués disponible 24h/24 pour le bien-être animal.
            Vétérinaires, comportementalistes et passionnés unis par une même mission : trouver
            des foyers aimants pour chaque animal.
          </p>
        </div>
      )}
    </div>

  

    {/* Adoption Process */}
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105 border-t-4 border-dark">
      <h3 className="text-xl font-semibold text-dark">
        Processus d'adoption
      </h3>
      <p className="mt-2 text-dark/70">
        Comment donner un foyer à un animal dans le besoin.
      </p>
      <button
        onClick={() => setSelectedSection(selectedSection === 'adoption' ? null : 'adoption')}
        className="mt-4 px-4 py-2 bg-dark text-white rounded-full hover:bg-primary transition flex items-center shadow-md"
      >
        <FaSmile className="mr-2" /> 
        {selectedSection === 'adoption' ? 'Fermer' : 'En savoir plus'}
      </button>
      {selectedSection === 'adoption' && (
        <div className="mt-4 p-4 bg-secondary/10 rounded-lg">
          <h4 className="font-bold mb-2 text-primary">Étapes Clés</h4>
          <ol className="text-sm text-dark/80 list-decimal list-inside">
            <li className="mb-2">Rencontre avec l'animal</li>
            <li className="mb-2">Validation du dossier</li>
            <li className="mb-2">Visite du foyer</li>
            <li>Signature du contrat</li>
          </ol>
          <p className="mt-3 text-xs text-primary">
            Processus complet en 72h maximum !
          </p>
        </div>
      )}
    </div>
  </div>
</div>
  
          {/* Our Services Section - using the improved style from the second page */}
          <div id="our-services" className="bg-white rounded-3xl shadow-2xl mt-8 p-8">
            <h2 className="text-3xl font-bold text-dark mb-8 text-center border-b-2 border-primary pb-4">
              Nos Services <FaHeart className="inline text-accent" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Adoption",
                  description: "Adopter un animal, c'est lui offrir une nouvelle chance et un foyer aimant.",
                  icon: FaDog,
                  link: "/nos-animaux"
                },
                {
                  title: "Service de Garde",
                  description: "Nos soignants garantissent que votre animal soit en sécurité et heureux.",
                  icon: FaHome,
                  link: "/garderie"
                },
                {
                  title: "Boutique",
                  description: "Achetez des produits de qualité pour garder vos compagnons heureux.",
                  icon: FaShoppingBag,
                  link: "/boutique"
                },
                {
                  title: "Marche avec les Chiens",
                  description: "Rejoignez-nous pour des événements de marche avec les chiens.",
                  icon: FaWalking,
                  link: "/marche"
                },
              ].map((service, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-transform p-6 border-t-4 border-primary"
                >
                  <div className="text-primary mb-4">
                    <service.icon className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark mb-2">{service.title}</h3>
                  <p className="text-dark/70 text-sm">{service.description}</p>
                  <button
                    onClick={() => router.push(service.link)}
                    className="mt-4 text-primary hover:text-accent flex items-center text-sm"
                  >
                    En savoir plus <FaArrowRight className="ml-2" />
                  </button>
                </div>
              ))}
            </div>
          </div>
  
          {/* Footer Component - Add before the final closing div */}
<div className="mt-16 bg-gray-100 border-t-4 border-primary">
  <div className="max-w-6xl mx-auto px-4 py-8">
    {/* Footer Top - Main Sections */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-primary" /> Contact
        </h3>
        <ul className="space-y-3 text-dark/80">
          <li className="flex items-start">
            <FaHome className="mt-1 mr-2 text-primary flex-shrink-0" />
            <span>123 Rue des Animaux, 75001 Paris, France</span>
          </li>
          <li className="flex items-center">
            <FaPhone className="mr-2 text-primary flex-shrink-0" />
            <span>01 23 45 67 89</span>
          </li>
          <li className="flex items-center">
            <FaEnvelope className="mr-2 text-primary flex-shrink-0" />
            <span>contact@adopti.fr</span>
          </li>
        </ul>
      </div>

      {/* Horaires */}
      <div>
        <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
          <FaClock className="mr-2 text-primary" /> Horaires
        </h3>
        <ul className="space-y-2 text-dark/80">
          <li>Lundi - Vendredi: 9h - 19h</li>
          <li>Samedi: 10h - 18h</li>
          <li>Dimanche: 10h - 16h</li>
          <li className="text-primary font-semibold mt-2">
            Permanence téléphonique 24h/24
          </li>
        </ul>
      </div>

      {/* Liens Rapides */}
      <div>
        <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
          <FaLink className="mr-2 text-primary" /> Liens Rapides
        </h3>
        <ul className="space-y-2 text-dark/80">
          <li>
            <button className="hover:text-primary flex items-center">
              <FaPaw className="mr-2 text-xs" /> Nos animaux
            </button>
          </li>
          <li>
            <button className="hover:text-primary flex items-center">
              <FaPaw className="mr-2 text-xs" /> Faire un don
            </button>
          </li>
          <li>
            <button className="hover:text-primary flex items-center">
              <FaPaw className="mr-2 text-xs" /> Devenir bénévole
            </button>
          </li>
          <li>
            <button className="hover:text-primary flex items-center">
              <FaPaw className="mr-2 text-xs" /> Mentions légales
            </button>
          </li>
        </ul>
      </div>

      {/* Newsletter */}
      <div>
        <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
          <FaEnvelopeOpen className="mr-2 text-primary" /> Newsletter
        </h3>
        <p className="text-dark/80 mb-3">Recevez nos actualités et promotions</p>
        <div className="flex">
          <input
            type="email"
            placeholder="Votre email"
            className="px-3 py-2 rounded-l-lg border border-accent focus:outline-none focus:ring-1 focus:ring-primary w-full"
          />
          <button className="bg-primary text-white px-3 py-2 rounded-r-lg hover:bg-accent transition">
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>

    {/* Social Media */}
    <div className="flex justify-center space-x-6 py-6 border-t border-dark/10">
      {[
        { icon: FaFacebook, label: "Facebook" },
        { icon: FaTwitter, label: "Twitter" },
        { icon: FaInstagram, label: "Instagram" },
        { icon: FaYoutube, label: "YouTube" },
      ].map((social, index) => (
        <button 
          key={index} 
          className="w-10 h-10 rounded-full bg-primary hover:bg-accent transition-colors flex items-center justify-center text-white"
          aria-label={social.label}
        >
          <social.icon />
        </button>
      ))}
    </div>

    {/* Copyright */}
    <div className="text-center pt-4 border-t border-dark/10 text-dark/70">
      <p>© 2025 Adopti - Association pour la protection animale - SIRET: 123 456 789 00012</p>
      <p className="text-xs mt-2">Tous droits réservés - Site développé avec ❤️ pour les animaux</p>
    </div>
  </div>
</div>
        </div>
      </div>
  
      {/* Animal Details Modal */}
      {isModalOpen && selectedAnimal && (
        <div className="fixed inset-0 flex items-center justify-center bg-dark/70 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
              <h2 className="text-2xl font-bold">{selectedAnimal.nom}</h2>
              <p className="opacity-90">{selectedAnimal.espece} - {selectedAnimal.race}</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Basic Information */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-dark">Espèce</h2>
                  <p className="text-primary">{selectedAnimal.espece}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-dark">Race</h2>
                  <p className="text-primary">{selectedAnimal.race}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-dark">Type de Garde</h2>
                  <p className="text-primary">{selectedAnimal.type_garde}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-dark">Sexe</h2>
                  <p className="text-primary">{selectedAnimal.sexe === 'M' ? 'Mâle' : 'Femelle'}</p>
                </div>
              </div>
  
              {/* Right Side: Description */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-dark">Date de Naissance</h2>
                  <p className="text-primary">{selectedAnimal.date_naissance}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-dark">Description</h2>
                  <p className="text-primary">{selectedAnimal.description}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 p-4 flex justify-end gap-4">
              <button
                onClick={handleAdoptClick}
                className="px-6 py-2 bg-accent text-white rounded-full hover:bg-primary transition-colors"
              >
                Adopter
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-dark/10 text-dark rounded-full hover:bg-dark/20"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
        
      )}
    </div>
  );
}