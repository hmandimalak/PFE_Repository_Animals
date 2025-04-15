"use client";
import { Disclosure } from '@headlessui/react';
import { FaQuestionCircle, FaPaw, FaShippingFast, FaHeart } from 'react-icons/fa';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Navbar from "./NavbarPage";
import { useState } from 'react';
import ContactForm from './Contactform';

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
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <Navbar/>
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
            Nous Contacter
          </button>
        </div>
        
        {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
      </section>
    </div>
  );
};

export default FAQPage;