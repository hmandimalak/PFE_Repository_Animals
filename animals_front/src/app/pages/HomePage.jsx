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
  const [animalType, setAnimalType] = useState(""); // 'cat' or 'dog'
  const [species, setSpecies] = useState(""); // Specific species (e.g., 'Persian', 'Labrador')
  const [searchResults, setSearchResults] = useState([]); // Store search results
  const router = useRouter();

  const speciesOptions = {
    dog: [
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
    cat: [
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
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
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

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-pastel-blue">Search Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {searchResults.map((animal) => (
                  <div
                    key={animal.id}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
                    onClick={() => router.push(`/animals/${animal.id}`)} // Navigate to animal details
                  >
                    {animal.image && (
                      <div className="relative h-48 w-full mb-4">
                        <Image
                          src={`http://127.0.0.1:8000${animal.image}`}
                          alt={animal.nom}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-800">{animal.nom}</h3>
                    <p className="text-sm text-gray-600">{animal.espece}</p>
                    <p className="text-sm text-gray-600">{animal.race}</p>
                  </div>
                ))}
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