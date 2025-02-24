"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Nunito } from "next/font/google";
import { FaPaw, FaSmile, FaHeart, FaBars, FaBell } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import Navbar from "./NavbarPage"; // Adjust the path if needed

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
  }, [session, status]);

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
    } catch (error) {
      console.error("Error searching animals:", error);
    }
  };
  const getAuthToken = () => {
    console.log("Session:", session);
    console.log("Local storage token:", localStorage.getItem('access_token'));

    const localToken = localStorage.getItem('access_token');
    if (localToken) {
        return `Bearer ${localToken}`;
    }

    if (session?.accessToken) {
        return `Bearer ${session.accessToken}`;
    }

    if (session?.user?.token) {
        return `Bearer ${session.user.token}`;
    }

    return null;
};

const handleAdoptClick = async () => {
    try {
        const authToken = getAuthToken();

        if (!authToken) {
            console.log("No auth token found - redirecting to login");
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            router.push('/login');
            return;
        }

        const requestBody = {
            animal: selectedAnimal.id,
        };

        console.log("Sending request with token:", authToken);

        const response = await fetch('http://127.0.0.1:8000/api/animals/demandes-adoption/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken,
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Adoption request successful:', data);
            alert('Demande d\'adoption envoyée avec succès!');
            setIsModalOpen(false);
        } else {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            if (response.status === 401) {
                alert('Votre session a expiré. Veuillez vous reconnecter.');
                router.push('/login');
            } else {
                alert('Erreur lors de l\'envoi de la demande d\'adoption. Veuillez réessayer.');
            }
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Erreur de connexion. Veuillez vérifier votre connexion internet.');
    }
};

  const handleSeeAllResults = () => {
    // Redirect to the animaux page with search query as URL parameters
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append("query", searchQuery);
    if (animalType) queryParams.append("type", animalType);
    if (species) queryParams.append("species", species);

    router.push(`/animaux?${queryParams.toString()}`);
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
    <div className="@container max-w-full resize-x overflow-auto">
      <div className={`min-h-screen bg-pastel-pink ${nunito.className}`}>
        {/* Navbar */}
        <Navbar />
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Right Side: Search Bar and Welcome Message */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <h1 className="text-4xl font-bold text-pastel-blue">
                Bienvenue, {getCurrentUser()}! 🐾
              </h1>

              {/* Search Bar */}
              <div className="w-full max-w-md space-y-4">
                <input
                  type="text"
                  placeholder="Search for pets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-full border border-pastel-blue focus:outline-none focus:ring-2 focus:ring-pastel-blue"
                />
                <select
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  className="w-full px-4 py-2 rounded-full border border-pastel-blue focus:outline-none focus:ring-2 focus:ring-pastel-blue"
                >
                  <option value="">Select Animal Type</option>
                  <option value="chien">chien</option>
                  <option value="chat">chat</option>
                </select>
                {animalType && (
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full px-4 py-2 rounded-full border border-pastel-blue focus:outline-none focus:ring-2 focus:ring-pastel-blue"
                  >
                    <option value="">Select Species</option>
                    {speciesOptions[animalType]?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-2 bg-pastel-blue text-white rounded-full hover:bg-pastel-green transition"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Left Side: Cute Animal Photo */}
            <div className="flex items-center justify-center">
              <Image
                src="/dogandcat.jpeg"
                alt="Cute Animal"
                width={4000}
                height={1500}
                className="shadow-lg hover:scale-110 transition-transform"
                style={{
                  borderRadius: "42% 58% 23% 77% / 63% 35% 65% 37%",
                  objectFit: "cover",
                  width: "100vw",
                  height: "50vh",
                }}
              />
            </div>
          </div>

          {/* Search Results Bar */}
          {searchResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-pastel-blue">Search Results</h2>
              <div className="flex overflow-x-auto gap-4 py-4">
                {searchResults.map((animal) => (
                  <div
                    key={animal.id}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer min-w-[200px]"
                    onClick={() => fetchAnimalDetails(animal.id)}>
                    {animal.image && (
                      <div className="relative h-48">
                      {animal.image ? (
                          <img src={`http://127.0.0.1:8000${animal.image}`} alt={animal.nom} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <p className="text-gray-500 italic">Pas de photo disponible</p>
                          </div>
                      )}
                  </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-800">{animal.nom}</h3>
                    <p className="text-sm text-gray-600">{animal.espece}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSeeAllResults}
                className="mt-4 px-4 py-2 bg-pastel-green text-white rounded-full hover:bg-pastel-blue transition"
              >
                See All Results
              </button>
            </div>
          )}
          {isModalOpen && selectedAnimal && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden transform transition-all duration-300 ease-in-out">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <h1 className="text-3xl font-bold text-center text-pink-600 mb-6 col-span-2">Détails de l'Animal</h1>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Nom</h2>
                        <p className="text-gray-600">{selectedAnimal.nom}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Espèce</h2>
                        <p className="text-gray-600">{selectedAnimal.espece}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Race</h2>
                        <p className="text-gray-600">{selectedAnimal.race}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Date de Naissance</h2>
                        <p className="text-gray-600">{selectedAnimal.date_naissance}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Sexe</h2>
                        <p className="text-gray-600">{selectedAnimal.sexe === 'M' ? 'Male' : 'Femelle'}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                        <p className="text-gray-600">{selectedAnimal.description}</p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Type de Garde</h2>
                        <p className="text-gray-600">{selectedAnimal.type_garde}</p>
                    </div>
                    {selectedAnimal.type_garde === 'Temporaire' && (
                        <>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Date de Début</h2>
                                <p className="text-gray-600">{selectedAnimal.date_reservation}</p>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Date de Fin</h2>
                                <p className="text-gray-600">{selectedAnimal.date_fin}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4">
                <button onClick={handleAdoptClick} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                    Adopter
                </button>
                <button onClick={() => setIsModalOpen(false)} className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors">
                    Fermer
                </button>
            </div>
        </div>
    </div>
)}

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