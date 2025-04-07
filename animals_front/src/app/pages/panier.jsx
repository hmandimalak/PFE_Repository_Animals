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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Votre Panier</h1>
            <Link href="/boutique" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <FaArrowLeft className="mr-2" />
              Continuer vos achats
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-4">Votre panier est vide</p>
              <Link href="/boutique" className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-full transition-colors">
                Découvrir nos produits
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4 sm:mb-0">
                      <img 
                        src={item.image_url || '/default-image.jpg'} 
                        alt={item.nom}
                        quality={100} 
                        className="w-20 h-20 object-cover rounded-lg mr-4"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">{item.nom}</h3>
                        <p className="text-gray-600 text-sm">{item.prix} DT </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
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
                      
                      <div className="w-20 text-right mr-4 font-medium text-gray-800">
                        {(item.prix * item.quantity).toFixed(2)} DT
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Cart Summary */}
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <p className="text-lg text-gray-800 mb-1">Total: <span className="font-bold">{getTotalPrice()} DT</span></p>
                    <p className="text-sm text-gray-500">Taxes incluses</p>
                  </div>
                  
                  <Link href="/commande" className="block w-full mt-3 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded text-center">
              passer la commande
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