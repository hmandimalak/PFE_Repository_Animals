import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCreditCard, FaMoneyBill, FaCheck, FaLock, FaTimes } from 'react-icons/fa';
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
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  
  const [addressData, setAddressData] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    code_postal: '',
    ville: '',
    telephone: ''
  });
  
  const [paymentData, setPaymentData] = useState({
    card_number: '',
    card_holder: '',
    expiry_date: '',
    cvv: ''
  });
  
  const router = useRouter();
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

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'card_number') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      
      setPaymentData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } 
    // Format expiry date as MM/YY
    else if (name === 'expiry_date') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 4);
      let formattedValue = cleanValue;
      
      if (cleanValue.length > 2) {
        formattedValue = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
      }
      
      setPaymentData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
    // Format CVV to only allow 3-4 digits
    else if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '').slice(0, 4);
      
      setPaymentData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
    else {
      setPaymentData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
    
    if (!paymentMethod) {
      alert("Veuillez sélectionner une méthode de paiement");
      return;
    }
    
    if (!addressData.nom || !addressData.prenom || !addressData.adresse || !addressData.code_postal || !addressData.ville || !addressData.telephone) {
      alert("Veuillez remplir toutes les informations de livraison");
      return;
    }
    
    const authToken = getAuthToken();
    if (!authToken) {
      alert("Vous devez être connecté pour passer une commande.");
      localStorage.setItem('redirectAfterLogin', '/commande');
      router.push('/login');
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
          methode_paiement: paymentMethod
        })
      });
      
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      
      // Clear cart
      localStorage.removeItem('cart');
      setCartItems([]);
      
      // Store order number
      setOrderNumber(data.numero_commande);
      
      // Check payment method
      if (paymentMethod === 'en_ligne') {
        // Show payment modal
        setShowPaymentModal(true);
        setProcessingOrder(false);
      } else {
        // If pay on delivery, go directly to confirmation
        router.push(`/confirmation/${data.numero_commande}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert("Une erreur s'est produite lors de la création de votre commande. Veuillez réessayer.");
      setProcessingOrder(false);
    }
  };
  
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setPaymentError(null);
    setProcessingOrder(true);
    
    // Basic validation
    if (!paymentData.card_number || !paymentData.card_holder || !paymentData.expiry_date || !paymentData.cvv) {
      setPaymentError("Veuillez remplir tous les champs de paiement");
      setProcessingOrder(false);
      return;
    }
    
    try {
      const response = await authenticatedFetch(`http://127.0.0.1:8000/api/boutique/paiement/${orderNumber}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_number: paymentData.card_number.replace(/\s/g, ''),
          card_holder: paymentData.card_holder,
          expiry_date: paymentData.expiry_date,
          cvv: paymentData.cvv
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de paiement');
      }
      
      // Close modal and redirect to confirmation page
      setShowPaymentModal(false);
      router.push(`/confirmation/${orderNumber}`);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || "Une erreur s'est produite lors du traitement du paiement");
      setProcessingOrder(false);
    }
  };

  const closePaymentModal = () => {
    if (!processingOrder) {
      setShowPaymentModal(false);
      setPaymentError(null);
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

  if (cartItems.length === 0 && !showPaymentModal) {
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
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'en_ligne' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:bg-gray-50'}`}
                      onClick={() => setPaymentMethod('en_ligne')}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === 'en_ligne' ? 'border-yellow-500' : 'border-gray-400'}`}>
                          {paymentMethod === 'en_ligne' && <div className="w-3 h-3 rounded-full bg-yellow-500"></div>}
                        </div>
                        <div className="flex items-center">
                          <FaCreditCard className="text-gray-600 mr-2" />
                          <span className="font-medium">Paiement par carte bancaire</span>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'livraison' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:bg-gray-50'}`}
                      onClick={() => setPaymentMethod('livraison')}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === 'livraison' ? 'border-yellow-500' : 'border-gray-400'}`}>
                          {paymentMethod === 'livraison' && <div className="w-3 h-3 rounded-full bg-yellow-500"></div>}
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
                          <img src={item.image_url} alt={item.nom} quality={100}  className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-gray-800">{item.nom}</p>
                        <p className="text-gray-500">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(item.prix * item.quantity).toFixed(2)} D</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Sous-total</span>
                  <span>{getSubtotal()} D</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span>{getTVA()} D</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-600">Livraison</span>
                  <span>{getLivraisonFees() === "0.00" ? "Gratuit" : `${getLivraisonFees()} D`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{getFinalTotal()} D</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 relative">
            {/* Close button */}
            <button 
              onClick={closePaymentModal} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={processingOrder}
            >
              <FaTimes size={20} />
            </button>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <FaLock className="text-green-500 mr-2" />
                <h2 className="text-xl font-bold text-center">Paiement sécurisé</h2>
              </div>
              
              {paymentError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p>{paymentError}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmitPayment}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="card_number">Numéro de carte</label>
                  <input
                    type="text"
                    id="card_number"
                    name="card_number"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.card_number}
                    onChange={handlePaymentInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="card_holder">Titulaire de la carte</label>
                  <input
                    type="text"
                    id="card_holder"
                    name="card_holder"
                    placeholder="Jean Dupont"
                    value={paymentData.card_holder}
                    onChange={handlePaymentInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="expiry_date">Date d'expiration</label>
                    <input
                      type="text"
                      id="expiry_date"
                      name="expiry_date"
                      placeholder="MM/YY"
                      value={paymentData.expiry_date}
                      onChange={handlePaymentInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2" htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={handlePaymentInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between font-bold">
                    <span>Montant total</span>
                    <span>{getFinalTotal()} D</span>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-400"
                  disabled={processingOrder}
                >
                  {processingOrder ? 'Traitement...' : 'Payer maintenant'}
                  {!processingOrder && <FaLock className="ml-2" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commande;