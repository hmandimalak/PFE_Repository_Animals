'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTrash, FaShoppingCart, FaSearch, 
  FaDog, FaCat, FaBone, FaShower, FaPaw,
  FaChevronRight, FaHeart, FaStar, FaFilter,FaArrowRight, FaList, FaPlusCircle ,FaMapMarkerAlt,FaHome,FaPhone,FaEnvelope,FaClock,FaLink,FaFacebook,FaTwitter,FaInstagram,FaYoutube

} from 'react-icons/fa';
import Link from 'next/link';
import Navbar from './NavbarPage';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '../../app/authInterceptor';
import { useSession } from "next-auth/react";
import { Nunito } from "next/font/google";


const nunito = Nunito({ subsets: ["latin"] });


const getAuthToken = (session) => {
  if (typeof window !== "undefined") {
    const localToken = localStorage.getItem('access_token');
    if (localToken) return `Bearer ${localToken}`;
  }
  if (session?.accessToken) return `Bearer ${session.accessToken}`;
  if (session?.user?.token) return `Bearer ${session.user.token}`;
  return null;
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
    <div className="h-60 bg-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 rounded-full w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
      <div className="h-8 bg-gray-200 rounded-full w-1/3 mt-4"></div>
    </div>
  </div>
);

const CategoryIcon = ({ category }) => {
  switch (category) {
    case 'Nutrition': return <FaBone className="mr-2" />;
    case 'Accessoires': return <FaDog className="mr-2" />;
    case 'Hygiène': return <FaShower className="mr-2" />;
    default: return null;
  }
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
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);



  // Function to calculate total items in the cart
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Function to calculate total price of items in the cart
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.prix * item.quantity, 0).toFixed(2);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

// Updated cart fetching logic
useEffect(() => {
  setIsClient(true);
  fetch('http://127.0.0.1:8001/api/boutique/produits/')
    .then((response) => response.json())
    .then((productData) => {
      setProduits(productData);

  // Check if user is authenticated
  const authToken = getAuthToken(session);
  setIsAuthenticated(!!authToken);

 if (authToken) {
        authenticatedFetch('http://127.0.0.1:8001/api/boutique/panier/', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        .then(response => response.json())
        .then(cartData => {
          const formattedCart = cartData.map(cartItem => {
            const product = productData.find(p => p.id === cartItem.id);
            const effectivePrice = product?.is_discount_active
            ? parseFloat(product.prix_promotion)
            : parseFloat(product?.prix || cartItem.prix);

            return {
              ...cartItem,
              prix: effectivePrice
            };
          });
          setCartItems(formattedCart);
        })
        .catch(error => {
          console.error('Error fetching cart:', error);
          const savedCart = localStorage.getItem('cart');
          if (savedCart) setCartItems(JSON.parse(savedCart));
        });
      }
    });
}, [session]);

  useEffect(() => {
    if (isClient && cartItems.length > 0 && typeof window !== "undefined" && isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isClient, isAuthenticated]);

  useEffect(() => {
    if (isClient && wishlist.length > 0 && typeof window !== "undefined") {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isClient]);

  const fetchProduits = async () => {
    try {
      setLoading(true);
      let url = 'http://127.0.0.1:8001/api/boutique/produits/';
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

  const handleRemoveItem = async (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
    const authToken = getAuthToken(session);
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

const handleAddToCart = async (produit, e) => {
  if (e) e.stopPropagation();
  const authToken = getAuthToken(session);
  if (!authToken) {
    alert("vous devez connecter pour ajouter un produit au panier");
    return;
  }

  const effectivePrice = produit.is_discount_active
    ? parseFloat(produit.prix_promotion)
    : parseFloat(produit.prix);

  const existingItem = cartItems.find(item => item.id === produit.id);
  const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

  // Optimistically update UI
  if (existingItem) {
    setCartItems(cartItems.map(item => 
      item.id === produit.id 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  } else {
    setCartItems([...cartItems, { 
      ...produit, 
      quantity: 1,
      prix: effectivePrice
    }]);
  }

  try {
    await authenticatedFetch('http://127.0.0.1:8001/api/boutique/panier/ajouter/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produit_id: produit.id, quantity: 1 }),
    });
  } catch (error) {
    console.error('Network error:', error);
    // Revert UI on error
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === produit.id 
          ? { ...item, quantity: existingItem.quantity } 
          : item
      ));
    } else {
      setCartItems(cartItems.filter(item => item.id !== produit.id));
    }
    alert('Erreur de connexion. Veuillez vérifier votre connexion internet.');
  }
};

 

  const handleDirectCheckout = async (produit, e) => {
    if (e) e.stopPropagation();
    
    const authToken = getAuthToken(session);
    if (!authToken) {
      alert("Veuillez vous connecter pour commander des articles.");
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      return;
    }
    
    try {
      // First, add the product to cart
      await authenticatedFetch('http://127.0.0.1:8001/api/boutique/panier/ajouter/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produit_id: produit.id, quantity: 1 }),
      });
      
      // Then redirect to checkout page
      router.push('/commande');
    } catch (error) {
      console.error('Network error:', error);
      alert('Erreur de connexion. Veuillez vérifier votre connexion internet.');
    }
  };

  const viewProductDetails = (produit) => {
    // Implement later - redirect to product detail page
    console.log("View details for:", produit.id);
    // router.push(`/produit/${produit.id}`);
  };
    
  const CartIcon = () => (
    <div className="fixed right-6 top-24 z-50">
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => {
          if (isAuthenticated) {
            setCartOpen(!cartOpen);
          } else {
            alert("Veuillez vous connecter pour accéder au panier");
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
          }
        }}
        className="relative bg-primary text-white p-4 rounded-full shadow-xl hover:bg-primary/90 transition-all"
      >
        <FaShoppingCart className="w-6 h-6" />
        {isAuthenticated && cartItems.length > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-accent text-dark text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center"
          >
            {getTotalItems()}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
const handleQuantityChange = async (productId, change) => {
  const authToken = getAuthToken(session);
  if (!authToken) return;

  try {
    // Créer une copie temporaire pour l'UI optimiste
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
    await authenticatedFetch(
      `http://127.0.0.1:8001/api/boutique/panier/update/${productId}/`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: tempCart.find(i => i.id === productId).quantity }),
      }
    );

    // Recharger le panier depuis le serveur
    const cartResponse = await authenticatedFetch('http://127.0.0.1:8001/api/boutique/panier/');
    const cartData = await cartResponse.json();
    
    // Mettre à jour avec les données fraîches
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
  const MiniCart = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-6 top-36 bg-white rounded-2xl p-6 w-96 z-10 shadow-2xl border border-accent/20"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-primary">Votre Panier</h3>
        <span className="text-sm text-dark/60">{getTotalItems()} articles</span>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center py-10">
          <div className="text-6xl text-dark/30 mb-6">🛒</div>
          <p className="text-dark/60 text-lg">Votre panier est vide</p>
          <button 
            onClick={() => setCartOpen(false)}
            className="mt-6 text-accent hover:text-primary transition-colors"
          >
            Continuer les achats
          </button>
        </div>
      ) : (
        <>
          <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {cartItems.map(item => (
              <motion.div 
                key={item.id} 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-between items-center py-4 border-b border-accent/20"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary/50">

                  <img
                  src={item.image.startsWith('http') 
                    ? item.image 
                    :`http://127.0.0.1:8001/${item.image}`}
                  alt={item.nom}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                />

                  </div>
                  <div>
                    <p className="font-medium text-dark">{item.nom}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex border border-accent/30 rounded-lg overflow-hidden">
                       <button 
  className="px-2 py-1 bg-secondary/30 text-dark/70 hover:bg-secondary"
  onClick={(e) => {
    e.stopPropagation();
    if (item.quantity > 1) {
      handleQuantityChange(item.id, -1);
    }
  }}
>-</button>

<span className="px-3 py-1">{item.quantity}</span>

<button 
  className="px-2 py-1 bg-secondary/30 text-dark/70 hover:bg-secondary"
  onClick={(e) => {
    e.stopPropagation();
    handleQuantityChange(item.id, 1);
  }}
>+</button>
                      </div>
                      <p className="text-sm font-semibold text-primary">{(item.prix * item.quantity).toFixed(2)}DT</p>
                    </div>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2"
                >
                  <FaTrash className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
          <div className="pt-6 mt-2 border-t border-accent/20">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-dark">Total:</span>
              <span className="text-2xl font-bold text-primary">{getTotalPrice()}DT</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCartOpen(false)}
                className="py-3 px-4 rounded-xl border-2 border-accent text-dark hover:bg-accent/10 transition-colors text-center font-medium"
              >
                Continuer
              </button>
              <Link 
                href="/panier" 
                className="block py-3 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-center font-medium"
              >
                Commander
              </Link>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );

  const CategoryFilter = () => {
    const categories = [
      { id: '', name: 'Tous', icon: null },
      { id: 'Nutrition', name: 'Nutrition', icon: <FaBone /> },
      { id: 'Accessoires', name: 'Accessoires', icon: <FaDog /> },
      { id: 'Hygiène', name: 'Hygiène', icon: <FaShower /> }
    ];

    return (
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        {categories.map(category => (
          <motion.button
            key={category.id}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterCategory(category.id)}
            className={`px-6 py-3 rounded-full flex items-center gap-2 font-medium transition-colors ${
              filterCategory === category.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white text-dark hover:bg-secondary/50 border border-accent/30'
            }`}
          >
            {category.icon && <span>{category.icon}</span>}
            {category.name}
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    
     <div className={`min-h-screen bg-gradient-to-b from-secondary via-secondary/30 to-white ${nunito.className}`}>
                 <div className="sticky top-0 w-full z-50 bg-white shadow-md">
                     <Navbar />
                     <CartIcon />

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
      {isAuthenticated && cartOpen && <MiniCart />}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 space-y-4"
        >
          <h1 className="text-5xl font-extrabold text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-dark">
            Notre Boutique
          </h1>
          <p className="text-dark/80 text-xl">Trouvez le meilleur pour votre compagnon</p>
          <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
        </motion.div>

        {/* Search Bar & Filter Toggle Button (Mobile) */}
        <div className="md:hidden mb-6">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary"
            />
            <FaSearch className="absolute left-3 top-3.5 text-dark/50" />
          </div>
          <button
            onClick={toggleFilters}
            className="w-full bg-white text-dark border border-accent/30 rounded-xl py-3 px-4 flex items-center justify-center gap-2"
          >
            <FaFilter />
            Filtres et tri
            <FaChevronRight className={`ml-1 transition-transform duration-300 ${showFilters ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Mobile Filters (Expandable) */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: showFilters ? 'auto' : 0,
            opacity: showFilters ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden mb-6"
        >
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-accent/20 space-y-4">
            <div>
              <label className="block text-dark font-medium mb-2">Catégorie</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary"
              >
                <option value="">Toutes catégories</option>
                <option value="Nutrition">🍖 Nutrition</option>
                <option value="Accessoires">🐾 Accessoires</option>
                <option value="Hygiène">🚿 Hygiène</option>
              </select>
            </div>

            <div>
              <label className="block text-dark font-medium mb-2">Tri</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary"
              >
                <option value="">Trier par</option>
                <option value="prix">Prix ↑</option>
                <option value="-prix">Prix ↓</option>
                <option value="-date_ajout">Plus récent</option>
                <option value="date_ajout">Plus ancien</option>
              </select>
            </div>

            <button 
              onClick={() => {
                fetchProduits();
                setShowFilters(false);
              }}
              className="w-full bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <FaSearch /> Appliquer les filtres
            </button>
          </div>
        </motion.div>

        {/* Desktop Search Section */}
        <div className="hidden md:block mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-accent/20">
            <div className="grid grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/70 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary"
                />
                <FaSearch className="absolute left-4 top-4 text-dark/50 w-5 h-5" />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-4 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary"
              >
                <option value="">Trier par</option>
                <option value="prix">Prix ↑</option>
                <option value="-prix">Prix ↓</option>
                <option value="-date_ajout">Plus récent</option>
                <option value="date_ajout">Plus ancien</option>
              </select>

              <button 
                onClick={fetchProduits}
                className="bg-primary text-white px-6 py-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <FaSearch /> Rechercher
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <CategoryFilter />

        {/* Products Grid with Masonry Layout */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <>
            {produits.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-dark mb-2">Aucun produit trouvé</h3>
                <p className="text-dark/60">Essayez d'autres critères de recherche</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('');
                    setSortBy('');
                    fetchProduits();
                  }}
                  className="mt-6 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {produits.map((produit, index) => (
                  <motion.div 
                    key={produit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => viewProductDetails(produit)}
                    className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
                  >
                    <div className="relative h-60">
                    <img
                  src={produit.image.startsWith('http') 
                    ? produit.image 
                    : `http://127.0.0.1:8001/media/${produit.image}`}
                  alt={produit.nom}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                />
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <CategoryIcon category={produit.categorie} />
                        {produit.categorie}
                      </div>
                       {/* Discount Badge */}
        {produit.is_discount_active && (
  <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
    -{produit.discount_percent}%
  </div>
)}
                      
                      
                    
                      
                      {/* Quick action buttons that appear on hover */}
                      <div className="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDirectCheckout(produit)}
                          className="bg-white text-primary p-3 rounded-full shadow-lg hover:bg-accent/20 transition-colors"
                        >
                          <FaShoppingCart className="w-5 h-5" />
                        </motion.button>
                       
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      {/* Product Name */}
                      <h3 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">{produit.nom}</h3>
                      
                      {/* Product Description */}
                      <p className="text-dark/60 text-sm line-clamp-2">
                        {produit.description || 'Aucune description disponible pour ce produit. Contactez-nous pour plus d\'informations.'}
                      </p>
                                      {produit.is_discount_active && (
  <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
    -{produit.discount_percent}%
  </div>
)}
     
                      
                      <div className="flex justify-between items-center mt-4">
{produit.is_discount_active ? (
  <div className="flex flex-col">
    <span className="text-xl font-bold text-primary">
      {parseFloat(produit.prix_promotion).toFixed(2)} DT
    </span>
    <span className="text-sm text-dark/60 line-through">
      {parseFloat(produit.prix).toFixed(2)} DT
    </span>
  </div>
) : (
  <span className="text-xl font-bold text-primary">
    {parseFloat(produit.prix).toFixed(2)} DT
  </span>
)}

                        <button
                          onClick={(e) => handleAddToCart(produit, e)}
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 group"
                        >
                          <FaShoppingCart className="w-4 h-4 group-hover:animate-bounce" />
                          <span className="hidden sm:inline">Ajouter</span>
                        </button>
                      </div>
                     </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
        {/* Features Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-accent/20 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-secondary/70 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">Livraison Rapide</h3>
            <p className="text-dark/60">Livraison en 24-48h partout en Tunisie pour que votre animal ait tout ce qu'il lui faut, rapidement.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-md border border-accent/20 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-secondary/70 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">Produits de Qualité</h3>
            <p className="text-dark/60">Tous nos produits sont sélectionnés avec soin pour garantir le bien-être et la santé de votre animal.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-md border border-accent/20 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-secondary/70 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-3">Support Client</h3>
            <p className="text-dark/60">Notre équipe est disponible 7j/7 pour vous conseiller et répondre à toutes vos questions.</p>
          </div>
        </div>
      </div>
      
      

      {/* Fixed "Back to top" button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed right-6 bottom-6 bg-primary text-white p-3 rounded-full shadow-xl hover:bg-primary/90 transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
      </button>
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

export default Boutique;