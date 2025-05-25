"use client";
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Navbar from "./NavbarPage";
import { useState } from 'react';
import ContactForm from './Contactform';
import { FaPaw, FaDog, FaCat, FaHeart,FaQuestionCircle,FaShippingFast,FaMapMarkerAlt,FaHome,FaPhone,FaEnvelope,FaClock,FaLink,FaFacebook,FaTwitter,FaInstagram,FaYoutube
} from "react-icons/fa";
import { Nunito } from "next/font/google";
import Link from "next/link";

const nunito = Nunito({ subsets: ["latin"] });
const FAQPage = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const faqCategories = [
    {
      title: "Adoption Gratuite",
      icon: FaPaw,
      questions: [
        {
          question: "Comment fonctionne l'adoption gratuite ?",
          answer: "Notre modèle unique est financé par la boutique. Vous payez seulement les frais vétérinaires de base (vaccins). L'adoption elle-même est totalement gratuite !"
        },
        {
          question: "Puis-je adopter si je vis en appartement ?",
          answer: "Oui ! Nous sélectionnons des animaux adaptés à chaque mode de vie. Nos conseillers vous aideront à trouver le compagnon idéal pour votre logement."
        }
      ]
    },
    {
      title: "Soins en Refuge",
      icon: FaHeart,
      questions: [
        {
          question: "Comment sont soignés les animaux dans le refuge ?",
          answer: "Nos protocoles incluent :\n- Bilan santé complet à l'arrivée\n- Vermifuge/parasitage systématique\n- Alimentation premium adaptée\n- Enrichissement environnemental quotidien"
        },
        {
          question: "Puis-je venir rendre visite à un animal spécifique ?",
          answer: "Absolument ! Contactez-nous pour prendre rendez-vous. Nous encourageons les rencontres multiples avant l'adoption."
        }
      ]
    },
    {
      title: "Boutique Solidaire",
      icon: FaShippingFast,
      questions: [
        {
          question: "Où va l'argent des achats ?",
          answer: "100% des bénéfices sont répartis ainsi :\n- 70% nourriture et soins animaux\n- 20% amélioration des refuges\n- 10% campagnes de stérilisation",
          link: {
            text: "Voir notre rapport financier",
            url: "/transparence"
          }
        },
        {
          question: "Livrez-vous dans toute la Tunisie ?",
          answer: "Oui ! Nous livrons partout en Tunisie continentale sous 3-5 jours ouvrables. Les frais de port sont fixes à 7 TND quel que soit le poids."
        }
      ]
    },
    {
      title: "Événements & Activités",
      icon: FaPaw,
      questions: [
        {
          question: "Les enfants peuvent-ils participer aux marches canines ?",
          answer: "À partir de 6 ans, sous supervision parentale. Nous fournissons des harnais adaptés et organisons des ateliers éducatifs."
        }
      ]
    },
    {
      title: "Dons & Bénévolat",
      icon: FaHeart,
      questions: [
        {
          question: "Comment aider sans adopter ?",
          answer: "Plusieurs options :\n- Parrainage d'un animal\n- Don de matériel\n- Bénévolat ponctuel\n- Achat en boutique"
        }
      ]
    },
    {
      title: "Support Émotionnel",
      icon: FaHeart,
      questions: [
        {
          question: "Proposez-vous un suivi post-adoption ?",
          answer: "Oui, notre équipe reste disponible 24h/24 via notre hotline dédiée pendant les 3 premiers mois."
        }
      ]
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-b from-secondary via-secondary/30 to-white ${nunito.className}`}>
                 <div className="sticky top-0 w-full z-50 bg-white shadow-md">
                     <Navbar />

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
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-pastel-blue mb-8 flex items-center justify-center">
          <FaQuestionCircle className="mr-3 text-pastel-green"/> 
          Foire Aux Questions
        </h2>

        <div className="space-y-8">
          {faqCategories.map((category) => (
            <div key={category.title} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <category.icon className="text-2xl mr-3 text-pastel-green" />
                <h3 className="text-xl font-bold text-pastel-blue">{category.title}</h3>
              </div>
              
              <div className="space-y-4">
                {category.questions.map((q, idx) => (
                  <Disclosure key={idx}>
                    {({ open }) => (
                      <div className="border-b border-gray-100 last:border-0">
                        <Disclosure.Button className="flex justify-between items-center w-full py-4 text-left">
                          <span className="font-medium text-gray-800">{q.question}</span>
                          <ChevronDownIcon 
                            className={`${
                              open ? 'transform rotate-180' : ''
                            } w-5 h-5 text-pastel-green`}
                          />
                        </Disclosure.Button>
                        
                        <Disclosure.Panel className="pb-4 text-gray-600 whitespace-pre-line">
                          {q.answer}
                          {q.link && (
                            <a 
                              href={q.link.url} 
                              className="mt-3 inline-block text-pastel-green hover:text-pastel-blue font-medium"
                            >
                              {q.link.text} →
                            </a>
                          )}
                        </Disclosure.Panel>
                      </div>
                    )}
                  </Disclosure>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-pastel-blue/20 p-8 rounded-xl text-center">
          <h3 className="text-xl font-bold text-pastel-blue mb-4">
            Vous avez une autre question ?
          </h3>
          <p className="mb-6 text-black">Notre équipe répond sous 24h !</p>
          <button 
            onClick={() => setShowContactForm(true)}
            className="inline-block px-8 py-3 bg-gradient-to-b from-secondary to-white text-pastel-blue rounded-full hover:bg-pastel-blue transition-colors"
          >
            Contacter nous
          </button>
        </div>
        
        {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
      </section>
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

export default FAQPage;