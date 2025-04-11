"use client";
import { Nunito } from "next/font/google";
import Image from "next/image";
import Navbar from "./NavbarPage";
import { useState } from "react";
import AnimalStoryModal  from "./AnimalStoryModal"
import { FaPaw, FaCalendarAlt, FaShoppingCart, FaHandHoldingHeart, FaRegClipboard, FaArrowRight } from "react-icons/fa";

const nunito = Nunito({ subsets: ["latin"] });


const BlogPage = () => {
const [modalOpen, setModalOpen] = useState(false);
const [selectedAnimal, setSelectedAnimal] = useState(null);
  // Contenu personnalisé
  const featuredContent = {
    gardeService: {
      temporaire: {
        title: "Service de Garde Temporaire 🏡",
        description: "Solution idéale pour vos déplacements courts :",
        points: [
          "Durée flexible (1 jour à 3 mois)",
          "Suivi vétérinaire inclus",
          "Photos quotidiennes",
          "Option de prolongation"
        ],
        image: "/adoption.jpg"
      },
      definitive: {
        title: "Garde Définitive ❤️",
        description: "Pour les situations permanentes :",
        points: [
          "Processus de réhomage sécurisé",
          "Évaluation comportementale",
          "Famille d'accueil vérifiée",
          "Suivi post-adoption"
        ],
        image: "/adoption.jpg"
      }
    },
    adoptionStories: [
      {
        name: "Max le Labrador",
        story: "Trouvé un foyer grâce à notre événement de marche canine",
        image: "/labrador1.jpg"
      },
      {
        name: "Mia le Chat",
        story: "Adoptée après 3 mois en garde temporaire",
        image: "/chat.jpeg"
      },
      {
        name: "Luna la Berger",
        story: "Sauvée et adoptée par une famille aimante",
        image: "/berger.jpg"
      }
    ],
    boutique: {
      categories: [
        {
          name: "Hygiène",
          produits: ["Shampooing doux", "Brosse antiparasite", "Litière bio"]
        },
        {
          name: "Nutrition",
          produits: ["Croquettes premium", "Friandises naturelles", "Compléments vitaminés"]
        },
        {
          name: "Accessoires",
          produits: ["Harnais confort", "Jouets interactifs", "Panier orthopédique"]
        }
      ],
      image: "/adoption.jpg"
    },
    evenements: {
      prochain: {
        title: "Marche Canine Mensuelle 🐕",
        date: "25 Octobre 2024 - Parc Central",
        details: [
          "Inscription gratuite",
          "Parcours de 3km",
          "Rencontre avec nos animaux à adopter",
          "10% de réduction boutique pour participants"
        ],
        image: "/marche.jpg"
      }
    }
  };
  const openModal = (animal) => {
    setSelectedAnimal(animal);
    setModalOpen(true);
  };
  
  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-pastel-pink/50 to-white ${nunito.className}`}>
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-pastel-blue text-center mb-4">
          Blog Pawfect Home
        </h1>
        <div className="flex justify-center mb-12">
          <FaPaw className="text-4xl text-pastel-green mx-2 transform rotate-[-15deg]" />
          <FaPaw className="text-4xl text-pastel-blue mx-2" />
          <FaPaw className="text-4xl text-pastel-yellow mx-2 transform rotate-[15deg]" />
        </div>

        {/* Section Garde */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-12 transition-all hover:shadow-xl">
          <div className="flex items-center mb-8">
            <div className="bg-pastel-green/30 p-3 rounded-full mr-4">
              <FaHandHoldingHeart className="text-3xl text-pastel-green" />
            </div>
            <h2 className="text-3xl font-bold text-pastel-green">Nos Services de Garde</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Garde Temporaire */}
            <div className="bg-pastel-blue/20 p-6 rounded-lg transition-all hover:transform hover:scale-[1.02]">
              <h3 className="text-2xl font-semibold text-pastel-green mb-4">
                {featuredContent.gardeService.temporaire.title}
              </h3>
              <p className="mb-4 text-gray-800">{featuredContent.gardeService.temporaire.description}</p>
              <ul className="list-disc pl-6 space-y-3 mb-6 text-gray-800">
                {featuredContent.gardeService.temporaire.points.map((point, index) => (
                  <li key={index} className="font-medium">{point}</li>
                ))}
              </ul>
              <button 
                className="w-full px-6 py-3 bg-pastel-green text-white rounded-full hover:bg-pastel-blue transition flex items-center justify-center font-semibold text-lg"
                onClick={() => window.location.href='/garderie'}
              >
                Demander une garde
                <FaArrowRight className="ml-2" />
              </button>
            </div>

            {/* Garde Définitive */}
            <div className="bg-pastel-green/20 p-6 rounded-lg transition-all hover:transform hover:scale-[1.02]">
              <h3 className="text-2xl font-semibold text-pastel-blue mb-4">
                {featuredContent.gardeService.definitive.title}
              </h3>
              <p className="mb-4 text-gray-800">{featuredContent.gardeService.definitive.description}</p>
              <ul className="list-disc pl-6 space-y-3 mb-6 text-gray-800">
                {featuredContent.gardeService.definitive.points.map((point, index) => (
                  <li key={index} className="font-medium">{point}</li>
                ))}
              </ul>
              <button 
                className="w-full px-6 py-3 bg-pastel-blue text-white rounded-full hover:bg-pastel-green transition flex items-center justify-center font-semibold text-lg"
                onClick={() => window.location.href='/garderie'}
              >
                Demander une garde
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </section>

        {/* Section Adoption */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-12 transition-all hover:shadow-xl">
          <div className="flex items-center mb-8">
            <div className="bg-pastel-blue/30 p-3 rounded-full mr-4">
              <FaPaw className="text-3xl text-pastel-yellow" />
            </div>
            <h2 className="text-3xl font-bold text-pastel-yellow">Processus d'Adoption</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-pastel-yellow/20 to-pastel-pink/20 p-6 rounded-lg flex items-center">
              <div className="relative w-32 h-32 mr-6 flex-shrink-0">
                <Image
                  src="/adoption.jpg"
                  alt="Adoption"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-pastel-blue mb-2">Comment adopter ?</h3>
                <p className="text-gray-800">Consultez nos animaux disponibles et venez les rencontrer lors de nos événements hebdomadaires. Notre équipe vous guidera à chaque étape.</p>
                <button 
                  className="mt-4 px-5 py-2 bg-pastel-yellow text-white rounded-full hover:bg-pastel-blue transition font-medium"
                  onClick={() => window.location.href='/nos-animaux'}
                >
                  Voir les animaux disponibles
                </button>
              </div>
            </div>
            
            <div className="bg-pastel-pink/30 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-pastel-green mb-4">Critères d'Adoption :</h3>
              <ul className="space-y-3">
                {[
                  "Visite domiciliaire obligatoire",
                  "Engagement sur 12 mois minimum",
                  "Entretien avec notre équipe",
                  "Période d'essai de 15 jours"
                ].map((critere, idx) => (
                  <li key={idx} className="flex items-center text-gray-800">
                    <div className="h-2 w-2 rounded-full bg-pastel-blue mr-3"></div>
                    <span className="font-medium">{critere}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section Boutique */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-12 transition-all hover:shadow-xl">
          <div className="flex items-center mb-8">
            <div className="bg-pastel-yellow/30 p-3 rounded-full mr-4">
              <FaShoppingCart className="text-3xl text-pastel-blue" />
            </div>
            <h2 className="text-3xl font-bold text-pastel-blue">Notre Boutique</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredContent.boutique.categories.map((categorie, index) => (
  <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:transform hover:scale-[1.03] border-t-4 border-pastel-blue">
    <h4 className="font-bold text-xl text-pastel-green mb-4">{categorie.name}</h4>
    <ul className="space-y-2">
      {categorie.produits.map((produit, pIndex) => (
        <li key={pIndex} className="flex items-center text-gray-800">
          <FaPaw className="text-xs text-pastel-yellow mr-2" />
          <span>{produit}</span>
        </li>
      ))}
    </ul>
    <button 
      className="mt-4 w-full text-center text-pastel-blue font-medium hover:text-pastel-green transition"
      onClick={() => window.location.href=`/boutique?categorie=${categorie.name}`}
    >
      Découvrir →
    </button>
  </div>
))}
          </div>
          
          <div className="mt-8 text-center">
            <button 
              className="px-8 py-3 bg-pastel-blue text-white rounded-full hover:bg-pastel-yellow transition font-semibold text-lg inline-flex items-center"
              onClick={() => window.location.href='/boutique'}
            >
              <FaShoppingCart className="mr-2" />
              Visiter notre boutique
            </button>
          </div>
        </section>

        {/* Section Événements */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-12 transition-all hover:shadow-xl">
          <div className="flex items-center mb-8">
            <div className="bg-pastel-green/30 p-3 rounded-full mr-4">
              <FaCalendarAlt className="text-3xl text-pastel-blue" />
            </div>
            <h2 className="text-3xl font-bold text-pastel-blue">Événements de Marche Canine</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-80 rounded-lg overflow-hidden shadow-md">
              <Image
                src={featuredContent.evenements.prochain.image}
                alt="Marche canine"
                fill
                className="object-cover hover:scale-105 transition-all duration-500"
              />
              <div className="absolute top-4 right-4 bg-pastel-yellow text-white px-4 py-2 rounded-full font-bold">
                Prochain événement
              </div>
            </div>
            
            <div className="flex flex-col justify-center space-y-6">
              <h3 className="text-2xl font-bold text-pastel-green">{featuredContent.evenements.prochain.title}</h3>
              <div className="bg-pastel-blue/20 py-3 px-5 rounded-lg inline-block w-fit">
                <p className="text-lg font-semibold text-pastel-blue flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  {featuredContent.evenements.prochain.date}
                </p>
              </div>
              <ul className="space-y-3">
                {featuredContent.evenements.prochain.details.map((detail, index) => (
                  <li key={index} className="flex items-center bg-pastel-green/10 p-3 rounded-lg">
                    <FaRegClipboard className="mr-3 text-pastel-yellow" />
                    <span className="text-gray-800 font-medium">{detail}</span>
                  </li>
                ))}
              </ul>
              <button 
                className="mt-4 px-6 py-3 bg-pastel-yellow text-white rounded-full hover:bg-pastel-green transition flex items-center justify-center font-semibold text-lg"
                onClick={() => window.location.href='/evenements'}
              >
                <FaPaw className="mr-2" />
                S'inscrire à l'événement
              </button>
            </div>
          </div>
        </section>
{/* Section Conseils */}
<section className="bg-white rounded-xl shadow-lg p-8 mb-12 transition-all hover:shadow-xl">
  <div className="flex items-center mb-8">
    <div className="bg-pastel-pink/30 p-3 rounded-full mr-4">
      <FaRegClipboard className="text-3xl text-pastel-blue" />
    </div>
    <h2 className="text-3xl font-bold text-pastel-blue">Conseils pour Nos Amis à 4 Pattes</h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Chat */}
    <div className="bg-pastel-green/20 p-6 rounded-lg">
      <div className="flex items-center mb-6">
        <div className="relative w-24 h-24 mr-4">
          <Image
            src="/chat-advice.jpg"
            alt="Conseils chats"
            fill
            className="object-cover rounded-full"
          />
        </div>
        <h3 className="text-2xl font-bold text-pastel-green">Conseils pour Chats</h3>
      </div>

      <details className="group mb-4">
        <summary className="flex justify-between items-center cursor-pointer list-none bg-pastel-green/30 p-4 rounded-lg">
          <span className="font-semibold text-black">Soins Essentiels</span>
          <span className="transform transition-transform group-open:rotate-90 text-black">→</span>
        </summary>
        <div className="text-gray-700 space-y-3 mt-2 mb-6">
          <p>✔️ Brossage régulier (2-3x/semaine)<br />
          ✔️ Nettoyage litière quotidien<br />
          ✔️ Vaccination annuelle<br />
          ✔️ Vermifuge 4x/an</p>
        </div>
      </details>

      <details className="group mb-4">
        <summary className="flex justify-between items-center cursor-pointer list-none bg-pastel-green/30 p-4 rounded-lg">
          <span className="font-semibold text-black">Ce qu'ils adorent</span>
          <span className="transform transition-transform group-open:rotate-90 text-black">→</span>
        </summary>
        <div className="text-gray-700 space-y-3 mt-2 mb-6">
          <p>😻 Les grattoirs hauts<br />
          😻 Les cachettes cosy<br />
          😻 Jeux de chasse (plumes, lasers)<br />
          😻 Séances de grooming</p>
        </div>
      </details>

      <details className="group">
        <summary className="flex justify-between items-center cursor-pointer list-none bg-pastel-green/30 p-4 rounded-lg">
          <span className="font-semibold text-black">À éviter</span>
          <span className="transform transition-transform group-open:rotate-90 text-black">→</span>
        </summary>
        <div className="text-gray-700 space-y-3 mt-2">
          <p>🚫 Bruits forts soudains<br />
          🚫 Changements brutaux de routine<br />
          🚫 Nourriture pour chiens<br />
          🚫 Contact forcé</p>
        </div>
      </details>
    </div>

    {/* Chien */}
    <div className="bg-pastel-blue/20 p-6 rounded-lg">
      <div className="flex items-center mb-6">
        <div className="relative w-24 h-24 mr-4">
          <Image
            src="/chien-advice.jpg"
            alt="Conseils chiens"
            fill
            className="object-cover rounded-full"
          />
        </div>
        <h3 className="text-2xl font-bold text-pastel-blue">Conseils pour Chiens</h3>
      </div>

      <details className="group mb-4">
        <summary className="flex justify-between items-center cursor-pointer list-none bg-pastel-blue/30 p-4 rounded-lg">
          <span className="font-semibold text-black">Soins Essentiels</span>
          <span className="transform transition-transform group-open:rotate-90 text-black">→</span>
        </summary>
        <div className="text-gray-700 space-y-3 mt-2 mb-6">
          <p>✔️ Promenades quotidiennes (30 min min)<br />
          ✔️ Brossage selon pelage<br />
          ✔️ Vaccination annuelle<br />
          ✔️ Éducation positive</p>
        </div>
      </details>

      <details className="group mb-4">
        <summary className="flex justify-between items-center cursor-pointer list-none bg-pastel-blue/30 p-4 rounded-lg">
          <span className="font-semibold text-black">Ce qu'ils adorent</span>
          <span className="transform transition-transform group-open:rotate-90 text-black">→</span>
        </summary>
        <div className="text-gray-700 space-y-3 mt-2 mb-6">
          <p>🐾 Jeux de rapport<br />
          🐾 Socialisation avec autres chiens<br />
          🐾 Récompenses gourmandes<br />
          🐾 Câlins sur demande</p>
        </div>
      </details>

      <details className="group">
        <summary className="flex justify-between items-center cursor-pointer list-none bg-pastel-blue/30 p-4 rounded-lg">
          <span className="font-semibold text-black">À éviter</span>
          <span className="transform transition-transform group-open:rotate-90 text-black">→</span>
        </summary>
        <div className="text-gray-700 space-y-3 mt-2">
          <p>🚫 Rester seul trop longtemps<br />
          🚫 Nourriture humaine (chocolat, oignons)<br />
          🚫 Punitions physiques<br />
          🚫 Exercice après repas</p>
        </div>
      </details>
    </div>
  </div>
</section>
        <AnimalStoryModal 
  isOpen={modalOpen}
  onClose={closeModal}
  animal={selectedAnimal}
/>       
      </main>
    </div>
  );
};

export default BlogPage;