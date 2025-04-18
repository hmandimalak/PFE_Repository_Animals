'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navbar from './NavbarPage';
import { FaPaw, FaDog, FaCat, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChevronLeft, FaHeart } from "react-icons/fa";
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"] });

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
  const [selectedDogs, setSelectedDogs] = useState([]);

  const router = useRouter();
  const params = useParams();
  const eventId = params.id;

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  useEffect(() => {
    if (eventId) fetchEventDetails(eventId);
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
      setEvenement(data.evenement);

      if (Array.isArray(data.evenement.chiens)) {
        const dogDetails = await Promise.all(
          data.evenement.chiens.map(dogId => 
            fetch(`http://localhost:8000/api/animals/${dogId}/`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.ok ? res.json() : null)
          )
        );
        setFilteredDogs(dogDetails.filter(Boolean));
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimalDetails = async (dog) => {
    if (!dog?.id) return;
    try {
      const response = await fetch(`http://localhost:8000/api/animals/${dog.id}/`);
      const data = await response.json();
      setSelectedDog(data);
      setIsModalOpen(true);
    } catch (error) {
      setError('Failed to load animal details');
    }
  };

  const submitRequest = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('access_token');
      await fetch('http://localhost:8000/api/animals/demandes/marche-chiens/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evenement: evenement.id,
          chiens: selectedDogs
        })
      });
      await fetchEventDetails(eventId);
      setSuccess('Demande soumise avec succès !');
      setSelectedDogs([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDogSelection = (dog) => {
    if (!dog?.id || userDemandes[dog.id]) return;
    setSelectedDogs(prev => 
      prev.includes(dog.id) 
        ? prev.filter(id => id !== dog.id) 
        : [...prev, dog.id]
    );
  };

  const cancelRequest = async (dogId) => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem('access_token');
      await fetch(`http://localhost:8000/api/animals/demandes/marche-chiens/${userDemandes[dogId].demandeId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchEventDetails(eventId);
      setSuccess('Demande annulée avec succès');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Acceptee': { class: 'bg-green-100 text-green-800 border border-green-200', text: 'Accepté' },
      'Refusee': { class: 'bg-red-100 text-red-800 border border-red-200', text: 'Refusé' },
      default: { class: 'bg-yellow-100 text-yellow-800 border border-yellow-200', text: 'En attente' }
    };
    return statusConfig[status] || statusConfig.default;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-secondary via-secondary/30 to-white ${nunito.className}`}>
      <div className="sticky top-0 w-full z-50 bg-white shadow-md">
        <Navbar />
      </div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 right-10 opacity-10 animate-bounce">
        <FaDog className="w-24 h-24 text-primary" />
      </div>
      <div className="absolute bottom-40 left-20 opacity-10 animate-pulse">
        <FaCat className="w-32 h-32 text-dark" />
      </div>
      <div className="absolute top-60 right-1/4 opacity-10 animate-bounce delay-300">
        <FaPaw className="w-20 h-20 text-primary" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => router.push('/marche')}
          className="mb-6 inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors bg-white/80 px-4 py-2 rounded-full shadow-sm"
        >
          <FaChevronLeft className="mr-2" /> Retour aux événements
        </button>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 shadow animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
            <p className="mt-4 text-primary font-medium">Chargement de l'événement...</p>
          </div>
        ) : evenement ? (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary"></div>
              <div className="p-8">
                <h1 className="text-4xl font-bold text-primary text-center mb-6">{evenement.titre}</h1>
                
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  <div className="flex items-center bg-secondary/30 px-6 py-3 rounded-full">
                    <FaCalendarAlt className="text-accent mr-3" />
                    <span className="font-medium">{formatDate(evenement.date)}</span>
                  </div>
                  <div className="flex items-center bg-secondary/30 px-6 py-3 rounded-full">
                    <FaClock className="text-accent mr-3" />
                    <span className="font-medium">{evenement.heure.substring(0, 5)}</span>
                  </div>
                  <div className="flex items-center bg-secondary/30 px-6 py-3 rounded-full">
                    <FaMapMarkerAlt className="text-accent mr-3" />
                    <span className="font-medium">{evenement.lieu}</span>
                  </div>
                </div>
                
                {evenement.description && (
                  <div className="max-w-2xl mx-auto text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></div>
                      <div className="relative bg-white px-4 inline-block">
                        <FaPaw className="text-accent inline-block" />
                      </div>
                    </div>
                    <p className="text-dark/80 italic">{evenement.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-primary">
                    Chiens participants ({filteredDogs.length})
                  </h2>
                  <span className="bg-secondary text-sm font-medium text-primary px-4 py-1 rounded-full">
                    {filteredDogs.length} compagnons
                  </span>
                </div>
              </div>
              
              {filteredDogs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                    <FaPaw className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-dark mb-2">Aucun chien disponible</h3>
                  <p className="text-dark/60">Aucun chien n'a été ajouté à cet événement pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 p-6">
                {filteredDogs.map((dog) => (
                  <div
                    key={dog.id}
                    className={`group relative bg-white rounded-xl shadow-md transition-all overflow-hidden
                      ${userDemandes[dog.id] ? 'opacity-80' : 'hover:shadow-lg cursor-pointer'}
                      ${selectedDogs.includes(dog.id) ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => !userDemandes[dog.id] && fetchAnimalDetails(dog)}
                  >
                    <div className="h-2 bg-accent/50"></div>
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {dog.image ? (
                            <img
                              src={`http://localhost:8000${dog.image}`}
                              alt={dog.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                              🐶
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{dog.nom}</h3>
                          <p className="text-dark/60 mb-1">{dog.race || "Race inconnue"}</p>
                          <p className="text-dark/70 text-sm">{dog.sexe === 'M' ? 'Mâle' : 'Femelle'} • {formatDate(dog.date_naissance)}</p>
                          {userDemandes[dog.id] && (
                            <span className={`mt-2 inline-block px-3 py-1 text-xs font-medium rounded-full 
                              ${getStatusBadge(userDemandes[dog.id].status).class}`}>
                              {getStatusBadge(userDemandes[dog.id].status).text}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {dog.description && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-sm text-dark/80 line-clamp-2">{dog.description}</p>
                        </div>
                      )}
                      
                      
                      <div className="flex items-center text-xs text-dark/60 mt-2">
                        <div className="flex items-center">
                          <FaPaw className="w-3 h-3 mr-1" />
                          <span>{dog.niveau_energie || 'Énergie modérée'}</span>
                        </div>
                        
                        {selectedDogs.includes(dog.id) && (
                          <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1">
                            <FaHeart className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Événement non trouvé</h2>
            <p className="text-dark/70 mb-6">Cet événement n'existe pas ou a été supprimé.</p>
            <button
              onClick={() => router.push('/marche')}
              className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg font-medium"
            >
              Retour à la liste des événements
            </button>
          </div>
        )}

        {isModalOpen && selectedDog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl">
              <div className="h-2 bg-gradient-to-r from-primary to-accent"></div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-primary mb-4 text-center pb-3 border-b border-gray-100">
                  {selectedDog.nom}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative h-64 rounded-xl overflow-hidden bg-gray-100">
                    {selectedDog.image ? (
                      <img
                        src={`http://localhost:8000${selectedDog.image}`}
                        alt={selectedDog.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🐾
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-dark/60">Race</p>
                        <p className="font-medium">{selectedDog.race || 'Non spécifiée'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-dark/60">Sexe</p>
                        <p className="font-medium">{selectedDog.sexe === 'M' ? 'Mâle' : 'Femelle'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                        <p className="text-sm text-dark/60">Date de naissance</p>
                        <p className="font-medium">{formatDate(selectedDog.date_naissance)}</p>
                      </div>
                    </div>
                    
                    {selectedDog.description && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-dark/60 mb-1">Description</p>
                        <p className="text-dark/80">{selectedDog.description}</p>
                      </div>
                    )}
                    
                    {userDemandes[selectedDog.id] ? (
                      getStatusBadge(userDemandes[selectedDog.id].status).text !== 'Accepté' && (
                        <button
                          onClick={() => cancelRequest(selectedDog.id)}
                          className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center"
                          disabled={submitting}
                        >
                          {submitting ? 
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Annulation...
                            </span> : 
                            'Annuler la demande'
                          }
                        </button>
                      )
                    ) : (
                      <button
                      onClick={() => {
                        toggleDogSelection(selectedDog);
                        setIsModalOpen(false);
                      }}
                      className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                        ${selectedDogs.includes(selectedDog.id) 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-primary text-white hover:bg-primary/90'}`}
                    >
                      {selectedDogs.includes(selectedDog.id) 
                        ? 'Désélectionner' 
                        : 'Sélectionner pour la marche'}
                      {!selectedDogs.includes(selectedDog.id) && (
                        <FaPaw className="animate-bounce" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDogs.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={submitRequest}
            disabled={submitting}
            className="bg-gradient-to-r from-primary to-accent text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3 group"
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </span>
            ) : (
              <>
                Confirmer la sélection
                <div className="bg-white text-primary font-bold rounded-full w-7 h-7 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {selectedDogs.length}
                </div>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  </div>
);
}
                      