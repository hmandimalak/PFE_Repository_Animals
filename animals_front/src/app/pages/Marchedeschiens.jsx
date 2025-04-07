'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navbar from './NavbarPage';

export default function EvenementMarcheList() {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchEvenements();
  }, []);

  const fetchEvenements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/animals/evenements/marche-chiens/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Échec du chargement des événements');
      }

      const data = await response.json();
      setEvenements(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des événements. Veuillez réessayer.');
      console.error('Error fetching events:', err);
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

  const navigateToEventDetail = (eventId) => {
    router.push("/marchedetail");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-blue-800">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-8">
         
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Événements de Marche avec les Chiens</h1>
          <p className="text-gray-600">Participez à nos événements de marche avec les chiens et aidez-les à se sociabiliser et faire de l'exercice.</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {evenements.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🐕‍🦺</div>
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Aucun événement à venir</h2>
            <p className="text-gray-600">Revenez plus tard pour découvrir nos prochains événements de marche avec les chiens.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evenements.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition"
                onClick={() => navigateToEventDetail(event.id)}
              >
                <div className="bg-blue-600 text-white p-4">
                  <h2 className="text-xl font-semibold">{event.titre}</h2>
                  <p className="text-blue-100">{formatDate(event.date)} à {event.heure.substring(0, 5)}</p>
                </div>
                <div className="p-4">
                  <p className="flex items-center text-gray-700 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.lieu}
                  </p>
                  <p className="flex items-center text-gray-700 mb-4">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.chiens?.length || 0} chien(s) participant(s)
                  </p>
                  {event.description && (
                    <p className="text-gray-600 mt-2 line-clamp-3">
                      {event.description}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors">
                    Voir les détails
                  </button>
                </div>
              </div>
            ))}
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
    </div>
    </div>
    
  );
}