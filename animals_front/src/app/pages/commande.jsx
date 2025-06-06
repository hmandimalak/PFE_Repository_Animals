import { useState, useEffect } from 'react';
import { FaArrowLeft, FaMoneyBill, FaPaw,FaPlus, FaMinus ,FaMapMarkerAlt,FaHome,FaPhone,FaEnvelope,FaClock,FaLink,
FaFacebook,FaTwitter,FaInstagram,FaYoutube} from 'react-icons/fa';
import Link from 'next/link';
import Navbar from './NavbarPage';
import { useSession } from "next-auth/react";
import { authenticatedFetch } from '../../app/authInterceptor';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('access_token');
    if (localToken) return `Bearer ${localToken}`;
    return localStorage.getItem('authToken');
  }
  return null;
};

const Commande = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  
  const [addressData, setAddressData] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: ''
  });

  const { data: session } = useSession();

useEffect(() => {
  setIsClient(true);
  setLoading(true);

  const authToken = getAuthToken();
  if (authToken) {
    // Fetch cart items
    authenticatedFetch('http://127.0.0.1:8001/api/boutique/panier/')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(cartData => {
        // Fetch product list to check discount status
        return fetch('http://127.0.0.1:8001/api/boutique/produits/')
          .then(res => res.json())
          .then(productData => {
            const formattedCart = cartData.map(item => {
              const product = productData.find(p => p.id === item.id);
              const effectivePrice = product?.is_discount_active
                ? parseFloat(product.prix_promotion)
                : parseFloat(product?.prix || item.prix);
              return {
                ...item,
                prix: effectivePrice
              };
            });
            setCartItems(formattedCart);
          });
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
        const savedCart = localStorage.getItem('cart');
        if (savedCart) setCartItems(JSON.parse(savedCart));
      })
      .finally(() => setLoading(false));

    // Fetch user profile for address data
    authenticatedFetch('http://127.0.0.1:8001/api/auth/profile/')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setAddressData({
          nom: data.nom || '',
          prenom: data.prenom || '',
          adresse: data.adresse || '',
          code_postal: data.code_postal || '',
          ville: data.ville || '',
          telephone: data.telephone || ''
        });
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
      });
  } else {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
    setLoading(false);
  }
}, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const getLivraisonFees = () => {
    const total = parseFloat(getTotalPrice());
    return total >= 20 ? "0.00" : "5";
  };

const getTotalPrice = () => {
  return cartItems.reduce((total, item) => total + (parseFloat(item.prix) * item.quantity), 0).toFixed(2);
};

const getSubtotal = () => {
  return (parseFloat(getTotalPrice()) * 0.8).toFixed(2);
};

const getTVA = () => {
  return (parseFloat(getTotalPrice()) * 0.2).toFixed(2);
};

const getFinalTotal = () => {
  const total = parseFloat(getTotalPrice());
  const livraison = total >= 50 ? 0 : 4.99;
  return (total + livraison).toFixed(2);
};

const handleSubmitOrder = async (e) => {
  e.preventDefault();
  const authToken = getAuthToken();
  if (!authToken) {
    alert("Vous devez être connecté pour passer une commande.");
    return;
  }
  setProcessingOrder(true);

  try {
    const response = await authenticatedFetch('http://127.0.0.1:8001/api/boutique/commander/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adresse_livraison: `${addressData.prenom} ${addressData.nom}, ${addressData.adresse}, ${addressData.code_postal} ${addressData.ville}`,
        telephone: addressData.telephone,
        methode_paiement: 'livraison',
        items: cartItems.map(item => ({
          produit_id: item.id,
          quantity: item.quantity,
          prix: item.prix // Send the discounted price
        }))
      })
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    localStorage.removeItem('cart');
    setCartItems([]);
    setOrderSuccess(true);
    setOrderNumber(data.numero_commande);
  } catch (error) {
    console.error('Error creating order:', error);
    alert("Une erreur s'est produite lors de la validation de la commande.");
  } finally {
    setProcessingOrder(false);
  }
};

  const handleRemoveItem = async (productId) => {
    try {
      // Remove from state
      setCartItems(cartItems.filter(item => item.id !== productId));
      
      // Remove from API
      const authToken = getAuthToken();
      if (authToken) {
        await authenticatedFetch(`http://127.0.0.1:8001/api/boutique/panier/supprimer/${productId}/`, {
          method: 'DELETE'
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert("Une erreur s'est produite lors de la suppression de l'article.");
    }
  };

  const handleQuantityChange = async (productId, change) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    });
    setCartItems(updatedCart);
    const updatedItem = updatedCart.find(item => item.id === productId);
    const authToken = getAuthToken();
    if (authToken && updatedItem) {
      try {
        await authenticatedFetch(`http://127.0.0.1:8001/api/boutique/panier/update/${productId}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: updatedItem.quantity })
        });
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-accent/20">
            <div className="text-center py-8">
              <p>Chargement...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12 space-y-4 animate-fade-in-down">
            <h1 className="text-5xl font-extrabold text-primary">Panier Vide</h1>
            <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-accent/20 text-center py-12">
            <p className="text-xl text-dark/60 mb-6">Votre panier est vide</p>
            <Link 
              href="/boutique" 
              className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Retourner à la boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-accent/20 text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-dark mb-2">Commande réussie!</h2>
            <p className="text-lg text-dark/60 mb-6">Votre commande numéro <span className="font-semibold text-primary">{orderNumber}</span> a été enregistrée.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/boutique" className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-xl transition-colors">
                Continuer les achats
              </Link>
              <Link href="/profile" className="bg-accent/10 hover:bg-accent/20 text-dark py-2 px-6 rounded-xl transition-colors">
                Voir mes commandes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4 animate-fade-in-down">
          <h1 className="text-5xl font-extrabold text-primary">Finaliser Votre Commande</h1>
          <p className="text-dark/80 text-xl">Complétez vos informations de livraison</p>
          <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Shipping Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-accent/20">
              <Link 
                href="/panier" 
                className="flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
              >
                <FaArrowLeft className="mr-2" />
                Retour au panier
              </Link>

              <form onSubmit={handleSubmitOrder}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-dark/80 mb-2" htmlFor="nom">Nom</label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={addressData.nom}
                      onChange={handleInputChange}
                      className="w-full border-2 border-accent/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-dark/80 mb-2" htmlFor="prenom">Prénom</label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={addressData.prenom}
                      onChange={handleInputChange}
                      className="w-full border-2 border-accent/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-dark/80 mb-2" htmlFor="adresse">Adresse</label>
                    <input
                      type="text"
                      id="adresse"
                      name="adresse"
                      value={addressData.adresse}
                      onChange={handleInputChange}
                      className="w-full border-2 border-accent/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-dark/80 mb-2" htmlFor="code_postal">Code Postal</label>
                    <input
                      type="text"
                      id="code_postal"
                      name="code_postal"
                      value={addressData.code_postal}
                      onChange={handleInputChange}
                      className="w-full border-2 border-accent/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-dark/80 mb-2" htmlFor="ville">Ville</label>
                    <input
                      type="text"
                      id="ville"
                      name="ville"
                      value={addressData.ville}
                      onChange={handleInputChange}
                      className="w-full border-2 border-accent/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-dark/80 mb-2" htmlFor="telephone">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={addressData.telephone}
                      onChange={handleInputChange}
                      className="w-full border-2 border-accent/20 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-dark mb-4">Méthode de Paiement</h3>
                  <div className="border-2 border-accent/20 rounded-xl p-4 bg-secondary/10">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FaMoneyBill className="text-2xl text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-dark">Paiement à la livraison</h4>
                        <p className="text-dark/60 text-sm">Espèces ou carte à la réception</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-primary text-white py-4 rounded-xl hover:bg-primary/90 transition-colors disabled:bg-gray-400"
                  disabled={processingOrder}
                >
                  {processingOrder ? 'Traitement en cours...' : 'Confirmer la Commande'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-accent/20 sticky top-8">
              <h2 className="text-2xl font-bold text-dark mb-6">Résumé</h2>

              <div className="space-y-6 mb-8">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                    <img
                  src={item.image.startsWith('http') 
                    ? item.image 
                    :`http://127.0.0.1:8001/${item.image}`}
                  alt={item.nom}
                  className="w-24 h-24 object-cover rounded-lg mr-6"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                />
                      <div>
                        <h4 className="font-medium text-dark">{item.nom}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <button 
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="p-1 text-primary hover:bg-accent/10 rounded-lg"
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 bg-accent/10 rounded-lg">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="p-1 text-primary hover:bg-accent/10 rounded-lg"
                          >
                            <FaPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="font-semibold text-primary">{(item.prix * item.quantity).toFixed(2)} DT</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-accent/20 pt-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-dark/80">
                    <span>Sous-total</span>
                    <span>{getSubtotal()} DT</span>
                  </div>
                  <div className="flex justify-between text-dark/80">
                    <span>TVA (20%)</span>
                    <span>{getTVA()} DT</span>
                  </div>
                  <div className="flex justify-between text-dark/80">
                    <span>Livraison</span>
                    <span>{getLivraisonFees() === "0.00" ? "Gratuit" : `${getLivraisonFees()} DT`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <span className="text-xl font-bold text-dark">Total</span>
                  <span className="text-2xl font-bold text-primary">{getFinalTotal()} DT</span>
                </div>
              </div>
            </div>
          </div>
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
};

export default Commande;