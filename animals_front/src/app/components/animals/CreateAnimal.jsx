import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import Navbar from '../../pages/NavbarPage';
import {authenticatedFetch} from '../../authInterceptor';
import { FaPaw, FaDog, FaCat, FaHeart, FaArrowRight, FaList, FaPlusCircle } from "react-icons/fa";
import Image from "next/image";
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"] });

const CreateAnimal = () => {
    const [formData, setFormData] = useState({
        nom: '',
        espece: '',
        race: '',
        date_naissance: '',
        sexe: 'M',
        description: '',
        type_garde: 'Définitive',
        date_reservation: '',
        date_fin: '',
        photo: null,
    });

    const speciesOptions = {
        Chien: [
            "Berger Allemand", "Labrador Retriever", "Golden Retriever", "Bulldog",
            "Rottweiler", "Husky Sibérien", "Beagle", "Caniche", "Chihuahua",
            "Yorkshire Terrier", "Autre"
        ],
        Chat: [
            "Persan", "Siamois", "Maine Coon", "Bengal", "British Shorthair",
            "Ragdoll", "Sphynx", "Abyssin", "Sacré de Birmanie", "Européen", "Autre"
        ]
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adoptedAnimals, setAdoptedAnimals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAdoptedAnimal, setSelectedAdoptedAnimal] = useState(null);
    const [formMode, setFormMode] = useState('new'); // 'new' or 'existing'

    const existing = {
        fetchAdoptedAnimals: async () => {
            try {
                const response = await authenticatedFetch("http://127.0.0.1:8000/api/animals/mes-adoptions/");
                if (response && response.ok) {
                    const data = await response.json();
                    return Array.isArray(data) ? data : [];
                }
                return [];
            } catch (error) {
                console.error("Error fetching adopted animals:", error);
                return [];
            }
        },
    };
    useEffect(() => {
        // Fetch adopted animals when component mounts
        const fetchAnimals = async () => {
            setIsLoading(true);
            try {
                const animals = await existing.fetchAdoptedAnimals();
                setAdoptedAnimals(animals || []);
            } catch (error) {
                console.error("Error fetching adopted animals:", error);
                setAdoptedAnimals([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchAnimals();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else if (name === 'espece') {
            setFormData({ ...formData, espece: value, race: '' }); // Reset race when species changes
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAdoptedAnimalSelect = (animal) => {
        setSelectedAdoptedAnimal(animal);
        setFormData({
            ...formData,
            nom: animal.nom,
            espece: animal.espece,
            race: animal.race,
            date_naissance: animal.date_naissance,
            sexe: animal.sexe,
            description: animal.description || '',
            // Note: we don't change type_garde, date_reservation, and date_fin as those are specific to this request
        });
    };

    const switchMode = (mode) => {
        setFormMode(mode);
        if (mode === 'new') {
            setSelectedAdoptedAnimal(null);
            setFormData({
                nom: '',
                espece: '',
                race: '',
                date_naissance: '',
                sexe: 'M',
                description: '',
                type_garde: formData.type_garde, // Preserve the type_garde
                date_reservation: formData.date_reservation, // Preserve reservation dates
                date_fin: formData.date_fin,
                photo: null,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        const token = localStorage.getItem("access_token") || session?.accessToken;
        
        // Check if user is authenticated before submitting
        if (!token) {
            alert("Vous devez être connecté pour créer un animal");
            router.push("/login");
            setLoading(false);
            return;
        }
    
        // Validate dates
        const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
        const { date_naissance, date_reservation, date_fin, type_garde } = formData;
        if (date_naissance > today) {
            alert("La date de naissance doit être aujourd'hui ou une date precèdente.");
            setLoading(false);
            return;
        }
        if (!date_naissance) {
            alert("Veuillez entrer la date de naissance.");
            setLoading(false);
            return;
        }
    
        if (type_garde === 'Temporaire') {
            if (!date_reservation) {
                alert("Veuillez entrer une date de réservation.");
                setLoading(false);
                return;
            }
    
            if (date_reservation < today) {
                alert("La date de réservation doit être aujourd'hui ou une date future.");
                setLoading(false);
                return;
            }
    
            if (date_naissance >= date_reservation) {
                alert("La date de naissance doit être avant la date de réservation.");
                setLoading(false);
                return;
            }
    
            if (date_fin && date_fin <= date_reservation) {
                alert("La date de fin doit être après la date de réservation.");
                setLoading(false);
                return;
            }
        }
        
        // Create a FormData object for sending
        const formDataObj = new FormData();
        
        if (formMode === 'existing' && selectedAdoptedAnimal) {
            // For existing animal requests, use the DemandeGarde endpoint
            // Include the animal ID
            formDataObj.append('animal', selectedAdoptedAnimal.id);
            
            // Add other required fields for DemandeGarde
            formDataObj.append('message', "Demande de garde pour animal existant");
            formDataObj.append('type_garde', formData.type_garde);
            
            // For temporary garde, include dates
            if (formData.type_garde === 'Temporaire') {
                formDataObj.append('date_reservation', formData.date_reservation);
                if (formData.date_fin) {
                    formDataObj.append('date_fin', formData.date_fin);
                }
            }
            
            // Only add photo if provided for existing animal
            if (formData.photo) {
                formDataObj.append('image', formData.photo);
            }
            
            // API endpoint for existing animals (DemandeGarde)
            const apiUrl = 'http://localhost:8000/api/animals/demandes-garde/';
            
            try {
                console.log("Sending existing animal request");
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        // Don't set Content-Type header when using FormData with multipart/form-data
                    },
                    body: formDataObj,
                });
                
                if (response.ok) {
                    setIsModalOpen(true);
                } else if (response.status === 401) {
                    alert("Votre session a expiré. Veuillez vous reconnecter.");
                    router.push("/login");
                } else {
                    const errorData = await response.json();
                    console.error("Server response:", errorData);
                    alert(`Erreur: ${errorData.detail || JSON.stringify(errorData) || 'Une erreur est survenue'}`);
                }
            } catch (error) {
                console.error("Network error:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        } else {
            // For new animal creation
            // Add all form fields except photo
            for (const key in formData) {
                if (key !== 'photo') {
                    formDataObj.append(key, formData[key]);
                }
            }
            // Add user ID if needed
            if (session && session.user && session.user.id) {
                formDataObj.append('utilisateur', session.user.id);
            }
            // Add the photo if it exists
            if (formData.photo) {
                formDataObj.append('image', formData.photo);
            }
            
            // API endpoint for new animal creation
            const apiUrl = 'http://localhost:8000/api/animals/animaux/';
            
            try {
                console.log("Form data being sent for new animal:", Object.fromEntries(formDataObj.entries()));
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: { 
                        Authorization: `Bearer ${token}`, 
                        // Don't set Content-Type header when using FormData with multipart/form-data
                    },
                    body: formDataObj,
                });
                
                if (response.ok) {
                    setIsModalOpen(true);
                } else if (response.status === 401) {
                    alert("Votre session a expiré. Veuillez vous reconnecter.");
                    router.push("/login");
                } else {
                    const errorData = await response.json();
                    console.error("Server response:", errorData);
                    alert(`Erreur: ${errorData.detail || JSON.stringify(errorData) || 'Une erreur est survenue'}`);
                }
            } catch (error) {
                console.error("Network error:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // Function to get animal emoji based on species
    const getAnimalEmoji = (species) => {
        return species === 'Chien' ? '🐶' : species === 'Chat' ? '🐱' : '🐾';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-secondary to-white">            
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
            
            <div className="max-w-7xl mx-auto mt-12 px-4 py-8 w-full">
                <div className="bg-white rounded-3xl shadow-2xl p-10 text-dark transform transition-all duration-300 hover:shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {/* Left Column - Image */}
                        <div className="md:col-span-2 flex flex-col justify-center items-center space-y-6 p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl">
                            <div className="relative w-full h-64 hover:animate-pulse">
                                <Image
                                    src="/adoption.jpg"
                                    alt="Enregistrer un animal"
                                    fill
                                    className="object-cover rounded-xl shadow-lg border-4 border-primary/20"
                                    style={{
                                        borderRadius: "42% 58% 23% 77% / 63% 35% 65% 37%",
                                    }}
                                />
                            </div>
                            <div className="text-center space-y-4 animate-fade-in-up">
                                <h2 className="text-2xl font-bold text-primary">Confiez-nous votre compagnon</h2>
                                <p className="text-dark/70">Remplissez le formulaire pour enregistrer votre animal et nous vous contacterons rapidement.</p>
                                <div className="flex justify-center space-x-4">
                                    <FaPaw className="text-2xl text-accent animate-bounce" />
                                    <FaHeart className="text-2xl text-primary animate-pulse" />
                                    <FaPaw className="text-2xl text-accent animate-bounce delay-300" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Column - Form */}
                        <div className="md:col-span-3">
                            <div className="mb-10 text-center space-y-2 animate-fade-in-down">
                                <h1 className="text-4xl font-extrabold text-primary">
                                    Nouvelle Fiche Animal
                                </h1>
                                <p className="text-dark/80">Remplissez les détails de votre animal</p>
                                <div className="h-1 w-24 bg-accent mx-auto rounded-full" />
                            </div>

                            {error && (
                                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg animate-shake">
                                    <p>⚠️ {error}</p>
                                </div>
                            )}
                            
                            {/* Toggle between new animal and existing adopted animal */}
                            <div className="mb-6">
                                <div className="flex items-center justify-center bg-primary/10 p-2 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => switchMode('new')}
                                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                                            formMode === 'new' 
                                                ? 'bg-primary text-white shadow-md' 
                                                : 'text-primary/90 hover:bg-primary/20'
                                        }`}
                                    >
                                        <FaPlusCircle />
                                        <span>Nouvel Animal</span>
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={() => switchMode('existing')}
                                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                                            formMode === 'existing' 
                                                ? 'bg-primary text-white shadow-md' 
                                                : 'text-primary/90 hover:bg-primary/20'
                                        }`}
                                        disabled={adoptedAnimals.length === 0}
                                    >
                                        <FaList />
                                        <span>Animal Existant</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Adopted Animals Selection */}
                            {formMode === 'existing' && (
                                <div className="mb-6 animate-fade-in">
                                    <label className="block text-sm font-semibold text-dark mb-3">
                                        Sélectionnez un de vos animaux
                                    </label>
                                    
                                    {isLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        </div>
                                    ) : adoptedAnimals.length === 0 ? (
                                        <div className="p-6 text-center bg-primary/5 rounded-xl border border-primary/20">
                                            <p className="text-dark/70">Vous n'avez pas encore d'animaux adoptés.</p>
                                            <button 
                                                onClick={() => switchMode('new')}
                                                className="mt-3 text-primary hover:underline"
                                            >
                                                Créer un nouvel animal
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
                                            {adoptedAnimals.map((animal) => (
                                                <div 
                                                    key={animal.id}
                                                    onClick={() => handleAdoptedAnimalSelect(animal)}
                                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center space-x-3 ${
                                                        selectedAdoptedAnimal?.id === animal.id
                                                            ? 'border-primary bg-primary/10 shadow-md'
                                                            : 'border-accent/30 hover:border-primary/40'
                                                    }`}
                                                >
                                                    <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-2xl">
                                                        {getAnimalEmoji(animal.espece)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{animal.nom}</h3>
                                                        <p className="text-sm text-dark/70">{animal.race} • {animal.sexe === 'M' ? 'Mâle' : 'Femelle'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Animal Name */}
                                    <div className="animate-slide-in-left">
                                        <label className="block text-sm font-semibold text-dark mb-2">
                                            Nom
                                            <span className="text-primary"> *</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="nom"
                                            value={formData.nom}
                                            onChange={handleChange}
                                            placeholder="Buddy"
                                            required
                                            className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                            readOnly={formMode === 'existing' && selectedAdoptedAnimal}
                                        />
                                    </div>

                                    {/* Animal Species */}
                                    <div className="animate-slide-in-right">
                                        <label className="block text-sm font-semibold text-dark mb-2">
                                            Espèce
                                            <span className="text-primary"> *</span>
                                        </label>
                                        <select
                                            name="espece"
                                            value={formData.espece}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzODQ5NTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im03IDE1IDUgNSA1LTUiLz48L3N2Zz4K')] bg-no-repeat bg-[center_right_1rem]"
                                            disabled={formMode === 'existing' && selectedAdoptedAnimal}
                                        >
                                            <option value="" disabled>Choisir une espèce</option>
                                            <option value="Chien">🐶 Chien</option>
                                            <option value="Chat">🐱 Chat</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Animal Breed */}
                                <div className="animate-slide-in-left delay-100">
                                    <label className="block text-sm font-semibold text-dark mb-2">
                                        Race
                                        <span className="text-primary"> *</span>
                                    </label>
                                    <select
                                        name="race"
                                        value={formData.race}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary"
                                        disabled={formMode === 'existing' && selectedAdoptedAnimal}
                                    >
                                        <option value="" disabled>Sélectionner une race</option>
                                        {speciesOptions[formData.espece]?.map((race) => (
                                            <option key={race} value={race}>{race}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Birthdate */}
                                    <div className="animate-slide-in-left delay-200">
                                        <label className="block text-sm font-semibold text-dark mb-2">
                                            Date de Naissance
                                            <span className="text-primary"> *</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="date_naissance"
                                            value={formData.date_naissance}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary"
                                            readOnly={formMode === 'existing' && selectedAdoptedAnimal}
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="animate-slide-in-right delay-200">
                                        <label className="block text-sm font-semibold text-dark mb-2">
                                            Sexe
                                        </label>
                                        <div className="mt-1 flex gap-4">
                                            <label className={`flex items-center gap-2 p-3 border-2 ${formMode === 'existing' && selectedAdoptedAnimal ? 'border-accent/30' : 'border-accent/30 hover:border-primary/50'} rounded-xl flex-1 cursor-pointer transition-colors ${formData.sexe === 'M' ? 'bg-primary/10 border-primary' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="sexe"
                                                    value="M"
                                                    checked={formData.sexe === 'M'}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 text-primary border-2 border-accent/30"
                                                    disabled={formMode === 'existing' && selectedAdoptedAnimal}
                                                />
                                                <span className="text-dark/90">Mâle</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-3 border-2 ${formMode === 'existing' && selectedAdoptedAnimal ? 'border-accent/30' : 'border-accent/30 hover:border-primary/50'} rounded-xl flex-1 cursor-pointer transition-colors ${formData.sexe === 'F' ? 'bg-primary/10 border-primary' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="sexe"
                                                    value="F"
                                                    checked={formData.sexe === 'F'}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 text-primary border-2 border-accent/30"
                                                    disabled={formMode === 'existing' && selectedAdoptedAnimal}
                                                />
                                                <span className="text-dark/90">Femelle</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Description */}
                                <div className="animate-slide-in-right delay-100">
                                    <label className="block text-sm font-semibold text-dark mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Décrivez le caractère, les particularités..."
                                        className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary h-32 resize-none"
                                        readOnly={formMode === 'existing' && selectedAdoptedAnimal}
                                    />
                                </div>
                                
                                {/* Type of Care */}
                                <div className="animate-slide-in-left delay-300">
                                    <label className="block text-sm font-semibold text-dark mb-2">
                                        Type de Garde
                                    </label>
                                    <div className="grid grid-cols-2 gap-4 mt-1">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, type_garde: 'Définitive'})}
                                            className={`p-4 rounded-xl border-2 transition-all ${formData.type_garde === 'Définitive' ? 
                                                'border-primary bg-primary/10 text-primary font-semibold shadow-lg' : 
                                                'border-accent/30 text-dark/70 hover:border-primary/50'}`}
                                        >
                                            🏠 Définitive
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, type_garde: 'Temporaire'})}
                                            className={`p-4 rounded-xl border-2 transition-all ${formData.type_garde === 'Temporaire' ? 
                                                'border-primary bg-primary/10 text-primary font-semibold shadow-lg' : 
                                                'border-accent/30 text-dark/70 hover:border-primary/50'}`}
                                        >
                                            📅 Temporaire
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Temporary Care Dates */}
                                {formData.type_garde === 'Temporaire' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-dark mb-2">
                                                    Date de Réservation
                                                </label>
                                                <input
                                                    type="date"
                                                    name="date_reservation"
                                                    value={formData.date_reservation}
                                                    onChange={handleChange}
                                                    className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-dark mb-2">
                                                    Date de Fin
                                                </label>
                                                <input
                                                    type="date"
                                                    name="date_fin"
                                                    value={formData.date_fin}
                                                    onChange={handleChange}
                                                    className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Photo Upload - Only show for new animals */}
                                {formMode === 'new' && (
                                    <div className="animate-slide-in-right delay-300">
                                        <label className="block text-sm font-semibold text-dark mb-2">
                                            Photo de l'animal
                                        </label>
                                        <div className="mt-1 flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-accent/30 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                                                {formData.photo ? (
                                                    <div className="text-primary">
                                                        📸 Photo sélectionnée: {formData.photo.name}
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-dark/60">
                                                        <div className="text-4xl mb-2">📁</div>
                                                        <span className="font-medium">Glissez une photo ou</span>
                                                        <span className="text-primary ml-1">parcourir</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    name="photo"
                                                    accept="image/*"
                                                    onChange={handleChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Submit Button */}
                                <div className="mt-10 animate-fade-in-up">
                                    <button
                                        type="submit"
                                        disabled={loading || (formMode === 'existing' && !selectedAdoptedAnimal)}
                                        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 hover:scale-105 transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>✅ Soumettre la demande</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="flex justify-center mt-8 mb-4 animate-fade-in">
                    <div className="px-4 py-2 bg-primary/20 rounded-full text-xs text-primary font-medium flex items-center">
                        <FaPaw className="mr-2" /> Adopti © 2025
                    </div>
                </div>
            </div>
            
            {/* Success Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-dark/70 backdrop-blur-sm z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
                            <h2 className="text-2xl font-bold">Succès!</h2>
                        </div>
                        
                        <div className="p-6 space-y-4 text-center">
                            <div className="text-6xl">🎉</div>
                            <h3 className="text-xl font-semibold text-dark">
                                Demande de garde envoyée avec succès!
                            </h3>
                            <p className="text-dark/70">
                                Nous avons bien reçu votre demande et vous contacterons dans les plus brefs délais.
                            </p>
                        </div>
                        
                        <div className="bg-primary/10 p-4 flex justify-center">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    router.push('/');
                                }}
                                className="px-6 py-2 bg-primary text-white rounded-full hover:bg-accent transition-colors flex items-center"
                            >
                                Retour à l'accueil <FaArrowRight className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateAnimal;