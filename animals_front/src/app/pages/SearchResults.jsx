"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FaPaw, FaHeart, FaSmile } from "react-icons/fa";
import Navbar from "./NavbarPage"; // Adjust the path if needed

export default function setSearchResults() {
  const { id } = useParams(); // Get the animal ID from the URL
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimalDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8001/api/animals/${id}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch animal details");
        }
        const data = await response.json();
        setAnimal(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimalDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!animal) {
    return <div className="text-center py-8">Animal not found</div>;
  }

  return (
    <div className="min-h-screen bg-pastel-pink">
      {/* Navbar */}
      <Navbar />

      {/* Animal Details */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Animal Image */}
          <div className="relative h-96 w-full mb-6">
            <Image
              src={`http://127.0.0.1:8001${animal.image}`}
              alt={animal.nom}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>

          {/* Animal Details */}
          <h1 className="text-3xl font-bold text-pastel-blue mb-4">{animal.nom}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Espèce</h2>
                <p className="text-gray-600">{animal.espece}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Race</h2>
                <p className="text-gray-600">{animal.race}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Date de Naissance</h2>
                <p className="text-gray-600">{animal.date_naissance}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Sexe</h2>
                <p className="text-gray-600">{animal.sexe === "M" ? "Male" : "Femelle"}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                <p className="text-gray-600">{animal.description}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Type de Garde</h2>
                <p className="text-gray-600">{animal.type_garde}</p>
              </div>
              {animal.type_garde === "Temporaire" && (
                <>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Date de Début</h2>
                    <p className="text-gray-600">{animal.date_reservation}</p>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Date de Fin</h2>
                    <p className="text-gray-600">{animal.date_fin}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex space-x-4">
            <button className="px-6 py-3 bg-pastel-blue text-white rounded-full hover:bg-pastel-green transition flex items-center">
              <FaHeart className="mr-2" /> Adopter
            </button>
            <button className="px-6 py-3 bg-pastel-pink text-white rounded-full hover:bg-pastel-yellow transition flex items-center">
              <FaPaw className="mr-2" /> Demande de Garde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}