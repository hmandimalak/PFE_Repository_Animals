import { useState, useEffect } from 'react';
import { FaTrash, FaArrowLeft, FaShoppingCart,FaMinus,FaPlus,FaPaw ,FaMapMarkerAlt,FaHome,FaPhone,FaEnvelope,FaClock,FaLink,FaFacebook,FaTwitter,FaInstagram,FaYoutube
 } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const Panier = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

// Fetch product list and apply discounts to cart items
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
            setLoading(false);
          });
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
        const savedCart = localStorage.getItem('cart');
        if (savedCart) setCartItems(JSON.parse(savedCart));
        setLoading(false);
      });
  } else {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
    setLoading(false);
  }
}, [session]);

  useEffect(() => {
    if (isClient) localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems, isClient]);

  const handleRemoveItem = async (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
    const authToken = getAuthToken();
    if (authToken) {
      try {
        await authenticatedFetch(`http://127.0.0.1:8001/api/boutique/panier/supprimer/${productId}/`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  };

const handleQuantityChange = async (productId, change) => {
  const authToken = getAuthToken();
  if (!authToken) return;

  try {
    // Créer une copie temporaire pour l'optimistic UI
    const tempCart = cartItems.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    });
    
    // Mise à jour optimiste immédiate
    setCartItems(tempCart);

    // Envoyer la requête API
    const response = await authenticatedFetch(
      `http://127.0.0.1:8001/api/boutique/panier/update/${productId}/`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: tempCart.find(i => i.id === productId).quantity }),
      }
    );

    // Recharger les données du panier après modification
    const updatedCart = await authenticatedFetch('http://127.0.0.1:8001/api/boutique/panier/');
    const cartData = await updatedCart.json();

    // Mettre à jour avec les données fraîches du serveur
    const productResponse = await fetch('http://127.0.0.1:8001/api/boutique/produits/');
    const productData = await productResponse.json();

    const formattedCart = cartData.map(item => {
      const product = productData.find(p => p.id === item.id);
      return {
        ...item,
        prix: product?.is_discount_active 
          ? parseFloat(product.prix_promotion)
          : parseFloat(product?.prix || item.prix)
      };
    });

    setCartItems(formattedCart);

  } catch (error) {
    console.error('Error:', error);
    // Revenir à l'état précédent en cas d'erreur
    setCartItems(cartItems);
  }
};

const getTotalPrice = () => {
  return cartItems.reduce((total, item) => total + (parseFloat(item.prix) * item.quantity), 0).toFixed(2);
};

 

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <p>Chargement...</p>
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
          <h1 className="text-5xl font-extrabold text-primary">Votre Panier</h1>
          <p className="text-dark/80 text-xl">Revoyez vos articles sélectionnés</p>
          <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-accent/20">
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/boutique" 
              className="flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Continuer vos achats
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-accent/10 rounded-full mb-6">
                <FaShoppingCart className="text-6xl text-primary" />
              </div>
              <p className="text-xl text-dark/60 mb-6">Votre panier est vide</p>
              <Link 
                href="/boutique" 
                className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Découvrir nos produits
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-6">
                {cartItems.map(item => (
                  <div 
                    key={item.id} 
                    className="flex flex-col sm:flex-row items-center justify-between p-6 bg-secondary/10 rounded-xl transition-all hover:shadow-md"
                  >
                    <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
                     <img
                  src={item.image.startsWith('http') 
                    ? item.image 
                    :`http://127.0.0.1:8001/${item.image}`}
                  alt={item.nom}
                  className="w-24 h-24 object-cover rounded-lg mr-6"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                />
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-dark">{item.nom}</h3>
<p className="text-primary font-medium">{item.prix} DT</p>
<p className="text-xl font-bold text-primary">
  {(item.prix * item.quantity).toFixed(2)} DT
</p>                      </div>
                    </div>
                    
                    <div className="flex items-center w-full sm:w-auto justify-between sm:justify-normal">
                      <div className="flex items-center border-2 border-accent/20 rounded-xl mr-6">
                        <button 
                          onClick={() => handleQuantityChange(item.id, -1)} 
                          className="px-4 py-2 text-primary hover:bg-accent/10 rounded-l-xl transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus />
                        </button>
                        <span className="px-4 text-dark font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, 1)} 
                          className="px-4 py-2 text-primary hover:bg-accent/10 rounded-r-xl transition-colors"
                        >
                          <FaPlus />
                        </button>
                      </div>
                      
                      <div className="text-right mr-6">
                        <p className="text-xl font-bold text-primary">
                          {(item.prix * item.quantity).toFixed(2)} DT
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
{/* Cart Summary */}
<div className="mt-12 pt-8 border-t border-accent/20">
  <div className="flex flex-col items-end space-y-6">
    {/* Total Price */}
    <div className="space-y-2 text-right">
      <p className="text-2xl font-bold text-dark">
        Total: <span className="text-primary">{getTotalPrice()} DT</span>
      </p>
      <p className="text-dark/60">Frais de livraison calculés à la prochaine étape</p>
    </div>
    
    {/* Checkout Button */}
    <Link 
      href="/commande" 
      className="bg-primary text-white px-12 py-4 rounded-xl hover:bg-primary/90 transition-colors text-lg font-medium w-full md:w-auto text-center"
    >
      Passer la commande
    </Link>
  </div>
</div>
            </>
          )}
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

export default Panier;