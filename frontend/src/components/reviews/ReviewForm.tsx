import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';

interface ReviewFormProps {
  shopId: string;
  onReviewSubmitted: () => void; // Pour rafraîchir la liste des avis
}

const ReviewForm: React.FC<ReviewFormProps> = ({ shopId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || message.length < 10) {
      alert("Veuillez donner une note et écrire un message d'au moins 10 caractères.");
      return;
    }
    
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch("http://localhost:8000/reviews/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shop_id: shopId, rating, message })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la soumission de l'avis.");
      }

      // Vider le formulaire et rafraîchir la liste
      setRating(0);
      setMessage('');
      onReviewSubmitted();

    } catch (error) {
      alert(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Laissez votre avis</h3>
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      <Textarea
        placeholder="Votre message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="mb-4"
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Envoi en cours..." : "Envoyer l'avis"}
      </Button>
    </form>
  );
};

export default ReviewForm;