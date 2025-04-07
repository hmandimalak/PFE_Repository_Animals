'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EvenementMarcheDetail() {
  const [evenement, setEvenement] = useState(null);
  const [selectedDogs, setSelectedDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userDemande, setUserDemande] = useState(null);
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId]);

  const fetchEventDetails = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/evenements/marche-chiens/${id}/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Échec du chargement des détails de l\'événement');
      }

      const data = await response.json();
      setEvenement(data.evenement);

      // If user already has a request, set the selected dogs
      if (data.user_demande) {
        setUserDemande(data.user_demande);
        setSelectedDogs(data.user_demande.chiens || []);
      }

      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des détails. Veuillez réessayer.');
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'EEEE d MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateStr;
    }
  };

  const toggleDogSelection = (dog) => {
    if (userDemande && userDemande.statut === 'Acceptee') {
      setError("Votre demande a déjà été acceptée. Vous ne pouvez plus modifier votre sélection.");
      return;
    }

    setSelectedDogs(prev => {
      const isSelected = prev.some(d => d === dog.id);

      if (isSelected) {
        return prev.filter(d => d !== dog.id);
      } else {
        if (prev.length >= 3) {
          setError("Vous ne pouvez pas sélectionner plus de 3 chiens");
          return prev;
        }
        return [...prev, dog.id];
      }
    });
  };

  const submitRequest = async () => {
    if (selectedDogs.length === 0) {
      setError("Veuillez sélectionner au moins un chien");
      return;
    }

    if (selectedDogs.length > 3) {
      setError("Vous ne pouvez pas sélectionner plus de 3 chiens");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/demandes/marche-chiens/', {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la soumission de la demande');
      }

      const data = await response.json();
      setUserDemande(data);
      setSuccess("Votre demande a été soumise avec succès !");

      // Refresh the data
      setTimeout(() => {
        fetchEventDetails(eventId);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      console.error('Error submitting request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async () => {
    if (!userDemande || userDemande.statut === 'Acceptee') {
      setError("Vous ne pouvez pas annuler une demande qui a déjà été acceptée.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/animals/demandes/marche-chiens/${userDemande.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Échec de l\'annulation de la demande');
      }

      setUserDemande(null);
      setSelectedDogs([]);
      setSuccess("Votre demande a été annulée avec succès !");

      // Refresh the data
      setTimeout(() => {
        fetchEventDetails(eventId);
      }, 1000);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'annulation. Veuillez réessayer.');
      console.error('Error canceling request:', err);
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
        
        {/* Event Details Card */}
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
          
          <div className="p-6">
            <h2 className="text-2xl font-semibold">Chiens disponibles</h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {evenement.chiens.map(dog => (
                <div key={dog.id} className="p-4 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>{dog.nom}</span>
                    <input 
                      type="checkbox"
                      checked={selectedDogs.includes(dog.id)}
                      onChange={() => toggleDogSelection(dog)}
                      disabled={userDemande && userDemande.statut === 'Acceptee'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={submitRequest}
            disabled={submitting}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:bg-blue-300"
          >
            {submitting ? "Soumission..." : "Soumettre la demande"}
          </button>

          <button
            onClick={cancelRequest}
            disabled={submitting}
            className="bg-red-500 text-white px-6 py-2 rounded-lg disabled:bg-red-300"
          >
            {submitting ? "Annulation..." : "Annuler la demande"}
          </button>
        </div>
      </div>
    </div>
  );
}
