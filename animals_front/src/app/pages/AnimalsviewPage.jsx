'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import Navbar from './NavbarPage';
import { authenticatedFetch } from '../../app/authInterceptor';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

export default function NosAnimaux() {
    const [animals, setAnimals] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [animalType, setAnimalType] = useState('');
    const [species, setSpecies] = useState('');
    const { data: session } = useSession();
    const searchParams = useSearchParams(); // Get search parameters from the URL

    useEffect(() => {
        // Fetch search parameters from the URL
        const query = searchParams.get('query') || '';
        const type = searchParams.get('type') || '';
        const speciesParam = searchParams.get('species') || '';

        // Set the state with the search parameters
        setSearchQuery(query);
        setAnimalType(type);
        setSpecies(speciesParam);

        // Fetch animals based on the search parameters
        fetchAnimals(query, type, speciesParam);
    }, [searchParams]); // Re-run when searchParams change

    const fetchAnimals = async (query = '', type = '', species = '') => {
        try {
            const url = new URL('http://127.0.0.1:8000/api/animals/search/');
            const params = { query, type, species };
            Object.keys(params).forEach(key => params[key] && url.searchParams.append(key, params[key]));

            const response = await fetch(url);
            const data = await response.json();
            setAnimals(data);
        } catch (error) {
            console.error('Error fetching animals:', error);
        }
    };

    const searchAnimals = async (query = '', type = '', species = '') => {
        try {
            const url = new URL('http://127.0.0.1:8000/api/animals/search/');
            const params = { query, type, species };
            Object.keys(params).forEach(key => params[key] && url.searchParams.append(key, params[key]));

            const response = await fetch(url);
            const data = await response.json();
            setAnimals(data);
        } catch (error) {
            console.error('Error fetching animals:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchAnimals(searchQuery, animalType, species);
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

            console.log("Sending request with token:", authToken);

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
                console.log('Adoption request successful:', data);
                alert('Demande d\'adoption envoyée avec succès!');
                closeModal();
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

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center text-pink-600 mb-8">Animaux Prêts pour l'Adoption</h1>
                
                <form onSubmit={handleSearch} className="mb-8 flex gap-4">
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                    />
                    <select
                        value={animalType}
                        onChange={(e) => setAnimalType(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Tous les types</option>
                        <option value="Chien">Chien</option>
                        <option value="Chat">Chat</option>
                        {/* Add more options as needed */}
                    </select>
                    <select
                        value={species}
                        onChange={(e) => setSpecies(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Toutes les races</option>
                        <option value="Labrador">Labrador</option>
                        <option value="Persan">Persan</option>
                        {/* Add more options as needed */}
                    </select>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Rechercher
                    </button>
                </form>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {animals.map(animal => (
                        <div key={animal.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
                            onClick={() => fetchAnimalDetails(animal.id)}>
                            <div className="relative h-48">
                                {animal.image ? (
                                    <img src={`http://127.0.0.1:8000${animal.image}`} alt={animal.nom} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <p className="text-gray-500 italic">Pas de photo disponible</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h2 className="text-xl font-semibold text-gray-800">{animal.nom}</h2>
                                <p className="text-gray-600">{animal.type}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && selectedAnimal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all duration-300 ease-in-out">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <h1 className="text-4xl font-bold text-center text-pink-600 mb-6 col-span-2">Détails de l'Animal</h1>

                            {/* Left Side: Basic Information */}
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
                                    <h2 className="text-xl font-semibold text-gray-800">Type de Garde</h2>
                                    <p className="text-gray-600">{selectedAnimal.type_garde}</p>
                                </div>
                            </div>

                            {/* Right Side: Description */}
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                                    <p className="text-gray-600">{selectedAnimal.description}</p>
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
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4">
                            <button onClick={handleAdoptClick} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-transform transform hover:scale-105">
                                Adopter
                            </button>
                            <button onClick={closeModal} className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition-transform transform hover:scale-105">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}