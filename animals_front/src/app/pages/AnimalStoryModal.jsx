"use client";
import { useState } from "react";
import Image from "next/image";
import { FaPaw, FaHeart, FaTimes } from "react-icons/fa";

const AnimalStoryModal = ({ isOpen, onClose, animal }) => {
    if (!isOpen || !animal) return null;

    const stories = {
        max: {
            name: "Max le Labrador",
            title: "Une rencontre qui change des vies",
            story: `Max est un magnifique Labrador de 3 mois au pelage blanc et aux yeux pleins de tendresse. Il a été trouvé errant près d'un parc municipal un jour de pluie, sans collier ni puce électronique.

Lorsqu'il est arrivé chez nous, Max était craintif et peu habitué à la vie de famille. Notre équipe de comportementalistes a travaillé avec lui pendant plusieurs semaines pour lui redonner confiance en l'humain.

Sa grande transformation a eu lieu lors de notre événement de marche canine mensuelle. La famille Martin était venue pour simplement participer à la marche, sans intention d'adopter. Mais la connexion entre Max et le petit Louis, 10 ans, a été immédiate et touchante.

Après trois visites et une période d'essai, Max a définitivement rejoint sa nouvelle famille. Aujourd'hui, il est méconnaissable : joueur, affectueux et parfaitement intégré à sa nouvelle vie.

"Max a transformé notre quotidien. Notre fils Louis a trouvé un fidèle compagnon et Max nous apporte chaque jour sa joie de vivre. Nous remercions infiniment l'équipe de Pawfect Home pour leur accompagnement durant tout le processus d'adoption." - Famille Martin`,
            image: "/labrador1.jpg"
        },
        mia: {
            name: "Mia le Chat",
            title: "De la garde temporaire à l'amour éternel",
            story: `Mia est une chatte tigrée aux yeux bleu perçants, âgée d'environ 4 mois. Elle nous a été confiée suite au déménagement de sa propriétaire dans une maison de retraite qui n'acceptait pas les animaux.

Au début, la garde était temporaire, le temps que la famille trouve une solution. Mia, timide et réservée, a mis du temps à s'habituer à son nouvel environnement chez sa famille d'accueil, les Dubois.

Les semaines ont passé et Mia s'est progressivement ouverte, révélant une personnalité joueuse et affectueuse. Elle a développé un lien particulier avec Léa, la fille de la famille d'accueil, passant des heures à jouer et à se blottir contre elle.

Lorsque la propriétaire initiale a finalement décidé qu'elle ne pourrait pas reprendre Mia, la famille Dubois, qui s'était attachée à elle, a immédiatement demandé à l'adopter définitivement. Après 3 mois en garde temporaire, Mia avait déjà trouvé sa place dans leur foyer.

"Ce qui devait être une garde temporaire s'est transformé en coup de cœur définitif. Mia a apporté tellement de douceur dans notre maison. Ma fille Léa a trouvé une amie fidèle qui l'attend chaque jour après l'école." - Famille Dubois`,
            image: "/chat.jpeg"
        },
        luna: {
            name: "Luna la Berger",
            title: "De l'abandon à l'amour inconditionnel",
            story: `Luna est une magnifique berger allemand d'environ 2 ans qui nous a été signalée par des randonneurs. Elle avait été abandonnée et attachée à un arbre en pleine forêt, sans eau ni nourriture, exposée aux intempéries.

Lorsque notre équipe de sauvetage est arrivée sur place, Luna était déshydratée, effrayée et présentait des signes de malnutrition. Elle a immédiatement été prise en charge par notre vétérinaire partenaire pour des soins intensifs.

Malgré son traumatisme, Luna a montré une résilience incroyable. Après quelques semaines de soins et de réhabilitation, sa véritable personnalité a commencé à s'épanouir : un chien intelligent, loyal et extraordinairement affectueux malgré ce qu'elle avait traversé.

La photo de Luna sur notre site a immédiatement attiré l'attention de la famille Bernard, passionnée de bergers allemands et expérimentée dans la réhabilitation de chiens traumatisés. Après plusieurs visites et une période d'adaptation, Luna a rejoint sa nouvelle famille.

"Adopter Luna a été l'une des meilleures décisions de notre vie. Elle avait besoin d'un foyer stable et aimant, et nous avions de l'amour à donner. Les premiers mois ont demandé de la patience, mais voir Luna s'épanouir et retrouver confiance en l'humain a été une expérience profondément gratifiante." - Famille Bernard`,
            image: "/berger.jpg"
        }
    };

    const animalData = stories[animal];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative animate-fadeIn">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/80 p-2 rounded-full z-10 hover:bg-pastel-pink/20 transition-all"
            >
              <FaTimes className="text-gray-700" />
            </button>
    
            <div className="flex flex-col h-full">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row items-start gap-6 p-6 border-b border-gray-200">
                {/* Image */}
                <div className="w-full md:w-1/3 relative h-48 md:h-64">
                  <Image
                    src={animalData.image}
                    alt={animalData.name}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, 30vw"
                  />
                </div>
                
                {/* Title Section */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <FaHeart className="text-pastel-pink text-xl" />
                    <h2 className="text-3xl font-bold text-pastel-blue">{animalData.name}</h2>
                  </div>
                  <h3 className="text-xl font-semibold text-pastel-green">{animalData.title}</h3>
                  <div className="flex gap-2">
                    <FaPaw className="text-pastel-yellow" />
                    <FaPaw className="text-pastel-blue" />
                    <FaPaw className="text-pastel-yellow" />
                  </div>
                </div>
              </div>
    
              {/* Story Content */}
              <div className="p-6 md:p-8 overflow-y-auto max-h-[60vh]">
                <div className="text-gray-700 space-y-4">
                  {animalData.story.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-justify">{paragraph}</p>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-center">
                  <button 
                    className="px-6 py-3 bg-pastel-green text-white rounded-full hover:bg-pastel-blue transition font-semibold"
                    onClick={() => window.location.href='/nos-animaux'}
                  >
                    Découvrir d'autres animaux
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

// Exemple d'utilisation dans votre page de blog
const BlogPageWithStories = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAnimal, setSelectedAnimal] = useState(null);

    const openModal = (animal) => {
        setSelectedAnimal(animal);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    // Ajouter au JSX existant de votre BlogPage
    const storiesSection = (
        <>
            {/* Histoires de Succès */}
            <section className="mt-16 mb-8">
                <h2 className="text-3xl font-bold text-pastel-blue mb-2 text-center">Nos Belles Histoires</h2>
                <p className="text-center text-gray-700 mb-8">Découvrez les animaux qui ont trouvé leur foyer pour toujours</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { id: "max", name: "Max le Labrador", story: "Trouvé un foyer grâce à notre événement de marche canine", image: "/labrador1.jpg" },
                        { id: "mia", name: "Mia le Chat", story: "Adoptée après 3 mois en garde temporaire", image: "/chat.jpeg" },
                        { id: "luna", name: "Luna la Berger", story: "Sauvée et adoptée par une famille aimante", image: "/berger.jpg" }
                    ].map((story, index) => (
                        <div
                            key={index}
                            className="group relative h-64 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all"
                            onClick={() => openModal(story.id)}
                        >
                            <Image
                                src={story.image}
                                alt={story.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6">
                                <div>
                                    <h3 className="text-white text-xl font-bold mb-1">{story.name}</h3>
                                    <p className="text-white/90 font-medium">{story.story}</p>
                                    <div className="w-0 group-hover:w-full h-0.5 bg-pastel-yellow mt-2 transition-all duration-300"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <button
                        className="px-8 py-3 bg-white border-2 border-pastel-blue text-pastel-blue rounded-full hover:bg-pastel-blue hover:text-white transition-all duration-300 font-semibold text-lg"
                        onClick={() => window.location.href = '/nos-animaux'}
                    >
                        Voir touts nos animuax
                    </button>
                </div>
            </section>

            {/* Modal pour afficher les histoires */}
            <AnimalStoryModal
                isOpen={modalOpen}
                onClose={closeModal}
                animal={selectedAnimal}
            />
        </>
    );

    return storiesSection;
};

export { AnimalStoryModal };
export default BlogPageWithStories;