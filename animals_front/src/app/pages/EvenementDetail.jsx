'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navbar from './NavbarPage';
import { FaPaw, FaDog, FaCat, FaGoogle, FaHeart, FaSmile, FaArrowRight,FaHome,FaShoppingBag,FaWalking} from "react-icons/fa";
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
      'Acceptee': { class: 'bg-green-100 text-green-800', text: 'Accepté' },
      'Refusee': { class: 'bg-red-100 text-red-800', text: 'Refusé' },
      default: { class: 'bg-yellow-100 text-yellow-800', text: 'En attente' }
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.push('/marche')}
          className="mb-6 flex items-center text-primary hover:text-primary/80"
        >
          ← Retour aux événements
        </button>

        {error && <div className="bg-red-100 p-4 rounded-lg mb-6">{error}</div>}
        {success && <div className="bg-green-100 p-4 rounded-lg mb-6">{success}</div>}

        {loading ? (
          <div className="text-center p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-primary">Chargement...</p>
          </div>
        ) : evenement ? (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-primary">{evenement.titre}</h1>
              <div className="flex flex-wrap justify-center gap-4 text-dark">
                <div className="flex items-center bg-white px-4 py-2 rounded-full">
                  📅 {formatDate(evenement.date)}
                </div>
                <div className="flex items-center bg-white px-4 py-2 rounded-full">
                  🕒 {evenement.heure.substring(0, 5)}
                </div>
                <div className="flex items-center bg-white px-4 py-2 rounded-full">
                  📍 {evenement.lieu}
                </div>
              </div>
              {evenement.description && (
                <p className="text-dark/80 italic max-w-2xl mx-auto">"{evenement.description}"</p>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary">
                Chiens participants ({filteredDogs.length})
              </h2>
              
              {filteredDogs.length === 0 ? (
                <div className="bg-accent/10 rounded-2xl p-8 text-center">
                  🐾 Aucun chien disponible
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDogs.map((dog) => (
                    <div
                      key={dog.id}
                      className={`group relative bg-white p-4 rounded-xl shadow-lg transition-all
                        ${userDemandes[dog.id] ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                        ${selectedDogs.includes(dog.id) ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => !userDemandes[dog.id] && fetchAnimalDetails(dog)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                          {dog.image ? (
                            <img
                              src={`http://localhost:8000${dog.image}`}
                              alt={dog.nom}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              🐶
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{dog.nom}</h3>
                          <p className="text-dark/60">{dog.race}</p>
                          {userDemandes[dog.id] && (
                            <span className={`px-2 py-1 text-sm rounded-full mt-2 inline-block 
                              ${getStatusBadge(userDemandes[dog.id].status).class}`}>
                              {getStatusBadge(userDemandes[dog.id].status).text}
                            </span>
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
          <div className="text-center">Événement non trouvé</div>
        )}

        {isModalOpen && selectedDog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
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
                  <h2 className="text-3xl font-bold">{selectedDog.nom}</h2>
                  <div className="space-y-2">
                    <p><span className="font-semibold">Race:</span> {selectedDog.race || '-'}</p>
                    <p><span className="font-semibold">Sexe:</span> {selectedDog.sexe === 'M' ? 'Mâle' : 'Femelle'}</p>
                    <p><span className="font-semibold">Âge:</span> {formatDate(selectedDog.date_naissance)}</p>
                    {selectedDog.description && (
                      <p className="text-dark/80">{selectedDog.description}</p>
                    )}
                  </div>
                  {userDemandes[selectedDog.id] ? (
                    getStatusBadge(userDemandes[selectedDog.id].status).text !== 'Accepté' && (
                      <button
                        onClick={() => cancelRequest(selectedDog.id)}
                        className="w-full bg-red-500 text-white py-2 rounded-lg"
                        disabled={submitting}
                      >
                        Annuler la demande
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        toggleDogSelection(selectedDog);
                        setIsModalOpen(false);
                      }}
                      className={`w-full py-2 rounded-lg 
                        ${selectedDogs.includes(selectedDog.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-primary text-white'}`}
                    >
                      {selectedDogs.includes(selectedDog.id) 
                        ? 'Désélectionner' 
                        : 'Sélectionner'}
                    </button>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full py-2 border border-gray-300 rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {selectedDogs.length > 0 && (
          <div className="fixed bottom-4 right-4">
            <button
              onClick={submitRequest}
              disabled={submitting}
              className="bg-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
            >
              {submitting ? 'Envoi...' : 'Confirmer la sélection'}
              <span className="bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center">
                {selectedDogs.length}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}