
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from 'lucide-react';

interface ReviewFormProps {
  shopId: string;
  onReviewSubmitted: () => void;
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
    <Card className="border-0 bg-gradient-to-br from-orange-50/50 to-amber-50/30 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Star className="h-5 w-5 text-orange-500" />
          Laissez votre avis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Note</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-all duration-200 ${
                    (hoverRating || rating) >= star 
                      ? 'text-amber-400 fill-amber-400 scale-110' 
                      : 'text-gray-300 hover:text-amber-300'
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm text-gray-600 font-medium">
                  {rating}/5 étoiles
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Votre commentaire</label>
            <Textarea
              placeholder="Partagez votre expérience avec cette boutique..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none border-orange-200 focus:border-orange-300 focus:ring-orange-200/50"
            />
            <p className="text-xs text-gray-500">
              Minimum 10 caractères ({message.length}/10)
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || rating === 0 || message.length < 10}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2.5 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isSubmitting ? "Envoi en cours..." : "Publier mon avis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
