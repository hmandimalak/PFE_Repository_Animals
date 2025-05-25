'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import Navbar from './NavbarPage';
import { authenticatedFetch } from '../../app/authInterceptor';
import { useSearchParams } from 'next/navigation';
import { Search, X, ChevronDown, Heart, Filter, RefreshCw, Users, Calendar } from 'lucide-react';
import { FaPaw, FaDog, FaCat, FaHeart,FaMapMarkerAlt,FaHome,FaPhone,FaEnvelope,FaClock,FaLink,
FaFacebook,FaTwitter,FaInstagram,FaYoutube }from "react-icons/fa";
import Link from "next/link";
import { motion } from 'framer-motion';
import { Nunito } from "next/font/google";
const nunito = Nunito({ subsets: ["latin"] });

export default function NosAnimaux() {
    const [animals, setAnimals] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [animalType, setAnimalType] = useState('');
    const [species, setSpecies] = useState('');
    const [age, setAge] = useState('');
    const [sexe, setSexe] = useState('');
    const [pageLoading, setPageLoading] = useState(true);
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    


    // Species options
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
            const url = new URL('http://127.0.0.1:8001/api/animals/search/');
            
            // Ensure all parameters are included in the URL
            if (query) url.searchParams.append('query', query);
            if (type) url.searchParams.append('type', type);
            if (species) url.searchParams.append('species', species);
            if (age) url.searchParams.append('age', age);
            if (sexe) url.searchParams.append('sexe', sexe);
            
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
        
        // Close filter panel on mobile after search
        if (window.innerWidth < 768) {
            setFilterOpen(false);
        }
    };

    const fetchAnimalDetails = async (animalId) => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8001/api/animals/${animalId}/`);
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

    const handleAdoptClick = async () => {
        const authToken = getAuthToken();

        if (!authToken) {
            alert("Vous devez être connecté pour adopter un animal.");
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            return;
        }

        try {
            const requestBody = {
                animal: selectedAnimal.id,
            };

            const response = await authenticatedFetch('http://127.0.0.1:8001/api/animals/demandes-adoption/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                setShowSuccessModal(true); 
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

    const resetFilters = () => {
        setSearchQuery('');
        setAnimalType('');
        setSpecies('');
        setAge('');
        setSexe('');
        router.push('/nos-animaux');
    };

    // Handle applying active filter pill styles
    const getFilterCount = () => {
        let count = 0;
        if (animalType) count++;
        if (species) count++;
        if (age) count++;
        if (sexe) count++;
        if (searchQuery) count++;
        return count;
    };

    const filterCount = getFilterCount();

    return (
        <div className={`min-h-screen bg-gradient-to-b from-secondary via-secondary/30 to-white ${nunito.className}`}>
        {/* Fixed Navbar at top */}
        <div className="sticky top-0 w-full z-50 bg-white shadow-md">
            <Navbar />
        </div>
      

        
        {/* Background animated elements */}
        

        <div className="absolute bottom-40 left-18 opacity-0.5 animate-pulse">
            <FaCat className="w-32 h-32 text-primary" />
        </div>

        <div className="absolute top-1/3 left-20 transform -translate-y-1/2">
            <FaPaw className="w-16 h-16 text-primary animate-pulse" />
        </div>
        

        <div className="absolute top-1/2 right-20 transform -translate-y-1/2">
            <FaPaw className="w-16 h-16 text-primary animate-pulse" />
        </div>
        <div className="absolute top-20 right-10 opacity- animate-bounce">
            <FaDog className="w-24 h-24 text-primary" />
        </div>
        
            {/* Hero Section with Parallax Effect */}
        <div className="relative h-32 md:h-40 overflow-hidden">
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center px-2">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-4 space-y-4"
                >
                    <h1 className="text-5xl font-extrabold text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-dark">
                        Nos Adorables Compagnons
                    </h1>
                    <p className="text-dark/80 text-xl">Un regard, une rencontre, une histoire d'amour. Découvrez nos petits trésors prêts à combler votre vie de bonheur.</p>
                    <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
                </motion.div>
            </div>
        </div>
            
            {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
            {/* Filter Toggle Button (Mobile Only) */}
            <div className="md:hidden mb-4">
                <button 
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="w-full bg-white shadow-md rounded-lg px-4 py-3 flex items-center justify-between border border-secondary/30 text-primary font-medium"
                >
                    <div className="flex items-center gap-2">
                        <Filter size={18} />
                        <span>Filtres</span>
                        {filterCount > 0 && (
                            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {filterCount}
                            </span>
                        )}
                    </div>
                    <ChevronDown size={18} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
                
                {/* Search Section */}
                <div className={`mb-8 ${filterOpen || window.innerWidth >= 768 ? 'block' : 'hidden'} md:block`}>
                    <div className="bg-white rounded-2xl shadow-lg border border-accent/20 overflow-hidden transform transition-all">
                        <div className="bg-primary bg-opacity-10 p-5 border-b border-accent/20">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Search size={20} /> 
                                <span>Recherchez l'animal idéal</span>
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSearch} className="p-5">
                            {/* Search input */}

                            {/* Filters row */}
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-5">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-dark/60 mb-1.5 ml-1">Type d'animal</label>
                                    <div className="relative">
                                        <select
                                            value={animalType}
                                            onChange={(e) => {
                                                setAnimalType(e.target.value);
                                                setSpecies(''); // Reset species when animal type changes
                                            }}
                                            className="w-full px-4 py-3 border-2 border-secondary/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                        >
                                            <option value="">Tous les types</option>
                                            <option value="chien">🐶 Chien</option>
                                            <option value="chat">🐱 Chat</option>
                                        </select>
                                        <ChevronDown size={20} className="absolute right-3 top-3 text-dark/40 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-dark/60 mb-1.5 ml-1">Race</label>
                                    <div className="relative">
                                        <select
                                            value={species}
                                            onChange={(e) => setSpecies(e.target.value)}
                                            disabled={!animalType}
                                            className={`w-full px-4 py-3 border-2 border-secondary/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary appearance-none ${!animalType ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">Toutes les races</option>
                                            {animalType && speciesOptions[animalType]?.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={20} className="absolute right-3 top-3 text-dark/40 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-dark/60 mb-1.5 ml-1">Âge</label>
                                    <div className="relative">
                                        <select
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-secondary/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                        >
                                            <option value="">Tous les âges</option>
                                            {ageOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={20} className="absolute right-3 top-3 text-dark/40 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-dark/60 mb-1.5 ml-1">Sexe</label>
                                    <div className="relative">
                                        <select
                                            value={sexe}
                                            onChange={(e) => setSexe(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-secondary/40 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary appearance-none"
                                        >
                                            <option value="">Tous les sexes</option>
                                            <option value="M">Mâle</option>
                                            <option value="F">Femelle</option>
                                        </select>
                                        <ChevronDown size={20} className="absolute right-3 top-3 text-dark/40 pointer-events-none" />
                                    </div>
                                    
                                </div>
                                {/* Rechercher Button */}
    <div className="flex items-end">
      <button 
        type="submit" 
        className="w-full bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        <Search size={20} />
        <span>Rechercher</span>
      </button>
    </div>
  </div>
</form>
                        {/* Active filters pills */}
                        {filterCount > 0 && (
                            <div className="px-5 pb-5 flex flex-wrap gap-2">
                                {animalType && (
                                    <div className="inline-flex items-center bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm">
                                        {animalType === 'chien' ? '🐶 Chien' : '🐱 Chat'}
                                        <button 
                                            onClick={() => setAnimalType('')}
                                            className="ml-2 p-0.5 hover:bg-primary/20 rounded-full"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                {species && (
                                    <div className="inline-flex items-center bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm">
                                        {species}
                                        <button 
                                            onClick={() => setSpecies('')}
                                            className="ml-2 p-0.5 hover:bg-primary/20 rounded-full"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                {age && (
                                    <div className="inline-flex items-center bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm">
                                        {ageOptions.find(option => option.value === age)?.label}
                                        <button 
                                            onClick={() => setAge('')}
                                            className="ml-2 p-0.5 hover:bg-primary/20 rounded-full"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                {sexe && (
                                    <div className="inline-flex items-center bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm">
                                        {sexe === 'M' ? 'Mâle' : 'Femelle'}
                                        <button 
                                            onClick={() => setSexe('')}
                                            className="ml-2 p-0.5 hover:bg-primary/20 rounded-full"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                {searchQuery && (
                                    <div className="inline-flex items-center bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm">
                                        <Search size={14} className="mr-1" />
                                        "{searchQuery}"
                                        <button 
                                            onClick={() => setSearchQuery('')}
                                            className="ml-2 p-0.5 hover:bg-primary/20 rounded-full"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {showSuccessModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-dark/70 backdrop-blur-sm z-50 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
        <h2 className="text-2xl font-bold">Succès!</h2>
      </div>
      
      <div className="p-6 space-y-4 text-center">
        <div className="text-6xl">🎉</div>
        <h3 className="text-xl font-semibold text-dark">
          Demande d'adoption envoyée!
        </h3>
        <p className="text-dark/70">
          Nous avons bien reçu votre demande et vous contacterons sous 48h.
        </p>
      </div>
      
      <div className="bg-primary/10 p-4 flex justify-center gap-4">
        <button
          onClick={() => setShowSuccessModal(false)}
          className="px-6 py-2 bg-primary text-white rounded-full hover:bg-accent transition-colors"
        >
          Fermer
        </button>
        
      </div>
    </div>
  </div>
)}
                
                {/* Results Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-primary">
                                {searchQuery || animalType || species || age || sexe ? 'Résultats de recherche' : 'Nos animaux à adopter'}
                            </h2>
                            <p className="text-dark/60 mt-1">
                                {animals.length} {animals.length > 1 ? 'animaux trouvés' : 'animal trouvé'}
                            </p>
                        </div>

                    </div>
                    
                    {/* Loading State */}
                    {pageLoading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
                            <p className="text-dark/60">Chargement des animaux...</p>
                        </div>
                    )}

                    {/* Animals Grid */}
                    {!pageLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {animals.length > 0 ? (
                                animals.map(animal => (
                                    <motion.div 
                                        key={animal.id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-102 group border border-secondary/10"
                                        onClick={() => fetchAnimalDetails(animal.id)}
                                    >
                                        <div className="relative h-64">
                                            {animal.image ? (
                                                <img 
                                                    src={`http://127.0.0.1:8001${animal.image}`} 
                                                    alt={animal.nom} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                                                    <span className="text-5xl">🐾</span>
                                                </div>
                                            )}
                                            
                                            {/* Animal type badge */}
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                                                    animal.espece.toLowerCase() === 'chien' 
                                                        ? 'bg-primary text-white' 
                                                        : 'bg-accent text-dark'
                                                }`}>
                                                    {animal.espece.toLowerCase() === 'chien' ? '🐶 Chien' : '🐱 Chat'}
                                                </span>
                                            </div>
                                            
                                            {/* Adopt button overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <button className="px-6 py-2.5 bg-white text-primary rounded-full font-medium transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2 hover:bg-primary hover:text-white">
                                                    <FaHeart className="text-sm" />
                                                    <span>Adopter</span>
                                                </button>
                                            </div>
                                            
                                            {/* Name overlay */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark/90 to-transparent">
                                                <h3 className="text-xl font-bold text-white">{animal.nom}</h3>
                                                <p className="text-white/80 text-sm">{animal.race}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${animal.sexe === 'M' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'} text-sm font-medium`}>
                                                        {animal.sexe === 'M' ? '♂' : '♀'}
                                                    </span>
                                                    <span className="text-dark/80">{animal.sexe === 'M' ? 'Mâle' : 'Femelle'}</span>
                                                </div>
                                                
                                    
                                                
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3 mt-3">
                                                <div className="flex items-center gap-2 text-dark/70 text-sm">
                                                    <Calendar size={16} className="text-primary/70" />
                                                    <span>{animal.date_naissance ? formatAge(animal.date_naissance) : "Âge inconnu"}</span>
                                                </div>
                                                
                                                                                              
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full">
                                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                                        <div className="mx-auto mb-6 bg-secondary/30 rounded-full h-20 w-20 flex items-center justify-center">
                                            <Search size={32} className="text-dark/40" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-dark mb-3">Aucun animal trouvé</h3>
                                        <p className="text-dark/60 mb-6 max-w-md mx-auto">
                                           Nous n'avons pas trouvé d'animaux correspondant à vos critères. Essayez de modifier vos filtres pour voir plus de résultats.
                                        </p>
                                        <button 
                                            onClick={resetFilters}
                                            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors shadow-md flex items-center gap-2 mx-auto"
                                        >
                                            <RefreshCw size={18} />
                                            <span>Voir tous les animaux</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Footer */}
                    <div className="mt-16 bg-gray-100 border-t-4 border-primary">
  <div className="max-w-6xl mx-auto px-4 py-8">
    {/* Footer Top - Main Sections */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-bold text-dark mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-primary" /> Contact
        </h3>
        <ul className="space-y-3 text-dark/80">
          <li className="flex items-start">
            <FaHome className="mt-1 mr-2 text-primary flex-shrink-0" />
            <span>123 Rue des Animaux, 8001 Nabeul, Tunisie</span>
          </li>
          <li className="flex items-center">
            <FaPhone className="mr-2 text-primary flex-shrink-0" />
            <span>95 888 751</span>
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
          <li>Lundi - Vendredi: 9h - 18h</li>
          <li>Samedi: 9h - 13h</li>
          <li>Dimanche: 9h - 16h</li>
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
      <Link href="/nos-animaux" className="hover:text-primary flex items-center">
        <FaPaw className="mr-2 text-xs" /> Nos animaux
      </Link>
    </li>
    <li>
      <Link href="/garderie" className="hover:text-primary flex items-center">
        <FaPaw className="mr-2 text-xs" /> Service garde
      </Link>
    </li>
    <li>
      <Link href="/boutique" className="hover:text-primary flex items-center">
        <FaPaw className="mr-2 text-xs" /> Notre boutique
      </Link>
    </li>
    <li>
      <Link href="/marche" className="hover:text-primary flex items-center">
        <FaPaw className="mr-2 text-xs" /> Evennements
      </Link>
    </li>
  </ul>
</div>

     
    </div>

    {/* Social Media */}
   <div className="flex justify-center space-x-6 py-6 border-t border-dark/10">
  {[
    { 
      icon: FaFacebook, 
      label: "Facebook", 
      href: "https://www.facebook.com/mouez.benyounes/ " 
    },
    { icon: FaTwitter, label: "Twitter", href: "https://x.com/benyounesbaha1?t=NhqlO6UTZxdumgHQQ4YcMQ&s=09" },
    { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/baha_benyounes0/" },
    { icon: FaYoutube, label: "YouTube", href: "https://www.youtube.com/@ben_younesbaha3194" },
  ].map((social, index) => (
    <a
      key={index}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full bg-primary hover:bg-accent transition-colors flex items-center justify-center text-white"
      aria-label={social.label}
    >
      <social.icon />
    </a>
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
                                            src={`http://127.0.0.1:8001${selectedAnimal.image}`} 
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
            
            {/* Add required CSS for animations */}
            <style jsx global>{`
                @keyframes float {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0); }
                }
                
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                
                .animate-float-delay {
                    animation: float 3.5s ease-in-out infinite;
                    animation-delay: 0.5s;
                }
                
                .animate-float-slow {
                    animation: float 4s ease-in-out infinite;
                    animation-delay: 1s;
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                
                .scale-102 {
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
}