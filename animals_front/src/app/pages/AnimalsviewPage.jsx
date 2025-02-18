'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NosAnimaux() {
    const [animals, setAnimals] = useState([]);
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
  
    useEffect(() => {
        fetchAnimals();
    }, []);
  
    const fetchAnimals = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/animals/definitive/');
            const data = await response.json();
            setAnimals(data);
        } catch (error) {
            console.error('Error fetching animals:', error);
        }
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

    const handleAdoptClick = async () => {
        try {
            const authToken = localStorage.getItem('access_token');
            const requestBody = {
                animal: selectedAnimal.id,  // Send only the animal ID
                // You might need to include other required fields if necessary, such as a message
            };
    
            console.log("Sending adoption request with body:", requestBody);
    
            const response = await fetch('http://127.0.0.1:8000/api/animals/demandes-adoption/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(requestBody),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log('Adoption request sent:', data);
            } else {
                const errorData = await response.json();
                console.error('Failed to send adoption request:', errorData);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4 text-pink-600">Animaux Prêts pour l'Adoption</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {animals.map(animal => (
                    <div key={animal.id} className="border rounded-lg p-4 cursor-pointer hover:shadow-lg"
                        onClick={() => fetchAnimalDetails(animal.id)}>
                        <div className="mb-2">
                            {animal.image ? (
                                <img src={`http://127.0.0.1:8000${animal.image}`} alt={animal.nom} className="w-full h-48 object-cover rounded-lg" />
                            ) : (
                                <p className="text-gray-500 italic">Pas de photo disponible</p>
                            )}
                        </div>
                        <h2 className="text-lg font-semibold">{animal.nom}</h2>
                        <p className="text-gray-600">{animal.type}</p>
                    </div>
                ))}
            </div>

            {/* Modal for animal details */}
            {isModalOpen && selectedAnimal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6 col-span-2">Détails de l'Animal</h1>

                        {/* Left Grid */}
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

                        {/* Right Grid */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                                <p className="text-gray-600">{selectedAnimal.description}</p>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Type de Garde </h2>
                                <p className="text-gray-600">{selectedAnimal.type_garde}</p>
                            </div>
                            {selectedAnimal.utilisateur && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Demandeur</h2>
                                    <p className="text-gray-600">{selectedAnimal.utilisateur_nom}</p>
                                </div>
                            )}
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

                        {/* Adoption & Close buttons */}
                        <div className="col-span-2 flex justify-between mt-4">
                            <button onClick={() => handleAdoptClick(selectedAnimal.id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                Adopter
                            </button>
                            <button onClick={closeModal} className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
