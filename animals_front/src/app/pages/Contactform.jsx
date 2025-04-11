"use client";
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSession } from "next-auth/react";
import { authenticatedFetch } from '../../app/authInterceptor';

// Helper function to check authentication status more reliably
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('access_token');
    if (localToken) return true;
    return !!localStorage.getItem('authToken');
  }
  return false;
};

const ContactForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    message: ''
  });
  const [userEmail, setUserEmail] = useState('');
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
    loading: true,
    isAuthenticated: false
  });

  const { data: session } = useSession();

  // Check authentication status using multiple methods
  useEffect(() => {
    const checkAuth = async () => {
      // First check for token in localStorage (your app seems to use this)
      const hasToken = getAuthToken();
      
      if (hasToken) {
        setStatus(prev => ({ ...prev, isAuthenticated: true }));
        
        try {
          // Try to fetch user data to confirm the token is valid
          const response = await authenticatedFetch('http://127.0.0.1:8000/api/auth/user/');
          
          if (response.ok) {
            const userData = await response.json();
            setUserEmail(userData.email);
            console.log('User data:', userData);

            setStatus(prev => ({ ...prev, loading: false, isAuthenticated: true }));
          } else {
            // Fallback to profile endpoint if user endpoint fails
            try {
              const profileResponse = await authenticatedFetch('http://127.0.0.1:8000/api/auth/profile/');
              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                setUserEmail(profileData.email);

                setStatus(prev => ({ ...prev, loading: false, isAuthenticated: true }));
              } else {
                throw new Error('Authentication failed');
              }
            } catch (profileError) {
              console.error('Profile fetch error:', profileError);
              setStatus(prev => ({ 
                ...prev, 
                loading: false,
                isAuthenticated: false,
                error: 'Erreur d\'authentification'
              }));
            }
          }
        } catch (error) {
          console.error('User data fetch error:', error);
          setStatus(prev => ({ 
            ...prev, 
            loading: false,
            // Still consider authenticated if token exists, even if fetch fails
            isAuthenticated: true,
            error: 'Erreur lors du chargement des données utilisateur'
          }));
        }
      } else if (session) {
        // If no token but next-auth session exists
        setStatus(prev => ({ ...prev, loading: false, isAuthenticated: true }));
        // Try to get email from session if available
        if (session.user?.email) {
          setUserEmail(session.user.email);
        }
      } else {
        // No authentication found
        setStatus(prev => ({ ...prev, loading: false, isAuthenticated: false }));
      }
    };

    checkAuth();
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(prev => ({ ...prev, submitting: true, error: null }));

    try {
      // If no email was loaded from user data, check if we can get it from session
      const emailToUse = userEmail || (session?.user?.email || '');
      
      // Use the authenticatedFetch with the complete data including the email
      const response = await authenticatedFetch('http://127.0.0.1:8000/api/auth/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: emailToUse
        }),
      });

      if (!response.ok) {
        // Try to get more detailed error info
        const errorData = await response.json().catch(() => null);
        console.error('Contact form error details:', errorData);
        throw new Error(errorData?.detail || 'Problème lors de l\'envoi du message');
      }

      setStatus(prev => ({ ...prev, submitting: false, submitted: true, error: null }));
      // Reset form after successful submission
      setFormData({ name: '', message: '' });
      
      // Close form after a delay
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Contact form submission error:', error);
      setStatus(prev => ({ ...prev, submitting: false, error: error.message }));
    }
  };

  // Show loading state
  if (status.loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative mx-4">
          <div className="text-center py-4">Chargement...</div>
        </div>
      </div>
    );
  }

  // REMOVED THE SESSION CHECK - Allow form to show even if session detection fails
  // We're now using localStorage token check which is more reliable for your app

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full relative mx-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Fermer"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <h3 className="text-xl font-bold text-pastel-blue mb-6">Contactez-nous</h3>
        
        {status.submitted ? (
          <div className="text-center py-8">
            <div className="text-pastel-green text-xl mb-2">Message envoyé!</div>
            <p>Merci de nous avoir contacté. Nous vous répondrons dans les plus brefs délais.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pastel-green focus:border-pastel-green"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={userEmail || (session?.user?.email || '')}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Email associé à votre compte</p>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Votre question
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-pastel-green focus:border-pastel-green"
              ></textarea>
            </div>
            
            {status.error && (
              <div className="text-red-500 text-sm">{status.error}</div>
            )}
            
            <button
              type="submit"
              disabled={status.submitting}
              className="w-full px-8 py-3 bg-pastel-green text-white rounded-full hover:bg-pastel-blue transition-colors disabled:opacity-50"
            >
              {status.submitting ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;