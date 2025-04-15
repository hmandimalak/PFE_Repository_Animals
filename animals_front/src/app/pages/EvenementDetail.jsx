'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navbar from './NavbarPage';

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
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button at Top Left */}
        <div className="mb-6">
          <button 
            onClick={() => router.push('/marche')}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/90 text-lg font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Retour aux événements
          </button>
        </div>
        
        <div className="text-center mb-8 space-y-6">
          {/* Title Section */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-primary">{evenement?.titre}</h1>
            <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
          </div>
          {evenement?.description && (
    <div className="max-w-2xl mx-auto px-4">
      <p className="text-dark/80 text-lg leading-relaxed text-justify italic border-l-4 border-accent pl-4">
        "{evenement.description}"
      </p>
    </div>
  )}


          {/* Event Metadata */}
          <div className="bg-accent/10 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap justify-center gap-6 text-lg text-dark">
              <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{formatDate(evenement?.date)}</span>
              </div>
              
              <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{evenement?.heure.substring(0, 5)}</span>
              </div>
              
              <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-full shadow-sm">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="font-medium">{evenement?.lieu}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-primary">Chargement des détails...</p>
          </div>
        ) : evenement ? (
          <div className="space-y-8">

 

            {/* Dogs Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary">
                  Chiens participants
                  <span className="text-lg text-dark/60 ml-2">
                    ({filteredDogs.length} chien{filteredDogs.length > 1 ? 's' : ''})
                  </span>
                </h2>
              </div>
              
              {filteredDogs.length === 0 ? (
                <div className="bg-accent/10 rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">🐾</div>
                  <h3 className="text-xl font-semibold text-dark">Aucun chien disponible</h3>
                  <p className="text-dark/60">Revenez plus tard pour voir les participants</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredDogs.map((dog) => (
                    <div
                      key={dog.id}
                      className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all ${
                        userDemandes[dog.id] ? 'opacity-70 cursor-not-allowed' : ''
                      } ${selectedDogs.includes(dog.id) ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => !userDemandes[dog.id] && fetchAnimalDetails(dog)}
                    >
                      <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-accent/10">
                          {dog.image ? (
                            <img
                              src={`http://127.0.0.1:8000${dog.image}`}
                              alt={dog.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/30">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-dark">{dog.nom}</h3>
                          <p className="text-dark/60 mt-1">{dog.race || 'Race non spécifiée'}</p>
                          {userDemandes[dog.id] && (
                            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(userDemandes[dog.id].status)}`}>
                              {getStatusText(userDemandes[dog.id].status)}
                            </span>
                          )}
                        </div>
                        {selectedDogs.includes(dog.id) && (
                          <div className="text-primary">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
            Événement non trouvé
          </div>
        )}

      

      {/* Dog Details Modal */}
      {isModalOpen && selectedDog && (
        <div className="fixed inset-0 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Image Column */}
              <div className="relative h-96 rounded-xl overflow-hidden">
                {selectedDog.image ? (
                  <img 
                    src={`http://127.0.0.1:8000${selectedDog.image}`} 
                    alt={selectedDog.nom} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-accent/10">
                    <div className="text-6xl text-dark/30">🐾</div>
                  </div>
                )}
              </div>

              {/* Details Column */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-dark">{selectedDog.nom}</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-primary">ESPÈCE</h3>
                    <p className="text-xl text-dark">{selectedDog.espece || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary">RACE</h3>
                    <p className="text-xl text-dark">{selectedDog.race || 'Non spécifiée'}</p>
                  </div>
                  {selectedDog.date_naissance && (
                    <div>
                      <h3 className="text-sm font-semibold text-primary">ÂGE</h3>
                      <p className="text-xl text-dark">{formatDate(selectedDog.date_naissance)}</p>
                    </div>
                  )}
                  {selectedDog.sexe && (
                    <div>
                      <h3 className="text-sm font-semibold text-primary">SEXE</h3>
                      <p className="text-xl text-dark">{selectedDog.sexe === 'M' ? 'Mâle' : 'Femelle'}</p>
                    </div>
                  )}
                </div>

                {selectedDog.description && (
                  <div className="border-t border-accent/20 pt-6">
                    <h3 className="text-sm font-semibold text-primary mb-2">DESCRIPTION</h3>
                    <p className="text-dark/80 leading-relaxed">
                      {selectedDog.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-accent/20 pt-6">
                  {selectedDog.id && getDogRequestStatus(selectedDog.id) ? (
                    getDogRequestStatus(selectedDog.id) !== 'Acceptee' && (
                      <button
                        onClick={() => cancelRequest(selectedDog.id)}
                        disabled={submitting}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition-colors"
                      >
                        {submitting ? "Annulation..." : "Annuler la demande"}
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
                      className={`w-full ${
                        selectedDogs.includes(selectedDog.id) 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-primary hover:bg-primary/90'
                      } text-white py-3 rounded-xl transition-colors`}
                    >
                      {selectedDogs.includes(selectedDog.id) 
                        ? "Désélectionner" 
                        : "Sélectionner ce chien"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-accent/20 px-8 py-6 bg-secondary/20">
              <div className="flex justify-end">
                <button 
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl border-2 border-primary text-primary hover:bg-primary/10 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}