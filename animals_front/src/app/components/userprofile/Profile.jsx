"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../app/pages/NavbarPage";
import EditProfile from "./Edit";
import Image from "next/image";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { FaKey, FaPen ,FaSave} from "react-icons/fa"; // Import the key and pen icons
 
// Function to fetch temporary animals
const fetchTemporaryAnimals = async () => {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/animals/mes-animaux-temporaire/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching temporary animals:", error);
        return [];
    }
};

// Function to fetch definitive animals
const fetchDefinitiveAnimals = async () => {
  try {
      const response = await fetch("http://127.0.0.1:8000/api/animals/mes-animaux-definitive/", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error fetching definitive animals:", error);
      return [];
  }
};

// Function to fetch adopted animals
const fetchAdoptedAnimals = async () => {
  try {
      const response = await fetch("http://127.0.0.1:8000/api/animals/mes-adoptions/", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
      });
      if (!response.ok) throw new Error("Failed to fetch adopted animals");
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error fetching adopted animals:", error);
      return [];
  }
};

// Function to fetch animal details by ID
const fetchAnimalDetails = async (animalId) => {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/animals/${animalId}/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch animal details", error);
    }
};

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState("profile");
    const [garderieType, setGarderieType] = useState(null);
    const [showGarderieOptions, setShowGarderieOptions] = useState(false);
    const [animals, setAnimals] = useState([]);
    const [adoptedAnimals, setAdoptedAnimals] = useState([]); // State to store adopted animals
    const [refreshCounter, setRefreshCounter] = useState(0); 

    const [selectedAnimal, setSelectedAnimal] = useState(null); // State to store selected animal details
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

    const router = useRouter();
    
    // Function to refresh user data
    const refreshUserData = () => {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        
        if (!token) {
            router.push("/login");
            return;
        }

        fetch("http://127.0.0.1:8000/api/auth/profile/", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }
                return response.json();
            })
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching user profile:", error);
                setError("Failed to load profile.");
                setLoading(false);
            });
    };

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            router.push("/login"); // Redirect if not logged in
            return;
        }

        refreshUserData();
    }, []);

    // Update this effect to depend on activeSection and refreshCounter
    useEffect(() => {
        if (activeSection === "profile") {
            refreshUserData();
        }
    }, [activeSection, refreshCounter]);

    useEffect(() => {
      if (garderieType === "temporaire") {
          fetchTemporaryAnimals().then((data) => {
              setAnimals(data);
          });
      } else if (garderieType === "definitive") {
          fetchDefinitiveAnimals().then((data) => {
              setAnimals(data);
          });
      }
    }, [garderieType]);

    // Handle setting active section with refresh
    const handleSetActiveSection = (section) => {
        setActiveSection(section);
        if (section === "profile") {
            // Force a refresh when switching to profile
            setRefreshCounter(prev => prev + 1);
        }
    };

    const handleAnimalClick = (id) => {
        fetchAnimalDetails(id).then((data) => {
            setSelectedAnimal(data); // Store the animal details in state
            setIsModalOpen(true); // Open the modal
        });
    };

    // Fetch adopted animals when "Mes Adoptions" section is clicked
    useEffect(() => {
      if (activeSection === "adoptions") {
          fetchAdoptedAnimals().then((data) => {
              setAdoptedAnimals(data);
          });
      }
    }, [activeSection]);

    // Helper function to get image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        // If it's already a full URL, return it
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // Otherwise, prepend the base URL
        return `http://127.0.0.1:8000${imagePath}`;
    };

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-secondary to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto  bg-white rounded-2xl shadow-xl p-10 text-dark w-full transform transition-all duration-300 hover:shadow-2xl flex flex-row">             
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-lg  p-5 sticky top-0 h-screen">
                    <div className="flex items-center space-x-3 mb-6">
                        <AccountCircleIcon style={{ fontSize: 40, color: "blue-100" }} />
                        <h2 className="text-xl font-bold text-pastel-pink">Mon Compte</h2>
                    </div>
                    <ul className="space-y-3">
                        <li>
                            <button
                                onClick={() => {
                                    setActiveSection("profile");
                                    setGarderieType(null);
                                }}
                                className={`w-full text-left p-2 rounded-lg transition-all duration-300 ${
                                    activeSection === "profile"
                                        ? "bg-pastel-pink text-dark shadow-md"
                                        : "text-gray-800 hover:bg-primary hover:text-dark hover:shadow-md"
                                }`}
                            >
                                Informations Personnelles
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setShowGarderieOptions(!showGarderieOptions)}
                                className={`w-full text-left p-2 rounded-lg transition-all duration-300 ${
                                    activeSection === "garderie"
                                       ? "bg-pastel-pink text-dark shadow-md"
                                        : "text-gray-800 hover:bg-primary hover:text-dark hover:shadow-md"
                                }`}
                            >
                                Animaux en Garderie
                            </button>
                            {showGarderieOptions && (
                                <ul className="mt-2 space-y-1 pl-4">
                                    <li>
                                        <button
                                            onClick={() => {
                                                setActiveSection("garderie");
                                                setGarderieType("temporaire");
                                            }}
                                            className={`w-full text-left p-2 rounded-lg transition-all duration-300 ${
                                                garderieType === "temporaire"
                                                   ? "bg-pastel-pink text-dark shadow-md"
                                                    : "text-gray-800 hover:bg-primary hover:text-dark hover:shadow-md"
                                            }`}
                                        >
                                            Temporaire
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => {
                                                setActiveSection("garderie");
                                                setGarderieType("definitive");
                                            }}
                                            className={`w-full text-left p-2 rounded-lg transition-all duration-300 ${
                                                garderieType === "definitive"
                                                    ? "bg-pastel-pink text-dark shadow-md"
                                        : "text-gray-800 hover:bg-primary hover:text-dark hover:shadow-md"
                                            }`}
                                        >
                                            Définitive
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    setActiveSection("adoptions");
                                    setGarderieType(null);
                                }}
                                className={`w-full text-left p-2 rounded-lg transition-all duration-300 ${
                                    activeSection === "adoptions"
                                       ? "bg-pastel-pink text-dark shadow-md"
                                        : "text-gray-800 hover:bg-primary hover:text-dark hover:shadow-md"
                                }`}
                            >
                                Mes Adoptions
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                {activeSection === "profile" && user && (
          <div className="space-y-8 animate-fade-in">
            <div className="mb-10 text-center space-y-2">
              <h1 className="text-5xl font-extrabold text-primary animate-fade-in-down">
                Votre Profil
              </h1>
              <p className="text-dark/80">Gérez vos informations personnelles</p>
              <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6 border-r-2 border-accent/20 pr-8">
                <div className="animate-slide-in-left">
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Photo de Profil
                  </label>
                  <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden">
                    {user.profilepicture ? (
                      <img 
                        src={user.profilepicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <AccountCircleIcon className="text-gray-400 text-6xl" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="animate-slide-in-left delay-100">
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Nom Complet
                  </label>
                  <div className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl bg-gray-50">
                    {user.nom} {user.prenom}
                  </div>
                </div>

                <div className="animate-slide-in-left delay-200">
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Email
                  </label>
                  <div className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl bg-gray-50">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 pl-8">
                <div className="animate-slide-in-right">
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Téléphone
                  </label>
                  <div className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl bg-gray-50">
                    {user.telephone || 'Non spécifié'}
                  </div>
                </div>

                <div className="animate-slide-in-right delay-100">
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Adresse
                  </label>
                  <div className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl bg-gray-50">
                    {user.adresse || 'Non spécifiée'}
                  </div>
                </div>

                <div className="animate-slide-in-right delay-200">
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Rôle
                  </label>
                  <div className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl bg-gray-50">
                    {user.role}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 animate-fade-in-up">
              <button
                onClick={() => setActiveSection("editProfile")}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-transform shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
              >
                <FaPen className="text-lg" />
                Modifier le Profil
              </button>
            </div>
          </div>
        )}
        
                {activeSection === "editProfile" && <EditProfile user={user} setActiveSection={handleSetActiveSection}  />}
                {/* Updated Animal Sections */}
                {(activeSection === "garderie" || activeSection === "adoptions") && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-extrabold text-primary">
                                {activeSection === "garderie" 
                                    ? `Animaux en Garderie ${garderieType}`
                                    : "Mes Adoptions"}
                            </h1>
                            <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
                        </div>

                        {animals.length === 0 ? (
                            <div className="text-center p-8 border-2 border-dashed border-accent/30 rounded-xl">
                                <p className="text-dark/60">Aucun animal trouvé</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {animals.map((animal) => (
                                    <div 
                                        key={animal.id}
                                        className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer"
                                        onClick={() => handleAnimalClick(animal.id)}
                                    >
                                    
                                            <div className="relative h-56">
                                                {animal.image ? (
                                                    <img
                                                        src={getImageUrl(animal.image)}
                                                        alt={animal.nom}
                                                        className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-90"
                                                        onError={(e) => {
                                                            console.error("Image failed to load:", animal.image);
                                                            e.target.src = "/placeholder-pet.jpg"; // Fallback image
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                        <p className="text-gray-500 italic">Pas de photo disponible</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h2 className="text-2xl font-semibold text-gray-800">{animal.nom}</h2>
                                                <p className="text-sm text-gray-500 mt-2">{animal.espece}</p>
                                                <p className="text-gray-600">{animal.race}</p>
                                                
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    </main>
            </div>
            
            {/* Modal for Animal Details */}
            {isModalOpen && selectedAnimal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden transform transition-all duration-300 ease-in-out">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-pastel-pink transition duration-300"
                            >
                                ✕
                            </button>
                            <h1 className="text-3xl font-bold text-center text-pastel-pink mb-6 col-span-2">Détails de l'Animal</h1>
                            {selectedAnimal.image && (
                                <div className="col-span-2 flex justify-center">
                                    <img 
                                        src={getImageUrl(selectedAnimal.image)} 
                                        alt={selectedAnimal.nom} 
                                        className="h-64 object-contain rounded-lg"
                                        onError={(e) => {
                                            console.error("Modal image failed to load:", selectedAnimal.image);
                                            e.target.src = "/placeholder-pet.jpg";
                                        }}
                                    />
                                </div>
                            )}
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
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                                    <p className="text-gray-600">{selectedAnimal.description}</p>
                                </div>
                                {selectedAnimal.date_reservation && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">Date de Début</h2>
                                        <p className="text-gray-600">{selectedAnimal.date_reservation}</p>
                                    </div>
                                )}
                                {selectedAnimal.date_fin && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">Date de Fin</h2>
                                        <p className="text-gray-600">{selectedAnimal.date_fin}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}