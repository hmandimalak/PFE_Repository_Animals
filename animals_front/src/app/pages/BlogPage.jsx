'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaPaw, FaSearch, FaArrowRight, FaHeart, 
  FaEnvelope, FaCalendar, FaUser, FaComments, 
  FaHashtag, FaAngleRight, FaAngleLeft
} from 'react-icons/fa';

// Main Blog Page Component
const BlogPage = () => {
  const [sections, setSections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        // Fetch both blog sections and posts in parallel
        const [sectionsResponse, postsResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/blog-content/'),
          fetch('http://127.0.0.1:8000/api/blog-posts/')
        ]);
        
        if (!sectionsResponse.ok) throw new Error('Failed to fetch blog sections');
        if (!postsResponse.ok) throw new Error('Failed to fetch blog posts');
        
        const sectionsData = await sectionsResponse.json();
        const postsData = await postsResponse.json();
        
        // Only use active sections
        const activeSections = sectionsData.filter(section => section.is_active);
        
        setSections(activeSections);
        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching blog data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogData();
  }, []);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  
  // Filtered posts based on search and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || 
      (post.tags && post.tags.includes(activeCategory));
    
    return matchesSearch && matchesCategory;
  });
  
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled through the filteredPosts
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-secondary/30 to-white flex justify-center items-center">
      <div className="animate-spin h-16 w-16 border-4 border-primary rounded-full border-t-transparent"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-secondary/30 to-white flex justify-center items-center">
      <div className="text-red-500 p-5 text-center bg-white rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-2">Oops!</h2>
        <p>Error: {error}</p>
      </div>
    </div>
  );
  
  // Define categories for filter
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'adoption', name: 'Adoption' },
    { id: 'garde', name: 'Garde' },
    { id: 'conseil', name: 'Conseils' },
    { id: 'evenement', name: 'Événements' }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-secondary/30 to-white">
      {/* Main Content */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 right-10 opacity-10 animate-bounce">
          <FaPaw className="w-24 h-24 text-dark" />
        </div>

        <div className="absolute bottom-40 left-18 opacity-10 animate-pulse">
          <FaPaw className="w-32 h-32 text-dark" />
        </div>
        
        <div className="absolute top-1/3 left-20 transform -translate-y-1/2">
          <FaPaw className="w-16 h-16 text-primary animate-pulse" />
        </div>
        
        <div className="absolute top-1/2 right-20 transform -translate-y-1/2">
          <FaPaw className="w-16 h-16 text-dark animate-pulse" />
        </div>
  
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Blog Header */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-10">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-dark mb-2">Notre Blog</h1>
              <p className="text-lg text-dark/70">Découvrez les dernières actualités, conseils et histoires</p>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="flex shadow-md rounded-full overflow-hidden">
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-3 focus:outline-none"
                />
                <button type="submit" className="bg-primary text-white px-6 flex items-center justify-center hover:bg-accent transition-colors">
                  <FaSearch />
                </button>
              </form>
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center mt-6 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    activeCategory === category.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-dark hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Featured Content Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-dark mb-6 border-l-4 border-primary pl-4">
              Thématiques à la Une <FaHeart className="inline ml-2 text-accent" />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          </div>
          
          {/* Latest Articles */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-dark mb-6 border-l-4 border-primary pl-4">
              Derniers Articles
            </h2>
            
            {filteredPosts.length === 0 ? (
              <div className="text-center py-10">
                <FaSearch className="mx-auto text-4xl text-primary/30 mb-4" />
                <p className="text-dark/70">Aucun article trouvé pour votre recherche.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setActiveCategory('all');}}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-accent transition-colors"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-10">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          currentPage === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-primary text-white hover:bg-accent'
                        }`}
                      >
                        <FaAngleLeft />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`w-10 h-10 flex items-center justify-center rounded-full ${
                            currentPage === number
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-dark hover:bg-gray-200'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-accent'
                        }`}
                      >
                        <FaAngleRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Newsletter Section */}
          <div className="bg-gradient-to-r from-primary to-accent rounded-3xl shadow-2xl p-8 text-white mb-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h3 className="text-2xl font-bold mb-2">Restez informés</h3>
                <p>Inscrivez-vous à notre newsletter pour recevoir les dernières nouvelles et conseils pour vos animaux de compagnie</p>
              </div>
              <div className="w-full md:w-auto">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Votre email"
                    className="px-4 py-3 rounded-l-full w-full md:w-64 focus:outline-none text-dark"
                  />
                  <button className="bg-dark hover:bg-dark/80 text-white px-6 py-3 rounded-r-full transition-colors">
                    S'abonner
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

// Component for a single blog content section
const SectionCard = ({ section }) => {
  // Map section types to icon classes/styles
  const sectionStyles = {
    garde: { bgColor: 'bg-blue-100', icon: <FaPaw className="text-blue-500" /> },
    evenement: { bgColor: 'bg-green-100', icon: <FaCalendar className="text-green-500" /> },
    conseil: { bgColor: 'bg-yellow-100', icon: <FaHeart className="text-yellow-600" /> },
    story: { bgColor: 'bg-purple-100', icon: <FaComments className="text-purple-500" /> }
  };
  
  const style = sectionStyles[section.section_type] || { bgColor: 'bg-gray-100', icon: <FaHashtag className="text-gray-500" /> };
  
  return (
    <div className={`${style.bgColor} rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 border-2 border-white`}>
      {section.image && (
        <div className="h-48 relative">
          <img 
            src={section.image} 
            alt={section.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="text-2xl mb-2">{style.icon}</div>
        <h3 className="text-xl font-bold mb-2">{section.title}</h3>
        <p className="text-gray-700 text-sm">{section.content.description}</p>
        <button className="mt-4 flex items-center text-primary hover:text-accent transition-colors">
          Découvrir <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

// Component for a single blog post
const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 border-2 border-primary/10">
      <Link href={`/blog/${post.slug}`}>
        <div className="cursor-pointer">
          <div className="h-48 relative">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-lg text-sm font-bold">
              {new Date(post.created_at).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})}
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold mb-2 text-dark hover:text-primary transition-colors">{post.title}</h3>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <FaUser className="mr-1 text-primary" />
              <span>{post.author.first_name} {post.author.last_name}</span>
            </div>
            <p className="text-dark/70 text-sm line-clamp-3">{post.excerpt}</p>
            <div className="mt-4 flex items-center text-primary font-medium hover:text-accent transition-colors">
              Lire la suite <FaArrowRight className="ml-2" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BlogPage;