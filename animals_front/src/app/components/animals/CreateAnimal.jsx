import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CreateAnimal = () => {
    const [formData, setFormData] = useState({
        nom: '',
        espece: '',
        race: '',
        date_naissance: '',
        sexe: 'M',
        description: '',
        type_garde: 'Définitive', // Set default value to 'Définitive'
        date_reservation: '',
        date_fin: '',
        photo: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData({
                ...formData,
                [name]: files[0], // `files[0]` is the Blob (image file)
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        // Remove date fields if type_garde is 'Définitive'
        const formDataToSend = { ...formData };
        if (formData.type_garde === 'Définitive') {
            delete formDataToSend.date_reservation;
            delete formDataToSend.date_fin;
        }
    
        // Create FormData to send to backend
        const formDataObj = new FormData();
        const file = formData.photo;
        if (file && file.size > 5000000) { // Example: size > 5MB
            setError('File is too large. Maximum size is 5MB.');
            setLoading(false);
            return;
        }
        if (file && !['image/jpeg', 'image/png'].includes(file.type)) {
            setError('Only JPEG and PNG files are allowed.');
            setLoading(false);
            return;
        }
    
        // Append other fields from formData (except photo)
        for (const key in formDataToSend) {
            formDataObj.append(key, formDataToSend[key]);
        }
    
        // Ensure the photo field is appended properly as a file
        if (formData.photo) {
            formDataObj.append('image', formData.photo, formData.photo.name); // Correct key name
        }
        // Log formData to debug (optional)
        for (let pair of formDataObj.entries()) {
            console.log(pair[0] + ": " + pair[1]);  // This will log each key-value pair
        }
    
        try {
            const response = await fetch('http://localhost:8000/api/animals/animaux/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    // 'Content-Type' header is not required with FormData, it's handled automatically
                },
                body: formDataObj, // Send the FormData object directly
            });
    
            if (!response.ok) {
                throw new Error('Failed to create animal');
            }
    
            const data = await response.json();
            router.push('/'); // Redirect to homepage or animal list
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    
    return (
        <div className="min-h-screen bg-gradient-to-r from-pink-100 to-purple-100 py-10">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Create New Animal</h1>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                    {/* Nom */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            placeholder="Nom"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    {/* Espèce */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Espèce</label>
                        <input
                            type="text"
                            name="espece"
                            value={formData.espece}
                            onChange={handleChange}
                            placeholder="Espèce"
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    {/* Race */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Race</label>
                        <input
                            type="text"
                            name="race"
                            value={formData.race}
                            onChange={handleChange}
                            placeholder="Race"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    {/* Date de Naissance */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date de Naissance</label>
                        <input
                            type="date"
                            name="date_naissance"
                            value={formData.date_naissance}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    {/* Sexe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sexe</label>
                        <select
                            name="sexe"
                            value={formData.sexe}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        >
                            <option value="M">Male</option>
                            <option value="F">Femelle</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    {/* Type de Garde */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type de Garde</label>
                        <select
                            name="type_garde"
                            value={formData.type_garde}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        >
                            <option value="Définitive">Définitive</option>
                            <option value="Temporaire">Temporaire</option>
                        </select>
                    </div>

                    {/* Conditional Fields for Temporary Care */}
                    {formData.type_garde === 'Temporaire' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date de Début</label>
                                <input
                                    type="date"
                                    name="date_reservation"
                                    value={formData.date_reservation}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date de Fin</label>
                                <input
                                    type="date"
                                    name="date_fin"
                                    value={formData.date_fin}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Photo</label>
                        <input
                            type="file"
                            name="photo"
                            accept="image/*"
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:ring-4 focus:ring-pink-300 disabled:bg-pink-300"
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAnimal;
