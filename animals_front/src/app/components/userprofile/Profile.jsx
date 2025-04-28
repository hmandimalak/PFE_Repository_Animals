"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../app/pages/NavbarPage";
import EditProfile from "./Edit";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { FaPen } from "react-icons/fa";
import { authenticatedFetch } from '../../../app/authInterceptor';
import { Search, X, ChevronDown,} from 'lucide-react';


// Helper function to safely parse JSON responses
const safeJsonParse = async (response) => {
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.error('Response is not JSON:', contentType);
    throw new Error('Server returned non-JSON response');
  }
  
  try {
    return await response.json();
  } catch (e) {
    console.error('JSON parse error:', e);
    throw new Error('Failed to parse response as JSON');
  }
};

// Centralized API service
const api = {
  fetchUserProfile: async () => {
    const response = await authenticatedFetch("http://127.0.0.1:8000/api/auth/profile/");
    return safeJsonParse(response);
  },
  
  fetchTemporaryAnimals: async () => {
    const response = await authenticatedFetch("http://127.0.0.1:8000/api/animals/mes-animaux-temporaire/");
    return safeJsonParse(response);
  },
  
  fetchDefinitiveAnimals: async () => {
    const response = await authenticatedFetch("http://127.0.0.1:8000/api/animals/mes-animaux-definitive/");
    return safeJsonParse(response);
  },
  
  fetchAdoptedAnimals: async () => {
    const response = await authenticatedFetch("http://127.0.0.1:8000/api/animals/mes-adoptions/");
    return safeJsonParse(response);
  },
  
  fetchAnimalDetails: async (animalId) => {
    const response = await authenticatedFetch(`http://127.0.0.1:8000/api/animals/${animalId}/`);
    return safeJsonParse(response);
  },
  
  fetchOrders: async () => {
    const response = await authenticatedFetch('http://127.0.0.1:8000/api/boutique/mes-commandes/');
    return safeJsonParse(response);
  }
};

// Helper functions
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.startsWith('http') ? imagePath : `http://127.0.0.1:8000${imagePath}`;
};

export default function Profile() {
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
    
    fetchUserData();
  }, [router]);
  
  // Fetch user profile data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.fetchUserProfile();
      setUser(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Handle active section changes
  useEffect(() => {
    // Reset loading state when changing sections
    if (activeSection !== "editProfile") {
      setLoading(true);
    }
    
    const fetchSectionData = async () => {
      try {
        switch(activeSection) {
          case "profile":
            await fetchUserData();
            break;
            
          case "garderie":
            if (garderieType === "temporaire") {
              const data = await api.fetchTemporaryAnimals();
              setAnimals(data || []);
            } else if (garderieType === "definitive") {
              const data = await api.fetchDefinitiveAnimals();
              setAnimals(data || []);
            }
            setError(null);
            break;
            
          case "adoptions":
            const adoptionsData = await api.fetchAdoptedAnimals();
            setAdoptedAnimals(adoptionsData || []);
            setError(null);
            break;
            
          case "commandes":
            const ordersData = await api.fetchOrders();
            setOrders(ordersData || []);
            setError(null);
            break;
            
          case "editProfile":
            // No need to fetch data here
            break;
        }
      } catch (err) {
        console.error(`Error loading data for section ${activeSection}:`, err);
        setError(`Failed to load data for ${activeSection}: ${err.message}`);
        
        // Set empty arrays on error to avoid using stale data
        if (activeSection === "garderie") setAnimals([]);
        if (activeSection === "adoptions") setAdoptedAnimals([]);
        if (activeSection === "commandes") setOrders([]);
      } finally {
        if (activeSection !== "editProfile") {
          setLoading(false);
        }
      }
    };
    
    if (activeSection !== "editProfile") {
      fetchSectionData();
    }
  }, [activeSection, garderieType, fetchUserData]);
  
  // Handle animal selection for modal
  const handleAnimalClick = useCallback(async (id) => {
    try {
      setLoading(true);
      const data = await api.fetchAnimalDetails(id);
      setSelectedAnimal(data);
      setIsModalOpen(true);
      setError(null);
    } catch (err) {
      console.error("Error fetching animal details:", err);
      setError("Failed to load animal details: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  
  // Handle section change with better naming
  const handleSectionChange = useCallback((section, garderieOption = null) => {
    setActiveSection(section);
    if (garderieOption) {
      setGarderieType(garderieOption);
    }
  }, []);
  const closeModal = () => {
    setSelectedAnimal(null);
    setIsModalOpen(false);
};
  
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
          onClick={() => {fetchUserData(); setError(null);}} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    </div>
  );

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
  const formatAge = (dateString) => {
    if (!dateString) return "Âge inconnu";
    
    const birthDate = new Date(dateString);
    const today = new Date();
    
    // Calculate years and months
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    // Adjust for month difference
    if (today.getDate() < birthDate.getDate()) {
        months--;
    }
    
    // Handle negative months
    if (months < 0) {
        years--;
        months += 12;
    }
    
    // Build age string
    let ageParts = [];
    if (years > 0) {
        ageParts.push(`${years} an${years > 1 ? 's' : ''}`);
    }
    if (months > 0) {
        ageParts.push(`${months} mois`);
    }
    
    return ageParts.join(' et ') || 'Nouveau-né';
};
  

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
          {/* Show error banner if there's an error */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p className="font-bold">Erreur</p>
              <p>{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  if (activeSection === "profile") fetchUserData();
                }} 
                className="mt-2 text-sm text-red-700 underline"
              >
                Réessayer
              </button>
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6 md:border-r-2 md:border-accent/20 md:pr-8">
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
                    <div className="space-y-6 md:pl-8">
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
              {activeSection === "garderie" && !loading && (
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
              {activeSection === "adoptions" && !loading && (
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
              {activeSection === "commandes" && !loading && (
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
      
      
       {/* Animal Details Modal */}
       {isModalOpen && selectedAnimal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-dark/70 backdrop-blur-sm p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                            {/* Close button */}
                            <button 
                                onClick={closeModal}
                                className="absolute right-4 top-4 bg-white/80 hover:bg-white p-2 rounded-full z-10 transition-colors"
                            >
                                <X size={20} className="text-dark" />
                            </button>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                {/* Image column */}
                                <div className="h-64 md:h-full relative">
                                    {selectedAnimal.image ? (
                                        <img 
                                            src={`http://127.0.0.1:8000${selectedAnimal.image}`} 
                                            alt={selectedAnimal.nom} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                                            <span className="text-6xl">🐾</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark/80 to-transparent md:hidden">
                                        <h2 className="text-2xl font-bold text-white">{selectedAnimal.nom}</h2>
                                    </div>
                                </div>
                                
                                {/* Details column */}
                                <div className="p-6 overflow-y-auto max-h-96 md:max-h-[600px]">
                                    <h2 className="text-2xl font-bold text-primary mb-4 hidden md:block">{selectedAnimal.nom}</h2>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-secondary/20 p-3 rounded-lg">
                                            <span className="text-sm text-dark/60 block">Espèce</span>
                                            <span className="text-dark font-medium">{selectedAnimal.espece}</span>
                                        </div>
                                        <div className="bg-secondary/20 p-3 rounded-lg">
                                            <span className="text-sm text-dark/60 block">Race</span>
                                            <span className="text-dark font-medium">{selectedAnimal.race}</span>
                                        </div>
                                        <div className="bg-secondary/20 p-3 rounded-lg">
                                            <span className="text-sm text-dark/60 block">Sexe</span>
                                            <span className="text-dark font-medium">
                                                {selectedAnimal.sexe === 'M' ? 'Mâle' : 'Femelle'}
                                            </span>
                                        </div>
                                        <div className="bg-secondary/20 p-3 rounded-lg">
                                            <span className="text-sm text-dark/60 block">Âge</span>
                                            <span className="text-dark font-medium">
                                                {selectedAnimal.date_naissance ? formatAge(selectedAnimal.date_naissance) : "Âge inconnu"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-dark mb-2">Description</h3>
                                        <div className="bg-secondary/20 p-4 rounded-lg">
                                            <p className="text-dark/80">
                                                {selectedAnimal.description || `${selectedAnimal.nom} est un adorable ${selectedAnimal.espece.toLowerCase()} qui attend avec impatience de trouver sa famille pour toujours. Venez le rencontrer au refuge !`}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 space-y-4">
                                        <button 
                                            onClick={closeModal}
                                            className="w-full px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                                        >
                                            Retour à la liste
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
    </div>
  );
}