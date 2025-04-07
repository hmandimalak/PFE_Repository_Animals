import { useState, useEffect } from 'react';
import { FaArrowLeft, FaMoneyBill ,FaTrash,FaPlus, FaMinus,} from 'react-icons/fa';
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
              image_url: item.image_url,
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adresse_livraison: `${addressData.prenom} ${addressData.nom}, ${addressData.adresse}, ${addressData.code_postal} ${addressData.ville}`,
          telephone: addressData.telephone,
          methode_paiement: 'livraison'
        })
      });
      
      if (!response.ok) throw new Error(`Error: ${response.status}`);
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
      alert("Une erreur s'est produite lors de la création de votre commande. Veuillez réessayer.");
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

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <p className="text-xl text-gray-500 mb-4">Votre panier est vide</p>
              <Link href="/boutique" className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-full transition-colors">
                Retourner à la boutique
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Commande réussie!</h2>
              <p className="text-lg text-gray-600 mb-6">Votre commande numéro <span className="font-semibold">{orderNumber}</span> a été enregistrée.</p>
              <p className="text-gray-600 mb-8">Vous recevrez bientôt un e-mail de confirmation avec les détails de votre commande.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/boutique" className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-full transition-colors inline-block">
                  Continuer les achats
                </Link>
                <Link href="/mes-commandes" className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-full transition-colors inline-block">
                  Voir mes commandes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/panier" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <FaArrowLeft className="mr-2" />
            Retour au panier
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Order details form */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Informations de livraison</h2>
              
              <form onSubmit={handleSubmitOrder}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="nom">Nom</label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={addressData.nom}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="prenom">Prénom</label>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={addressData.prenom}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2" htmlFor="adresse">Adresse</label>
                    <input
                      type="text"
                      id="adresse"
                      name="adresse"
                      value={addressData.adresse}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="code_postal">Code Postal</label>
                    <input
                      type="text"
                      id="code_postal"
                      name="code_postal"
                      value={addressData.code_postal}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="ville">Ville</label>
                    <input
                      type="text"
                      id="ville"
                      name="ville"
                      value={addressData.ville}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2" htmlFor="telephone">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={addressData.telephone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Méthode de paiement</h3>
                  
                  <div className="space-y-3">
                    <div className="border border-yellow-500 bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full border border-yellow-500 mr-3 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        </div>
                        <div className="flex items-center">
                          <FaMoneyBill className="text-gray-600 mr-2" />
                          <span className="font-medium">Paiement à la livraison</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400"
                  disabled={processingOrder}
                >
                  {processingOrder ? 'Traitement en cours...' : 'Finaliser la commande'}
                </button>
              </form>
            </div>
          </div>
          
          {/* Right side - Order summary */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Résumé de la commande</h2>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Articles ({cartItems.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                {cartItems.map(item => (
  <div key={item.id} className="flex items-center text-sm">
   

    <div className="w-12 h-12 rounded bg-gray-200 flex-shrink-0 mr-3 overflow-hidden">
      {item.image_url && (
        <img src={item.image_url} alt={item.nom} quality={100} className="w-full h-full object-cover" />
      )}
    </div>
    <div className="flex-grow">
      <p className="text-gray-800">{item.nom}</p>
      <p className="text-gray-500">Quantité: {item.quantity}</p>
    </div>
    <div className="text-right">
      <p className="font-medium">{(item.prix * item.quantity).toFixed(2)} DT</p>
    </div>

    <div className="flex items-center border rounded-lg mr-4">
                            <button 
                              onClick={() => handleQuantityChange(item.id, -1)} 
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus size={12} />
                            </button>
                            <span className="px-4 text-gray-700">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.id, 1)} 
                              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                          <button 
      onClick={() => handleRemoveItem(item.id)}
      className="text-red-500 hover:text-red-700 transition-colors mr-2"
      aria-label="Supprimer l'article"
    >
      <FaTrash />
    </button>
  </div>
))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{getSubtotal()} DT</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span>{getTVA()} DT</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-600">Livraison</span>
                  <span>{getLivraisonFees() === "0.00" ? "Gratuit" : `${getLivraisonFees()} DT`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{getFinalTotal()} DT</span>
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