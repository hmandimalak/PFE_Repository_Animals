'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navbar from './NavbarPage';

import { FaPaw, FaDog, FaCat, FaCalendarAlt,FaMapMarkerAlt,FaHome,FaPhone,FaEnvelope,FaClock,FaLink,FaFacebook,FaTwitter,FaInstagram,FaYoutube
 } from "react-icons/fa";
import Link from 'next/link';
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"] });

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
      // Remove authentication token requirement
      const response = await fetch('http://localhost:8001/api/animals/evenements/marche-chiens/', {
        method: 'GET',
        // Removed the Authorization header
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto"></div>
          <p className="text-primary font-medium text-xl">Chargement des événements...</p>
        </div>
      </div>
    );
  }

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


      <div className="container mx-auto px-4 py-12">
        <div className="relative text-center mb-12 pb-8">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          <h1 className="text-5xl font-extrabold text-primary mb-4">Événements de Marche</h1>
          <p className="text-dark/80 text-xl max-w-2xl mx-auto">Rejoignez nos balades canines et partagez des moments inoubliables avec nos compagnons à quatre pattes</p>

        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8 shadow-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              {error}
            </div>
          </div>
        )}

        {evenements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-lg mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6">
              <FaPaw className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-3">Aucun événement à venir</h2>
            <p className="text-dark/70">Nos prochains événements de marche seront affichés ici. Revenez bientôt!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {evenements.map((event) => (
              <div 
                key={event.id}
                onClick={() => navigateToEventDetail(event.id)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer group"
              >
                <div className="h-3 bg-gradient-to-r from-primary via-accent to-primary"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-primary">{event.titre}</h2>
                    <span className="bg-secondary text-primary text-sm font-medium px-3 py-1 rounded-full">
                      {event.chiens?.length || 0} 🐕
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-dark/70">
                      <FaCalendarAlt className="w-5 h-5 text-accent mr-3" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-dark/70">
                      <FaClock className="w-5 h-5 text-accent mr-3" />
                      <span>{event.heure.substring(0, 5)}</span>
                    </div>
                    
                    <div className="flex items-center text-dark/70">
                      <FaMapMarkerAlt className="w-5 h-5 text-accent mr-3" />
                      <span>{event.lieu}</span>
                    </div>
                  </div>
                  
                  {event.description && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <p className="text-dark/60 line-clamp-3 italic">
                        "{event.description}"
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-gray-50 group-hover:bg-primary/10 transition-colors border-t border-gray-100">
                  <button className="w-full flex items-center justify-center gap-2 text-primary font-medium hover:text-primary/80">
                    Voir les détails
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>

            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <p className="text-dark/60">Besoin d'aide pour trouver un événement?</p>
          <a href="#" className="text-primary font-medium hover:underline">Contactez-nous</a>

        </div>
      </div>
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
  );
}