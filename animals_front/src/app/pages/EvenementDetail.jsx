'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EvenementMarcheDetail() {
  const [evenement, setEvenement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userDemandes, setUserDemandes] = useState({});
  const [filteredDogs, setFilteredDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dogEvents, setDogEvents] = useState([]);
  const [selectedDogs, setSelectedDogs] = useState([]);
  
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;

  // Add the missing formatDate function
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId]);

  const fetchEventDetails = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`http://localhost:8000/api/animals/evenements/marche-chiens/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error(`Échec du chargement: ${response.status}`);
  
      const data = await response.json();
      console.log('Full API response:', data);
      
      setEvenement(data.evenement);
      
      // Handle the case where chiens is just an array of IDs
      if (Array.isArray(data.evenement.chiens)) {
        // Convert IDs to dog objects with minimal info for display
        const dogObjects = data.evenement.chiens.map(dogId => ({
          id: dogId,
          nom: `Chien #${dogId}`, // Temporary name until we fetch details
          image: null // No image until we fetch details
        }));
        
        setFilteredDogs(dogObjects);
        
        // Optionally fetch complete details for each dog
        const dogDetails = await Promise.all(
          data.evenement.chiens.map(dogId => 
            fetch(`http://localhost:8000/api/animals/${dogId}/`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : null)
            .catch(err => {
              console.error(`Error fetching dog ${dogId}:`, err);
              return null;
            })
          )
        );
        
        // Filter out any failed fetches and update the dogs list
        const fetchedDogs = dogDetails.filter(dog => dog !== null);
        if (fetchedDogs.length > 0) {
          setFilteredDogs(fetchedDogs);
        }
      }
      
      if (data.user_demande) {
        const dogDemandeMap = {};
        data.user_demande.chiens.forEach(dogId => {
          dogDemandeMap[dogId] = {
            demandeId: data.user_demande.id,
            status: data.user_demande.statut
          };
        });
        setUserDemandes(dogDemandeMap);
      }
  
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const fetchAnimalDetails = async (dog, shouldOpenModal = true) => {
    if (!dog || !dog.id) {
      console.error('No animal ID provided', dog);
      setError('ID de l\'animal non disponible');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/animals/${dog.id}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch animal details');
      }
      const data = await response.json();
      setSelectedDog(data);
      
      if (shouldOpenModal) {
        setIsModalOpen(true);
      }
      return data;
    } catch (error) {
      console.error('Failed to fetch animal details', error);
      setError('Failed to load animal details');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedDog(null);
    setIsModalOpen(false);
  };
  
  const submitRequest = async () => {
    const authToken = localStorage.getItem('access_token');
    
    if (!authToken) {
      alert("Vous devez être connecté pour participer à un événement.");
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push('/login');
      return;
    }
  
    if (selectedDogs.length === 0) {
      alert("Veuillez sélectionner au moins un chien pour participer.");
      return;
    }
  
    try {
      setSubmitting(true);
      setError(null);
  
      const response = await fetch('http://localhost:8000/api/animals/demandes/marche-chiens/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evenement: evenement.id,
          chiens: selectedDogs
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la soumission de la demande');
      }
  
      const data = await response.json();
      await fetchEventDetails(eventId);
      setSuccess(`Votre demande a été soumise avec succès !`);
      setSelectedDogs([]);
      closeModal();
  
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDogRequestStatus = (dogId) => {
    if (!dogId) {
      console.error('No dog ID provided to getDogRequestStatus');
      return null;
    }
    return userDemandes[dogId]?.status || null;
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Acceptee':
        return 'bg-green-100 text-green-800';
      case 'Refusee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'Acceptee':
        return 'Demande acceptée';
      case 'Refusee':
        return 'Demande refusée';
      default:
        return 'Demande en attente';
    }
  };

  const toggleDogSelection = (dog) => {
    if (!dog || !dog.id) {
      console.error('Cannot toggle selection - dog is missing or has no ID');
      return;
    }
    
    if (userDemandes[dog.id]) return;
  
    // Toggle selection state
    setSelectedDogs(prev => 
      prev.includes(dog.id)
        ? prev.filter(id => id !== dog.id)
        : [...prev, dog.id]
    );
  };

  // Function to cancel a request
  const cancelRequest = async (dogId) => {
    if (!dogId) {
      console.error('Cannot cancel request - missing dog ID');
      return;
    }
    
    const demandeId = userDemandes[dogId]?.demandeId;
    if (!demandeId) {
      console.error('No demand ID found for dog', dogId);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/animals/demandes/marche-chiens/${demandeId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      await fetchEventDetails(eventId);
      setSuccess('Demande annulée avec succès');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'annulation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <button 
            onClick={() => router.push('/marche')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Retour aux Événements
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-blue-800">Chargement des détails de l'événement...</p>
          </div>
        ) : evenement ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-blue-600 text-white p-6">
              <h1 className="text-3xl font-bold">{evenement.titre}</h1>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(evenement.date)}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{evenement.heure.substring(0, 5)}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{evenement.lieu}</span>
                </div>
              </div>
            </div>
            
            {evenement.description && (
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
                <p className="text-gray-600">{evenement.description}</p>
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Chiens disponibles pour la marche</h2>
              
              {filteredDogs.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <div className="text-5xl mb-4">🐕</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun chien trouvé</h3>
                  <p className="text-gray-600">Il n'y a aucun chien disponible pour cet événement.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDogs.map((dog, index) => (
                    dog && dog.id ? (
                      <div 
                        key={`dog-${dog.id}`}
                        className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 cursor-pointer ${
                          selectedDogs.includes(dog.id) ? 'ring-2 ring-blue-500' : ''
                        } ${
                          userDemandes[dog.id] ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                        onClick={() => !userDemandes[dog.id] && fetchAnimalDetails(dog)}
                      >
                        <div className="relative h-48">
                          {dog.image ? (
                            <img 
                              src={`http://127.0.0.1:8000${dog.image}`} 
                              alt={dog.nom} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-dog.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <p className="text-gray-500 italic">Pas de photo disponible</p>
                            </div>
                          )}
                          {selectedDogs.includes(dog.id) && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                              ✓
                            </div>
                          )}
                          {userDemandes[dog.id] && (
                            <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                              getStatusBadgeClass(userDemandes[dog.id].status)
                            }`}>
                              {getStatusText(userDemandes[dog.id].status)}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h2 className="text-xl font-semibold text-gray-800">{dog.nom}</h2>
                          <p className="text-gray-600">{dog.race || 'Non spécifiée'}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={`invalid-dog-${index}`} className="bg-red-50 p-4 rounded-lg">
                        <p className="text-red-600">Données du chien invalides</p>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Impossible de charger les détails de l'événement
          </div>
        )}
        
        {selectedDogs.length > 0 && (
          <div className="fixed bottom-6 right-6">
            <button 
              onClick={submitRequest}
              disabled={submitting}
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-full shadow-lg flex items-center gap-2"
            >
              {submitting ? "Soumission..." : `Participer avec ${selectedDogs.length} chien${selectedDogs.length > 1 ? 's' : ''}`}
              <span className="bg-white text-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                {selectedDogs.length}
              </span>
            </button>
          </div>
        )}
        
        <div className="mt-8">
          <button 
            onClick={() => router.push('/user/demandes/marche-chiens')}
            className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Voir mes demandes de participation
          </button>
        </div>
      </div>

      {isModalOpen && selectedDog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 p-4 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 col-span-2 md:col-span-1">
                <div className="mb-4 h-64 md:h-80 overflow-hidden rounded-lg bg-gray-100">
                  {selectedDog.image ? (
                    <img 
                      src={`http://localhost:8000${selectedDog.image}`} 
                      alt={selectedDog.nom} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-dog.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <p className="text-gray-500 italic">Pas de photo disponible</p>
                    </div>
                  )}
                </div>

                {selectedDog.id && getDogRequestStatus(selectedDog.id) && (
                  <div className={`py-2 px-3 rounded text-center font-medium ${getStatusBadgeClass(getDogRequestStatus(selectedDog.id))}`}>
                    {getStatusText(getDogRequestStatus(selectedDog.id))}
                  </div>
                )}
              </div>

              <div className="space-y-4 col-span-2 md:col-span-1">
                <h2 className="text-2xl font-bold text-gray-800">{selectedDog.nom}</h2>
                
                <div>
                  <h3 className="text-md font-semibold text-gray-700">Espèce</h3>
                  <p className="text-gray-600">{selectedDog.espece || 'Non spécifié'}</p>
                </div>
                
                <div>
                  <h3 className="text-md font-semibold text-gray-700">Race</h3>
                  <p className="text-gray-600">{selectedDog.race || 'Non spécifiée'}</p>
                </div>

                {selectedDog.date_naissance && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-700">Date de naissance</h3>
                    <p className="text-gray-600">{formatDate(selectedDog.date_naissance)}</p>
                  </div>
                )}

                {selectedDog.sexe && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-700">Sexe</h3>
                    <p className="text-gray-600">{selectedDog.sexe === 'M' ? 'Mâle' : 'Femelle'}</p>
                  </div>
                )}
                
                {selectedDog.description && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-700">Description</h3>
                    <p className="text-gray-600">{selectedDog.description}</p>
                  </div>
                )}

                {dogEvents && dogEvents.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-700">Historique des événements</h3>
                    <ul className="list-disc pl-5 text-gray-600">
                      {dogEvents.map((event, index) => (
                        <li key={`event-${index}`}>
                          {event.titre} - {formatDate(event.date)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4">
                  {selectedDog.id && getDogRequestStatus(selectedDog.id) ? (
                    getDogRequestStatus(selectedDog.id) !== 'Acceptee' && (
                      <button
                        onClick={() => cancelRequest(selectedDog.id)}
                        disabled={submitting}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
                      >
                        {submitting ? "Annulation..." : "Annuler ma demande"}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDogSelection(selectedDog);
                        closeModal();
                      }}
                      disabled={submitting}
                      className={`w-full ${selectedDogs.includes(selectedDog.id) ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-4 rounded-md transition-colors`}
                    >
                      {selectedDogs.includes(selectedDog.id) ? "Désélectionner ce chien" : "Sélectionner ce chien"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button 
                onClick={closeModal} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}