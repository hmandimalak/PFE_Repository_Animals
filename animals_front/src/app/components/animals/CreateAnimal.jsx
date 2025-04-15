import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import Navbar from '../../pages/NavbarPage';

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
        const formDataToSend = { ...formData };
        if (formData.type_garde === 'Définitive') {
            delete formDataToSend.date_reservation;
            delete formDataToSend.date_fin;
        }

        const formDataObj = new FormData();
        for (const key in formDataToSend) {
            formDataObj.append(key, formDataToSend[key]);
        }
        if (formData.photo) {
            formDataObj.append('image', formData.photo, formData.photo.name);
        }

        try {
            const response = await fetch('http://localhost:8000/api/animals/animaux/', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataObj,
            });
            if (response.ok) {
                alert("Demande de garde envoyée avec succès!");
                setIsModalOpen(false);
                router.push('/'); // Redirect to home page after successful submission
            } else if (response.status === 401) {
                alert("Votre session a expiré. Veuillez vous reconnecter.");
                router.push("/login");
            } else {
                alert("Erreur lors de l'envoi de la demande de garde. Veuillez réessayer.");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-secondary to-white">
            <Navbar />
            <div className="max-w-7xl mx-auto mt-12 bg-white rounded-2xl shadow-xl p-10 text-dark w-full transform transition-all duration-300 hover:shadow-2xl">
                <div className="mb-10 text-center space-y-2">
                    <h1 className="text-5xl font-extrabold text-primary animate-fade-in-down">
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

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-8" encType="multipart/form-data">
                    {/* First Column */}
                    <div className="space-y-6 border-r-2 border-accent/20 pr-8">
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
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6 animate-slide-in-left delay-100">
                            <div>
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
                                >
                                    <option value="" disabled>Choisir une espèce</option>
                                    <option value="Chien">🐶 Chien</option>
                                    <option value="Chat">🐱 Chat</option>
                                </select>
                            </div>

                            <div>
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
                                >
                                    <option value="" disabled>Sélectionner une race</option>
                                    {speciesOptions[formData.espece]?.map((race) => (
                                        <option key={race} value={race}>{race}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 animate-slide-in-left delay-200">
                            <div>
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
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">
                                    Sexe
                                </label>
                                <div className="mt-1 flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="sexe"
                                            value="M"
                                            checked={formData.sexe === 'M'}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-primary border-2 border-accent/30"
                                        />
                                        <span className="text-dark/90">Mâle</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="sexe"
                                            value="F"
                                            checked={formData.sexe === 'F'}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-primary border-2 border-accent/30"
                                        />
                                        <span className="text-dark/90">Femelle</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second Column */}
                    <div className="space-y-6 pl-8">
                        <div className="animate-slide-in-right">
                            <label className="block text-sm font-semibold text-dark mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Décrivez le caractère, les particularités..."
                                className="mt-1 w-full px-4 py-3 border-2 border-accent/30 rounded-xl focus:ring-2 focus:ring-primary h-32 resize-none"
                            />
                        </div>

                        <div className="animate-slide-in-right delay-100">
                            <label className="block text-sm font-semibold text-dark mb-2">
                                Type de Garde
                            </label>
                            <div className="grid grid-cols-2 gap-4 mt-1">
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, type_garde: 'Définitive'})}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.type_garde === 'Définitive' ? 
                                        'border-primary bg-primary/10 text-primary font-semibold' : 
                                        'border-accent/30 text-dark/70 hover:border-primary/50'}`}
                                >
                                    🏠 Définitive
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, type_garde: 'Temporaire'})}
                                    className={`p-4 rounded-xl border-2 transition-all ${formData.type_garde === 'Temporaire' ? 
                                        'border-primary bg-primary/10 text-primary font-semibold' : 
                                        'border-accent/30 text-dark/70 hover:border-primary/50'}`}
                                >
                                    📅 Temporaire
                                </button>
                            </div>
                        </div>

                        {formData.type_garde === 'Temporaire' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-2 gap-6">
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

                        <div className="animate-slide-in-right delay-200">
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
                    </div>

                    {/* Submit Button */}
                    <div className="col-span-2 mt-10 animate-fade-in-up">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 hover:scale-[1.02] transition-transform shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                '✅ Soumettre la demande'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CreateAnimal;