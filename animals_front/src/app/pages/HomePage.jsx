"use client";
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Nunito } from "next/font/google";
import { FaPaw, FaSmile, FaHeart, FaBars, FaBell } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import Navbar from "./NavbarPage";
import { authenticatedFetch } from '../../app/authInterceptor';

const nunito = Nunito({ subsets: ["latin"] });

export default function Home() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animalType, setAnimalType] = useState(""); // 'cat' or 'dog'
  const [species, setSpecies] = useState(""); // Specific species (e.g., 'Persian', 'Labrador')
  const [searchResults, setSearchResults] = useState([]); // Store search results
  const scrollContainerRef = useRef(null);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

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
      if (searchQuery) queryParams.append("query", searchQuery);
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
    if (searchQuery) queryParams.append("query", searchQuery);
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
    <div className="flex flex-col min-h-screen">
              <Navbar />

      <div className={`min-h-screen bg-secondary bg-opacity-40 ${nunito.className}`}>
        {/* Navbar */}
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side: Welcome Message and Search */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <h1 className="text-4xl font-bold text-accent">
                Bienvenue, {getCurrentUser()}! 🐾
              </h1>

              {/* Search Bar */}
              <div className="w-full max-w-md space-y-4">
                <input
                  type="text"
                  placeholder="Rechercher un animal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-full border border-accent focus:outline-none focus:ring-2 focus:ring-primary shadow-md"
                />
                <select
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  className="w-full px-4 py-2 rounded-full border border-accent focus:outline-none focus:ring-2 focus:ring-primary shadow-md"
                >
                  <option value="">Type d'animal</option>
                  <option value="chien">Chien</option>
                  <option value="chat">Chat</option>
                </select>
                {animalType && (
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full px-4 py-2 rounded-full border border-accent focus:outline-none focus:ring-2 focus:ring-primary shadow-md"
                  >
                    <option value="">Sélectionner une race</option>
                    {speciesOptions[animalType]?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-2 bg-primary text-white rounded-full hover:bg-accent transition duration-300 shadow-md"
                >
                  Rechercher
                </button>
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
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-primary mb-4">Résultats de recherche</h2>
              
              {/* Scrollable Container */}
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-4 py-4 scroll-smooth hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((animal) => (
                    <div
                      key={animal.id}
                      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 cursor-pointer flex-shrink-0 border border-accent"
                      style={{ width: '220px' }}
                      onClick={() => fetchAnimalDetails(animal.id)}
                    >
                      {/* Image Container */}
                      <div className="w-full h-48 overflow-hidden rounded-t-lg">
                        {animal.image ? (
                          <img
                            src={`http://127.0.0.1:8000${animal.image}`}
                            alt={animal.nom}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-secondary">
                            <p className="text-dark italic">Pas de photo disponible</p>
                          </div>
                        )}
                      </div>
                      {/* Animal Name */}
                      <div className="p-3 text-center">
                        <h3 className="text-lg font-semibold text-dark">{animal.nom}</h3>
                        <p className="text-sm text-primary">{animal.espece} - {animal.race}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-8">
                    <p className="text-dark">Aucun animal trouvé. Essayez d'autres critères de recherche.</p>
                  </div>
                )}
              </div>

              {/* See All Results Button */}
              {searchResults.length > 0 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleSeeAllResults}
                    className="px-6 py-2 bg-accent text-white rounded-full hover:bg-primary transition duration-300 shadow-md"
                  >
                    Voir tous les résultats
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Animal Details Modal */}
          {isModalOpen && selectedAnimal && (
            <div className="fixed inset-0 flex items-center justify-center bg-dark bg-opacity-70 p-4 backdrop-blur-sm z-50">
              <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <h1 className="text-3xl font-bold text-primary mb-4 col-span-2 text-center border-b border-accent pb-2">
                    {selectedAnimal.nom}
                  </h1>

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

                <div className="bg-secondary px-6 py-4 flex justify-end space-x-4">
                  <button 
                    onClick={handleAdoptClick} 
                    className="bg-accent text-white px-6 py-2 rounded-full hover:bg-primary transition-colors shadow-md"
                  >
                    Adopter
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="bg-dark text-white px-6 py-2 rounded-full hover:opacity-80 transition-colors shadow-md"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Discover More Section */}
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold text-accent">Découvrez-en plus 🌟</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Our Team */}
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105 border-t-4 border-primary">
                <h3 className="text-xl font-semibold text-dark">Notre équipe</h3>
                <p className="mt-2 text-dark/70">
                  Rencontrez l'équipe passionnée derrière Pawfect Home.
                </p>
                <button
                  onClick={() => router.push("/team")}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-full hover:bg-accent transition flex items-center shadow-md"
                >
                  <FaPaw className="mr-2" /> En savoir plus
                </button>
              </div>

              {/* Know More About Us */}
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105 border-t-4 border-accent">
                <h3 className="text-xl font-semibold text-dark">
                  Découvrez qui nous sommes
                </h3>
                <p className="mt-2 text-dark/70">
                  Découvrez notre mission et comment nous aidons les animaux à trouver des foyers aimants.
                </p>
                <button
                  onClick={() => router.push("/about")}
                  className="mt-4 px-4 py-2 bg-accent text-white rounded-full hover:bg-primary transition flex items-center shadow-md"
                >
                  <FaHeart className="mr-2" /> En savoir plus
                </button>
              </div>

              {/* Adoption Process */}
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105 border-t-4 border-dark">
                <h3 className="text-xl font-semibold text-dark">
                  Processus d'adoption
                </h3>
                <p className="mt-2 text-dark/70">
                  Découvrez comment adopter un compagnon animal dès aujourd'hui.
                </p>
                <button
                  onClick={() => router.push("/adoption")}
                  className="mt-4 px-4 py-2 bg-dark text-white rounded-full hover:bg-primary transition flex items-center shadow-md"
                >
                  <FaSmile className="mr-2" /> En savoir plus
                </button>
              </div>
            </div>
          </div>

          {/* Our Services Section */}
          <div id="our-services" className="mt-16 space-y-6">
            <h2 className="text-3xl font-bold text-accent text-center mb-6">Nos Services 🐶</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Adoption",
                  description: "Adopter un animal, c'est lui offrir une nouvelle chance et un foyer aimant. En adoptant, vous faites une différence dans sa vie et dans la vôtre.",
                  image: "/adoption.jpg",
                  bgColor: "bg-dark/40",
                  borderColor: "border-secondary"
                },
                {
                  title: "Service de Garde",
                  description: "Besoin de soins pour votre animal pendant votre absence ? Nos soignants de confiance garantissent que votre animal soit en sécurité et heureux.",
                  image: "/garderie.jpg",
                  bgColor: "bg-dark/40",
                  borderColor: "border-accent"
                },
                {
                  title: "Boutique",
                  description: "Achetez des produits de qualité pour animaux afin de garder vos compagnons heureux et en bonne santé.",
                  image: "/boutique.jpg",
                  bgColor: "bg-dark/40",
                  borderColor: "border-dark"
                },
                {
                  title: "Événement de Marche avec les Chiens",
                  description: "Rejoignez-nous pour des événements de marche avec les chiens, l'occasion de socialiser et de faire de l'exercice avec d'autres amoureux des animaux.",
                  image: "/marche.jpg",
                  bgColor: "bg-dark/40",
                  borderColor: "border-primary"
                },
              ].map((service, index) => (
                <div 
                  key={index} 
                  className={`${service.bgColor} p-6 rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-105 flex flex-col items-center border-l-4 ${service.borderColor}`}
                >
                  {/* Service Image */}
                  <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover"
                      quality={100}
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  {/* Title and description */}
                  <h3 className="text-xl font-semibold text-secondary mt-2">{service.title}</h3>
                  <p className="mt-2 text-accent text-center">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}