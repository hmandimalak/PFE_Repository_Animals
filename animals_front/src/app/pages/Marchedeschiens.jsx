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

      if (!response.ok) throw new Error('Échec du chargement des événements');
      
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
    router.push(`/marchedetail/${eventId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-primary">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4 animate-fade-in-down">
          <h1 className="text-5xl font-extrabold text-primary">Événements de Marche avec les Chiens</h1>
          <p className="text-dark/80 text-xl">Participez à nos rencontres canines</p>
          <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {evenements.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="text-5xl mb-4">🐕‍🦺</div>
              <h2 className="text-xl font-semibold text-primary mb-2">Aucun événement à venir</h2>
              <p className="text-dark/60">Revenez plus tard pour nos prochains événements</p>
            </div>
          ) : evenements.map((event) => (
            <div 
              key={event.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer group"
              onClick={() => navigateToEventDetail(event.id)}
            >
              <div className="bg-primary text-white p-6">
                <h2 className="text-2xl font-bold">{event.titre}</h2>
                <p className="text-sm opacity-90 mt-2">
                  {formatDate(event.date)} à {event.heure.substring(0, 5)}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-dark/80">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.lieu}</span>
                </div>
                
                <div className="flex items-center gap-3 text-dark/80">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>{event.chiens?.length || 0} participants</span>
                </div>

                {event.description && (
                  <p className="text-dark/60 line-clamp-3">
                    {event.description}
                  </p>
                )}

                <button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary/20 py-3 rounded-xl transition-colors">
                  Voir les détails
                </button>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </div>
  );
}