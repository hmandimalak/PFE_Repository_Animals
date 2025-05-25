'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const BlogPostDetail = () => {
  const params = useParams();
  const { slug } = params;
  
  const [post, setPost] = useState(null);
  const [relatedSections, setRelatedSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch post by slug
        const postResponse = await fetch(`http://127.0.0.1:8001/api/blog-posts/${slug}/`);
        
        if (!postResponse.ok) {
          throw new Error('Post not found');
        }
        
        const postData = await postResponse.json();
        setPost(postData);
        
        // Fetch related sections based on post content
        // This is where you would determine which sections might be related to this post
        // For example, if the post mentions "garde" services, you'd fetch garde sections
        const sectionsResponse = await fetch('http://127.0.0.1:8001/api/blog-content/?is_active=true');
        
        if (sectionsResponse.ok) {
          const sectionsData = await sectionsResponse.json();
          
          // Find relevant sections - here's a simple approach matching keywords
          // You could make this more sophisticated based on your needs
          const keywords = postData.content.toLowerCase();
          const matchingSections = sectionsData.filter(section => {
            const sectionType = section.section_type.toLowerCase();
            return keywords.includes(sectionType) || 
                  (section.content.description && 
                   keywords.includes(section.content.description.toLowerCase().substring(0, 20)));
          });
          
          // Limit to 3 related sections
          setRelatedSections(matchingSections.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchData();
    }
  }, [slug]);
  
  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
  
  if (error) return <div className="text-red-500 p-5 text-center">Error: {error}</div>;
  
  if (!post) return <div className="text-center p-10">Post not found</div>;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back button */}
      <Link href="/blog">
        <div className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blog
        </div>
      </Link>
      
      {/* Featured image */}
      <div className="mb-8 rounded-lg overflow-hidden h-80 relative">
        <img 
          src={`http://127.0.0.1:8001${post.featured_image}`} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Post metadata */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center text-gray-600">
          <div className="mr-4">
            By {post.author.first_name} {post.author.last_name}
          </div>
          <div>
            {new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
      
      {/* Post content */}
      <div className="prose max-w-none">
        {/* You may want to use a rich text renderer here depending on how your content is stored */}
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      
      {/* Related sections */}
      {relatedSections.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-6">Related Content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedSections.map((section) => (
              <div key={section.id} className="bg-gray-50 p-5 rounded-lg shadow-sm">
                <h3 className="font-bold mb-2">{section.title}</h3>
                <p className="text-gray-700 text-sm">{section.content.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostDetail;