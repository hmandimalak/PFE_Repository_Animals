import { useState, useEffect } from 'react';
import { FaTrash, FaArrowLeft, FaShoppingCart,FaMinus,FaPlus, } from 'react-icons/fa';
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

  useEffect(() => {
    setIsClient(true);
    setLoading(true);

    const authToken = getAuthToken();
    if (authToken) {
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
        await authenticatedFetch(`http://127.0.0.1:8000/api/boutique/panier/supprimer/${productId}/`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
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

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.prix * item.quantity), 0).toFixed(2);
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
                    :`http://127.0.0.1:8000/${item.image}`}
                  alt={item.nom}
                  className="w-24 h-24 object-cover rounded-lg mr-6"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                />
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-dark">{item.nom}</h3>
                        <p className="text-primary font-medium">{item.prix} DT</p>
                      </div>
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
              <div className="mt-12 pt-8 border-t border-accent/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-dark">
                      Total: <span className="text-primary">{getTotalPrice()} DT</span>
                    </p>
                    <p className="text-dark/60">Frais de livraison calculés à la prochaine étape</p>
                  </div>
                  
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
    </div>
  );
};

export default Panier;