import { useState } from 'react';
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

        const token = localStorage.getItem("access_token") || session?.accessToken;
        try {
            const response = await fetch('http://localhost:8000/api/animals/animaux/', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataObj,
            });
            if (!response.ok) throw new Error('Failed to create animal');
            router.push('/');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-pink-50 to-purple-50 py-10">
            <Navbar />
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-8">
                <h1 className="text-4xl font-bold text-center text-pink-600 mb-8">Create New Animal</h1>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">{error}</div>}
               <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
               <div><label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" required className="w-full px-4 py-3 border rounded-lg" /></div>
                    <div> <label className="block text-sm font-medium text-gray-700 mb-2">Espèce</label>
                    <select name="espece" value={formData.espece} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg">
                        <option value="" disabled>Sélectionnez une espèce</option>
                        <option value="Chien">Chien</option>
                        <option value="Chat">Chat</option>
                    </select></div>
                   <div> <label className="block text-sm font-medium text-gray-700 mb-2">Race</label>
                    <select name="race" value={formData.race} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg">
                        <option value="" disabled>Sélectionnez une race</option>
                        {speciesOptions[formData.espece]?.map((race) => (
                            <option key={race} value={race}>{race}</option>
                        ))}
                    </select>
                    </div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Date de Naissance</label>
                    <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
                    <select name="sexe" value={formData.sexe} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                        <option value="M">Male</option>
                        <option value="F">Femelle</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full px-4 py-3 border rounded-lg" rows="4" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de Garde</label>
                    <select name="type_garde" value={formData.type_garde} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                        <option value="Définitive">Définitive</option>
                        <option value="Temporaire">Temporaire</option>
                    </select>
                    </div>
                    
                    {formData.type_garde === 'Temporaire' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date de Début</label>
                                <input
                                    type="date"
                                    name="date_reservation"
                                    value={formData.date_reservation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date de Fin</label>
                                <input
                                    type="date"
                                    name="date_fin"
                                    value={formData.date_fin}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                                />
                            </div>
                        </>
                    )}
                     <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                    <input type="file" name="photo" accept="image/*" onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAnimal;
