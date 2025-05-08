import { useState, useEffect } from 'react';
import { FaArrowLeft, FaMoneyBill, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
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

    // Fetch user's cart
    const authToken = getAuthToken();
    if (authToken) {
      // Fetch cart items
      authenticatedFetch('http://127.0.0.1:8000/api/boutique/panier/')
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          if (data && Array.isArray(data)) {
            const formattedCart = data.map(item => ({
              id: item.id,
              nom: item.nom,
              prix: item.prix,
              image: item.image,
              quantity: item.quantity
            }));
            setCartItems(formattedCart);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching cart:', error);
          const savedCart = localStorage.getItem('cart');
          if (savedCart) setCartItems(JSON.parse(savedCart));
          setLoading(false);
        });
        
      // Fetch user profile for address data
      authenticatedFetch('http://127.0.0.1:8000/api/auth/profile/')
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          if (data) {
            setAddressData({
              nom: data.nom || '',
              prenom: data.prenom || '',
              adresse: data.adresse || '',
              code_postal: data.code_postal || '',
              ville: data.ville || '',
              telephone: data.telephone || ''
            });
          }
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

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.prix * item.quantity), 0).toFixed(2);
  };

  const getSubtotal = () => {
    return (parseFloat(getTotalPrice()) * 0.8).toFixed(2);
  };

  const getTVA = () => {
    return (parseFloat(getTotalPrice()) * 0.2).toFixed(2);
  };

  const getLivraisonFees = () => {
    const total = parseFloat(getTotalPrice());
    return total >= 20 ? "0.00" : "5";
  };

  const getFinalTotal = () => {
    const total = parseFloat(getTotalPrice());
    const livraison = total >= 50 ? 0 : 4.99;
    return (total + livraison).toFixed(2);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!addressData.nom || !addressData.prenom || !addressData.adresse || !addressData.code_postal || !addressData.ville || !addressData.telephone) {
      alert("Veuillez remplir toutes les informations de livraison");
      return;
    }
    
    const authToken = getAuthToken();
    if (!authToken) {
      alert("Vous devez être connecté pour passer une commande.");
      localStorage.setItem('redirectAfterLogin', '/commande');
      return;
    }
    
    setProcessingOrder(true);
    
    try {
      // Create order with address and payment method
      const response = await authenticatedFetch('http://127.0.0.1:8000/api/boutique/commander/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          adresse_livraison: `${addressData.prenom} ${addressData.nom}, ${addressData.adresse}, ${addressData.code_postal} ${addressData.ville}`,
          telephone: addressData.telephone,
          methode_paiement: 'livraison'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order error details:', errorData);
        alert(`Error: ${JSON.stringify(errorData)}`);
        throw new Error(`Error: ${response.status}`);
      }
      
      // Get response data
      const data = await response.json();
      
      // Clear cart
      localStorage.removeItem('cart');
      setCartItems([]);
      
      // Show success message without redirect
      setOrderSuccess(true);
      setOrderNumber(data.numero_commande);
      setProcessingOrder(false);
    } catch (error) {
      console.error('Error creating order:', error);
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
        await authenticatedFetch(`http://127.0.0.1:8000/api/boutique/panier/supprimer/${productId}/`, {
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
        await authenticatedFetch(`http://127.0.0.1:8000/api/boutique/panier/update/${productId}/`, {
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
                    :`http://127.0.0.1:8000/${item.image}`}
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
    </div>
  );
};

export default Commande;