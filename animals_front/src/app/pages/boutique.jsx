import { useState, useEffect } from 'react';
import { FaShoppingCart, FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import Link from 'next/link';
import Navbar from './NavbarPage';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '../../app/authInterceptor';
import { useSession } from "next-auth/react";

const getAuthToken = (session) => {
  const localToken = localStorage.getItem('access_token');
  if (localToken) return `Bearer ${localToken}`;
  if (session?.accessToken) return `Bearer ${session.accessToken}`;
  if (session?.user?.token) return `Bearer ${session.user.token}`;
  return null;
};

const Boutique = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  // Function to calculate total items in the cart
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Function to calculate total price of items in the cart
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.prix * item.quantity, 0).toFixed(2);
  };

  useEffect(() => {
    setIsClient(true);
    fetch('http://127.0.0.1:8000/api/boutique/produits/')
      .then((response) => response.json())
      .then((data) => {
        setProduits(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching produits:', error);
        setLoading(false);
      });

    const authToken = getAuthToken(session);
    if (authToken) {
      authenticatedFetch('http://127.0.0.1:8000/api/boutique/panier/')
        .then(response => response.json())
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
        });
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart && session) setCartItems(JSON.parse(savedCart));
    }
  }, [session]);

  useEffect(() => {
    if (isClient && cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isClient]);

  const fetchProduits = async () => {
    try {
      setLoading(true);
      let url = 'http://127.0.0.1:8000/api/boutique/produits/';
      const params = new URLSearchParams();
      if (filterCategory) params.append('categorie', filterCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy) params.append('ordering', sortBy);
      if (params.toString()) url += `?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setProduits(data);
    } catch (error) {
      console.error('Error fetching produits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, [filterCategory, searchTerm, sortBy]);

  const handleAddToCart = async (produit) => {
    const authToken = getAuthToken(session);
    if (!authToken) {
      alert("Veuillez vous connecter pour ajouter des articles au panier.");
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push('/login');
      return;
    }
    const existingItem = cartItems.find(item => item.id === produit.id);
    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
    if (existingItem) {
      setCartItems(cartItems.map(item => item.id === produit.id ? { ...item, quantity: newQuantity } : item));
    } else {
      setCartItems([...cartItems, { ...produit, quantity: 1 }]);
    }
    try {
      await authenticatedFetch('http://127.0.0.1:8000/api/boutique/panier/ajouter/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produit_id: produit.id, quantity: 1 }),
      });
    } catch (error) {
      console.error('Network error:', error);
      alert('Erreur de connexion. Veuillez vérifier votre connexion internet.');
    }
  };

  const MiniCart = () => (
    <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg p-4 w-64 z-10 transition-all duration-300 transform origin-top">
      <h3 className="font-bold mb-2">Votre Panier</h3>
      {cartItems.length === 0 ? (
        <p className="text-gray-500">Votre panier est vide</p>
      ) : (
        <>
          <div className="max-h-48 overflow-y-auto">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.nom}</span>
                  <span className="text-xs text-gray-500">{item.quantity} x {item.prix}D</span>
                </div>
                <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-500 text-xs">
                  Supprimer
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{getTotalPrice()}D</span>
            </div>
            <Link href="/panier" className="block w-full mt-3 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded text-center">
              Voir le panier
            </Link>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 py-16 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenue dans Notre Petite Boutique</h1>
        <p className="text-lg">Découvrez des produits uniques et de qualité pour vous et vos proches.</p>
      </div>

      {/* Unified Search and Filter Bar */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-wrap gap-4 items-center">
          <div className="flex items-center flex-1">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit..."
              className="p-2 border rounded-l flex-1"
            />
            <button onClick={() => setSearchTerm('')} className="bg-gray-200 px-4 rounded-r border-t border-r border-b">
              ✕
            </button>
          </div>
          <div className="flex items-center">
            <FaFilter className="text-gray-500 mr-2" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Toutes les catégories</option>
              <option value="Nutrition">Nutrition</option>
              <option value="Accessoires">Accessoires</option>
              <option value="Hygiène">Hygiène</option>
            </select>
          </div>
          <div className="flex items-center">
            <FaSortAmountDown className="text-gray-500 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Trier par</option>
              <option value="prix">Prix croissant</option>
              <option value="-prix">Prix décroissant</option>
              <option value="-date_ajout">Récemment ajoutés</option>
              <option value="date_ajout">Anciennement ajoutés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cart Button */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative">
          <button
            className="flex items-center bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg"
            onClick={() => setCartOpen(!cartOpen)}
          >
            <FaShoppingCart className="text-xl" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
          {cartOpen && <MiniCart />}
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 mt-8">
  <h1 className="text-2xl font-bold mb-4">Nos Produits</h1>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {loading ? (
      <p>Chargement...</p>
    ) : (
      produits.map((produit) => (
        <div
          key={produit.id}
          className="bg-white shadow-md rounded-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
            <img
              src={produit.image_url}
              alt={produit.nom}
              className="h-48 w-full object-cover object-center"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
              }}
            />
          </div>

          {/* Product Details */}
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold">{produit.nom}</h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {produit.categorie}
              </span>
            </div>

            {/* Product Description */}
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {produit.description || 'Aucune description disponible'}
            </p>

            {/* Price and Add to Cart Button */}
            <div className="mt-4 flex justify-between items-center">
              <p className="font-bold text-lg">{parseFloat(produit.prix).toFixed(2)} D</p>
              <button
                onClick={() => handleAddToCart(produit)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full"
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>
    </div>
  );
};

export default Boutique;