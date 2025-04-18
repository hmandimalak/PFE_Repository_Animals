"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../app/pages/NavbarPage";
import EditProfile from "./Edit";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
<<<<<<< HEAD
import { FaPen } from "react-icons/fa";
import { authenticatedFetch } from '../../../app/authInterceptor';
=======
import { FaKey, FaPen, FaSave, FaBoxOpen } from "react-icons/fa"; // Import the key and pen icons
import { authenticatedFetch } from '../../../app/authInterceptor'

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
>>>>>>> 552f46f45d223de8dfd76baf4f43aa2ec0fb1847

// Centralized API service
const api = {
  fetchUserProfile: async () => {
    return authenticatedFetch("http://127.0.0.1:8000/api/auth/profile/");
  },
  
  fetchTemporaryAnimals: async () => {
    return authenticatedFetch("http://127.0.0.1:8000/api/animals/mes-animaux-temporaire/");
  },
  
  fetchDefinitiveAnimals: async () => {
    return authenticatedFetch("http://127.0.0.1:8000/api/animals/mes-animaux-definitive/");
  },
  
  fetchAdoptedAnimals: async () => {
    return authenticatedFetch("http://127.0.0.1:8000/api/animals/mes-adoptions/");
  },
  
  fetchAnimalDetails: async (animalId) => {
    return authenticatedFetch(`http://127.0.0.1:8000/api/animals/${animalId}/`);
  },
  
  fetchOrders: async () => {
    return authenticatedFetch('http://127.0.0.1:8000/api/boutique/mes-commandes/');
  }
};

// Helper functions
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.startsWith('http') ? imagePath : `http://127.0.0.1:8000${imagePath}`;
};

export default function Profile() {
<<<<<<< HEAD
  const router = useRouter();
  
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [garderieType, setGarderieType] = useState(null);
  const [showGarderieOptions, setShowGarderieOptions] = useState(false);
  
  // Data states
  const [animals, setAnimals] = useState([]);
  const [adoptedAnimals, setAdoptedAnimals] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // UI states
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
=======
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
    const [orders, setOrders] = useState([]);

    const router = useRouter();
>>>>>>> 552f46f45d223de8dfd76baf4f43aa2ec0fb1847
    
    fetchUserData();
  }, [router]);
  
  // Fetch user profile data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.fetchUserProfile().then(res => res.json());
      setUser(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Handle active section changes
  useEffect(() => {
    // Reset loading state when changing sections
    setLoading(true);
    
    const fetchSectionData = async () => {
      try {
        switch(activeSection) {
          case "profile":
            await fetchUserData();
            break;
            
          case "garderie":
            if (garderieType === "temporaire") {
              const data = await api.fetchTemporaryAnimals().then(res => res.json());
              setAnimals(data || []);
            } else if (garderieType === "definitive") {
              const data = await api.fetchDefinitiveAnimals().then(res => res.json());
              setAnimals(data || []);
            }
            break;
            
          case "adoptions":
            const adoptionsData = await api.fetchAdoptedAnimals().then(res => res.json());
            setAdoptedAnimals(adoptionsData || []);
            break;
            
          case "commandes":
            const ordersData = await api.fetchOrders().then(res => res.json());
            setOrders(ordersData || []);
            break;
        }
      } catch (err) {
        console.error(`Error loading data for section ${activeSection}:`, err);
        setError(`Failed to load data for ${activeSection}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSectionData();
  }, [activeSection, garderieType, fetchUserData]);
  
  // Handle animal selection for modal
  const handleAnimalClick = useCallback(async (id) => {
    try {
      const data = await api.fetchAnimalDetails(id).then(res => res.json());
      setSelectedAnimal(data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching animal details:", err);
    }
  }, []);
  
  // Handle section change with better naming
  const handleSectionChange = useCallback((section, garderieOption = null) => {
    setActiveSection(section);
    if (garderieOption) {
      setGarderieType(garderieOption);
    }
  }, []);
  
  if (loading && !user) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  if (error && !user) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-500 text-center p-4">
        <p className="text-xl font-bold">Error</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    </div>
  );

<<<<<<< HEAD
  // Render AnimalCard component
  const AnimalCard = ({ animal }) => (
    <div 
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
              e.target.src = "/placeholder-pet.jpg";
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
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-secondary to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-10 text-dark w-full transform transition-all duration-300 hover:shadow-2xl flex flex-row">             
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg p-5 sticky top-0 h-screen">
          <div className="flex items-center space-x-3 mb-6">
            <AccountCircleIcon style={{ fontSize: 40, color: "blue-100" }} />
            <h2 className="text-xl font-bold text-pastel-pink">Mon Compte</h2>
          </div>
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => handleSectionChange("profile")}
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
                      onClick={() => handleSectionChange("garderie", "temporaire")}
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
                      onClick={() => handleSectionChange("garderie", "definitive")}
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
                onClick={() => handleSectionChange("adoptions")}
                className={`w-full text-left p-2 rounded-lg transition-all duration-300 ${
                  activeSection === "adoptions"
                    ? "bg-pastel-pink text-dark shadow-md"
                    : "text-gray-800 hover:bg-primary hover:text-dark hover:shadow-md"
                }`}
              >
                Mes Adoptions
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("commandes")}
                className={`w-full text-left p-2 rounded-lg transition-all duration-300 ${
                  activeSection === "commandes"
                    ? "bg-pastel-pink text-dark shadow-md"
                    : "text-gray-800 hover:bg-primary hover:text-dark hover:shadow-md"
                }`}
              >
                Mes Commandes
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
=======
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
    
    useEffect(() => {
        if (activeSection === "commandes") {
          fetchOrders().then(data => {
            console.log("Fetched orders:", data); // Log orders to check structure
            setOrders(data);
          });
          console.log("Orders:", orders); // Log orders to check structure
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

    const fetchOrders = async () => {
        try {
          const response = await authenticatedFetch('http://127.0.0.1:8000/api/boutique/mes-commandes/');
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching orders:', error);
          return [];
        }
    };

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-secondary to-white">
        <Navbar />

        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-10 text-dark w-full transform transition-all duration-300 hover:shadow-2xl flex flex-row">             
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-lg p-5 sticky top-0 h-screen">
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
                        <li>
                          <button
                            onClick={() => {
                              setActiveSection("commandes");
                              setGarderieType(null);
                            }}
                            className={`w-full text-left p-2 rounded-lg transition-all duration-300 ${
                              activeSection === "commandes"
                                ? "bg-pastel-pink text-dark shadow-md"
                                : "text-gray-800 hover:bg-primary hover:text-dark hover:shadow-md"
                            }`}
                          >
                            Mes Commandes
                          </button>
                        </li>
                    </ul>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                {activeSection === "commandes" && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center space-y-4">
                      <h1 className="text-5xl font-extrabold text-primary">Mes Commandes</h1>
                      <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center p-8 border-2 border-dashed border-accent/30 rounded-xl">
                        <p className="text-dark/60">Aucune commande trouvée</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map(order => (
                          <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h2 className="text-xl font-semibold text-primary">
                                  Commande #{order.numero_commande || order.id}
                                </h2>
                                <p className="text-dark/60">
                                  {new Date(order.date_commande || order.created_at || new Date()).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                order.statut === 'livrée' ? 'bg-green-100 text-green-800' :
                                order.statut === 'annulée' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.statut || 'En traitement'}
                              </span>
                            </div>

                            <div className="border-t border-accent/20 pt-4">
                              {/* Check if order.items exists before mapping */}
                              {order.items && order.items.length > 0 ? (
                                order.items.map(item => (
                                  <div key={item.id} className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-4">
                                      <img 
                                        src={item.image_url || '/placeholder-product.jpg'} 
                                        alt={item.nom} 
                                        className="w-16 h-16 rounded-lg object-cover"
                                      />
                                      <div>
                                        <h3 className="font-medium text-dark">{item.nom}</h3>
                                        <p className="text-dark/60">{item.quantite}x {item.prix} DT</p>
                                      </div>
                                    </div>
                                    <p className="font-semibold">{(item.prix * item.quantite).toFixed(2)} DT</p>
                                  </div>
                                ))
                              ) : (
                                // Fallback if items is not available
                                <div className="py-2 text-center text-dark/60">
                                  <p>Détails des articles non disponibles</p>
                                </div>
                              )}

                              <div className="pt-4 flex justify-between items-center">
                                <div className="space-y-1">
                                  <p className="text-dark/60">Méthode de paiement: {order.methode_paiement || 'Non spécifiée'}</p>
                                  <p className="text-dark/60">Adresse: {order.adresse_livraison || 'Non spécifiée'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">
                                    Total: {order.total_prix || '0.00'} DT
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
>>>>>>> 552f46f45d223de8dfd76baf4f43aa2ec0fb1847
            </div>
          )}
          
          {!loading && (
            <>
              {/* Profile Section */}
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
                      onClick={() => handleSectionChange("editProfile")}
                      className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-transform shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
                    >
                      <FaPen className="text-lg" />
                      Modifier le Profil
                    </button>
                  </div>
                </div>
              )}
          
              {/* Edit Profile Section */}
              {activeSection === "editProfile" && (
                <EditProfile 
                  user={user} 
                  setActiveSection={(section) => handleSectionChange(section)} 
                />
              )}
          
              {/* Animals in Garderie Section */}
              {activeSection === "garderie" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold text-primary">
                      {`Animaux en Garderie ${garderieType}`}
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
                        <AnimalCard key={animal.id} animal={animal} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Adoptions Section */}
              {activeSection === "adoptions" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold text-primary">
                      Mes Adoptions
                    </h1>
                    <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
                  </div>

                  {adoptedAnimals.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-accent/30 rounded-xl">
                      <p className="text-dark/60">Aucune adoption trouvée</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {adoptedAnimals.map((animal) => (
                        <AnimalCard key={animal.id} animal={animal} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Orders Section */}
              {activeSection === "commandes" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold text-primary">Mes Commandes</h1>
                    <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-accent/30 rounded-xl">
                      <p className="text-dark/60">Aucune commande trouvée</p>
                      <button 
                        onClick={() => window.location.href = '/boutique'} 
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Visiter la boutique
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h2 className="text-xl font-semibold text-primary">
                                Commande #{order.numero_commande}
                              </h2>
                              <p className="text-dark/60">
                                {new Date(order.date_commande).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              order.statut === 'livrée' ? 'bg-green-100 text-green-800' :
                              order.statut === 'annulée' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.statut}
                            </span>
                          </div>

                          <div className="border-t border-accent/20 pt-4">
                            {order.items && order.items.map(item => (
                              <div key={item.id} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-4">
                                  <img 
                                    src={getImageUrl(item.image)} 
                                    alt={item.nom} 
                                    className="w-16 h-16 rounded-lg object-cover"
                                    onError={(e) => {
                                      e.target.src = "/placeholder-product.jpg";
                                    }}
                                  />
                                  <div>
                                    <h3 className="font-medium text-dark">{item.nom}</h3>
                                    <p className="text-dark/60">{item.quantite}x {item.prix} DT</p>
                                  </div>
                                </div>
                                <p className="font-semibold">{(item.prix * item.quantite).toFixed(2)} DT</p>
                              </div>
                            ))}

                            <div className="pt-4 flex justify-between items-center">
                              <div className="space-y-1">
                                <p className="text-dark/60">Paiement: {order.methode_paiement}</p>
                                <p className="text-dark/60">Adresse: {order.adresse_livraison}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                  Total: {order.total_prix} DT
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
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