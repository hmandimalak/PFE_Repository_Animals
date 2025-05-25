'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './NavbarPage';
import { 
  FaPaw, FaSearch, FaArrowRight, FaHeart, 
  FaCalendar, FaUser, FaComments, 
  FaHashtag, FaAngleLeft, FaAngleRight,FaMapMarkerAlt,FaHome,FaPhone,FaEnvelope,FaClock,FaLink,FaFacebook,FaTwitter,FaInstagram,FaYoutube

} from 'react-icons/fa';

// Main Blog Page Component
const BlogPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectionType, setSelectedSectionType] = useState('all');
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);
  const sectionTypes = [
    { id: 'all', name: 'All' },
    { id: 'garde', name: 'Garde' },
    { id: 'evenement', name: 'Événements' },
    { id: 'conseil', name: 'Conseils' },
    { id: 'story', name: 'Stories' }
  ];
  
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const sectionsResponse = await fetch('http://127.0.0.1:8001/api/blog-content/');
        
        if (!sectionsResponse.ok) throw new Error('Failed to fetch blog sections');
        
        const sectionsData = await sectionsResponse.json();
        
        // Only use active sections
        const activeSections = sectionsData.filter(section => section.is_active);
        setSections(activeSections);
        
        const postsResponse = await fetch('http://127.0.0.1:8001/api/blog-posts/');
        if (!postsResponse.ok) throw new Error('Failed to fetch blog posts');
        const postsData = await postsResponse.json();
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
  
  // Calculate pagination values outside the useEffect
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // Handle page change function
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Filter sections based on search term and section type
  const filteredSections = sections.filter(section => {
    // Match by title search
    const matchesSearch = searchTerm === '' || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase());
  
    // Match by section type
    const matchesType = selectedSectionType === 'all' || 
      section.section_type === selectedSectionType;
  
    return matchesSearch && matchesType;
  });
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled through the state
  };
  
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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-secondary/30 to-white">
      <div className="sticky top-0 w-full z-50 bg-white shadow-md">
              <Navbar />
            </div>
      {/* Main Content */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 right-10 opacity-10 animate-bounce">
          <FaPaw className="w-24 h-24 text-dark" />
        </div>

        <div className="absolute bottom-40 left-18 opacity-10 animate-pulse">
          <FaPaw className="w-32 h-32 text-dark" />
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
                  placeholder="Rechercher une thématique..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-3 focus:outline-none"
                />
                <button type="submit" className="bg-primary text-white px-6 flex items-center justify-center hover:bg-accent transition-colors">
                  <FaSearch />
                </button>
              </form>
            </div>
            
            {/* Section Type Filters */}
            <div className="flex flex-wrap justify-center mt-6 gap-2">
              {sectionTypes.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSectionType(section.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedSectionType === section.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-dark hover:bg-gray-200'
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Content Sections */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-dark mb-6 border-l-4 border-primary pl-4">
              Thématiques <FaHeart className="inline ml-2 text-accent" />
            </h2>
            
            {filteredSections.length === 0 ? (
              <div className="text-center py-10">
                <FaSearch className="mx-auto text-4xl text-primary/30 mb-4" />
                <p className="text-dark/70">Aucune section trouvée pour votre recherche.</p>
                <button 
                  onClick={() => {setSearchTerm(''); setSelectedSectionType('all');}}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-accent transition-colors"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredSections.map((section) => (
                  <SectionCard key={section.id} section={section} />
                ))}
              </div>
            )}
          </div>
          {/* Latest Articles */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-dark mb-6 border-l-4 border-primary pl-4">
              Derniers Articles
            </h2>
            
            {posts.length === 0 ? (
              <div className="text-center py-10">
                <FaSearch className="mx-auto text-4xl text-primary/30 mb-4" />
                <p className="text-dark/70">Aucun article trouvé.</p>
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