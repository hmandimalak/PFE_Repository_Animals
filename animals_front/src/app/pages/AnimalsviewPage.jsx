'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import Navbar from './NavbarPage';
import { authenticatedFetch } from '../../app/authInterceptor';
import { useSearchParams } from 'next/navigation';
import { Search, X, ChevronDown,} from 'lucide-react';
import { FaPaw, FaDog, FaCat, FaGoogle, FaHeart, FaSmile, FaArrowRight,FaHome,FaShoppingBag,FaWalking} from "react-icons/fa";

import Image from 'next/image';

export default function NosAnimaux() {
    const [animals, setAnimals] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [animalType, setAnimalType] = useState('');
    const [species, setSpecies] = useState('');
    const [age, setAge] = useState('');
    const [sexe, setSexe] = useState('');
    const [pageLoading, setPageLoading] = useState(true);
    const { data: session } = useSession();
    const searchParams = useSearchParams();

    // Species options like on the homepage
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
     // Age options
     const ageOptions = [
        { value: 'puppy', label: 'Chiot/Chaton (<1 an)' },
        { value: 'young', label: 'Jeune (1-3 ans)' },
        { value: 'adult', label: 'Adulte (3-8 ans)' },
        { value: 'senior', label: 'Senior (8+ ans)' },
    ];

    useEffect(() => {
        // Fetch search parameters from the URL
        const query = searchParams.get('query') || '';
        const type = searchParams.get('type') || '';
        const speciesParam = searchParams.get('species') || '';
        const ageParam = searchParams.get('age') || '';
        const sexeParam = searchParams.get('sexe') || '';

        // Set the state with the search parameters
        setSearchQuery(query);
        setAnimalType(type);
        setSpecies(speciesParam);
        setAge(ageParam);
        setSexe(sexeParam);

        // Fetch animals based on the search parameters
        fetchAnimals(query, type, speciesParam, ageParam, sexeParam);
    }, [searchParams]);

    const fetchAnimals = async (query = '', type = '', species = '', age = '', sexe = '') => {
        setPageLoading(true);
        try {
            const url = new URL('http://127.0.0.1:8000/api/animals/search/');
            const params = { query, type, species };
            Object.keys(params).forEach(key => params[key] && url.searchParams.append(key, params[key]));

            const response = await fetch(url);
            const data = await response.json();
            setAnimals(data);
        } catch (error) {
            console.error('Error fetching animals:', error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        
        // Update the URL with search parameters
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append("query", searchQuery);
        if (animalType) queryParams.append("type", animalType);
        if (species) queryParams.append("species", species);
        if (age) queryParams.append("age", age);
        if (sexe) queryParams.append("sexe", sexe);
        
        // Navigate to the same page but with search parameters
        router.push(`/nos-animaux?${queryParams.toString()}`);
        
        // Also fetch the data directly
        fetchAnimals(searchQuery, animalType, species, age, sexe);
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

    const closeModal = () => {
        setSelectedAnimal(null);
        setIsModalOpen(false);
    };

    const getAuthToken = () => {
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

   // Update the handleAdoptClick function
const handleAdoptClick = async () => {
    const authToken = getAuthToken();

    if (!authToken) {
        alert("Vous devez être connecté pour adopter un animal.");
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.push('/login');
        return;
    }

    try {
        const requestBody = {
            animal: selectedAnimal.id,
        };

        const response = await authenticatedFetch('http://127.0.0.1:8000/api/animals/demandes-adoption/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authToken,
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const data = await response.json();
            alert('Demande d\'adoption envoyée avec succès!');
            closeModal();
        } else {
            const errorData = await response.json();
            if (response.status === 401) {
                alert('Votre session a expiré. Veuillez vous reconnecter.');
                router.push('/login');
            } else if (response.status === 400 && errorData.detail?.includes("existe déjà")) {
                alert(errorData.detail || 'Une erreur est survenue. Veuillez réessayer.');
            } else {
                alert('Vous avez déjà une demande d\'adoption en cours pour cet animal.');

            }
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Erreur de connexion. Veuillez vérifier votre connexion internet.');
    }
};

    // Function to format age in a more friendly way
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
        <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
            {/* Fixed Navbar at top */}
            <div className="sticky top-0 w-full z-50 bg-white shadow-md">
                <Navbar />
            </div>
            
            {/* Main Content with animated background */}
            <div className="min-h-screen bg-gradient-to-br from-accent to-white relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute top-20 right-10 opacity-10 animate-bounce">
                    <FaDog className="w-24 h-24 text-primary" />
                </div>
                <div className="absolute bottom-40 left-20 opacity-10 animate-pulse">
                    <FaCat className="w-32 h-32 text-dark" />
                </div>
                <div className="absolute top-60 right-1/4 opacity-10 animate-bounce delay-300">
                    <span className="text-6xl">🐾</span>
                </div>
            
                {/* Compact Header Section */}
                <div className="bg-primary bg-opacity-90 text-white py-8">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="max-w-2xl">
                                <h1 className="text-3xl md:text-4xl font-bold mb-2">Nos Protégés</h1>
                                <p className="text-white/80">Chaque animal mérite un foyer chaleureux. Découvrez nos compagnons disponibles pour l'adoption.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                  {/* Search Section */}
                  <div className="mb-8 bg-white rounded-xl shadow-lg border border-accent/20 transform -translate-y-8">
                        <form onSubmit={handleSearch} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* First Row */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Rechercher par nom..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    />
                                    <Search size={20} className="absolute left-3 top-3 text-dark/40" />
                                </div>
                                
                                <div className="relative">
                                    <select
                                        value={animalType}
                                        onChange={(e) => {
                                            setAnimalType(e.target.value);
                                            setSpecies(''); // Reset species when animal type changes
                                        }}
                                        className="w-full px-4 py-3 border-2 border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                    >
                                        <option value="">Tous les types</option>
                                        <option value="chien">🐶 Chien</option>
                                        <option value="chat">🐱 Chat</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-3 top-3 text-dark/40 pointer-events-none" />
                                </div>

                                <div className="relative">
                                    <select
                                        value={species}
                                        onChange={(e) => setSpecies(e.target.value)}
                                        disabled={!animalType}
                                        className={`w-full px-4 py-3 border-2 border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none ${!animalType ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">Toutes les races</option>
                                        {animalType && speciesOptions[animalType]?.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-3 top-3 text-dark/40 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Second Row - New filters */}
                                <div className="relative">
                                    <select
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                    >
                                        <option value="">Tous les âges</option>
                                        {ageOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={20} className="absolute right-3 top-3 text-dark/40 pointer-events-none" />
                                </div>

                                <div className="relative">
                                    <select
                                        value={sexe}
                                        onChange={(e) => setSexe(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-secondary rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                    >
                                        <option value="">Tous les sexes</option>
                                        <option value="M">Mâle</option>
                                        <option value="F">Femelle</option>
                                    </select>
                                    <ChevronDown size={20} className="absolute right-3 top-3 text-dark/40 pointer-events-none" />
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                                >
                                    <Search size={20} />
                                    <span>Rechercher</span>
                                </button>
                            </div>
                        </form>
                    </div>


                     {/* Results Section */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-primary mb-2">
                            {searchQuery || animalType || species || age || sexe ? 'Résultats de recherche' : 'Tous nos animaux'}
                        </h2>
                        <p className="text-dark/60">
                            {animals.length} {animals.length > 1 ? 'animaux trouvés' : 'animal trouvé'}
                        </p>
                    </div>
                    {/* Loading State */}
                    {pageLoading && (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                        </div>
                    )}

                    {/* Animals Grid */}
                    {!pageLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {animals.length > 0 ? (
                                animals.map(animal => (
                                    <div 
                                        key={animal.id} 
                                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                                        onClick={() => fetchAnimalDetails(animal.id)}
                                    >
                                        <div className="relative h-56">
                                            {animal.image ? (
                                                <img 
                                                    src={`http://127.0.0.1:8000${animal.image}`} 
                                                    alt={animal.nom} 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                                                    <span className="text-4xl">🐾</span>
                                                </div>
                                            )}
                                            
                                            {/* Animal type badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    animal.espece.toLowerCase() === 'chien' 
                                                        ? 'bg-primary text-white' 
                                                        : 'bg-accent text-dark'
                                                }`}>
                                                    {animal.espece.toLowerCase() === 'chien' ? '🐶 Chien' : '🐱 Chat'}
                                                </span>
                                            </div>
                                            
                                            {/* Name overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-dark/80 to-transparent">
                                                <h3 className="text-lg font-bold text-white">{animal.nom}</h3>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-dark font-medium">{animal.race}</span>
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${animal.sexe === 'M' ? 'bg-primary' : 'bg-accent'} text-white text-sm`}>
                                                    {animal.sexe === 'M' ? '♂' : '♀'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex justify-between text-sm text-dark/60">
                                                <span>{animal.date_naissance ? formatAge(animal.date_naissance) : "Âge inconnu"}</span>
                                                
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full">
                                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                                        <div className="mx-auto mb-4 bg-secondary/30 rounded-full h-16 w-16 flex items-center justify-center">
                                            <Search size={24} className="text-dark/40" />
                                        </div>
                                        <h3 className="text-xl font-bold text-dark mb-2">Aucun animal trouvé</h3>
                                        <p className="text-dark/60 mb-4">Essayez d'autres critères de recherche.</p>
                                        <button 
                                            onClick={() => {
                                                setSearchQuery('');
                                                setAnimalType('');
                                                setSpecies('');
                                                router.push('/nos-animaux');
                                            }}
                                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                                        >
                                            Voir tous les animaux
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-center mt-12">
                        <div className="px-4 py-2 bg-primary/20 rounded-full text-xs text-primary font-medium flex items-center">
                            <span className="mr-2">🐾</span> Adopti © 2025
                        </div>
                    </div>
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
                                            onClick={handleAdoptClick}
                                            disabled={loading}
                                            className="w-full bg-primary text-white px-4 py-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Envoi en cours...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>❤️ Faire une demande d'adoption</span>
                                                </>
                                            )}
                                        </button>
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
        </div>
    );
}