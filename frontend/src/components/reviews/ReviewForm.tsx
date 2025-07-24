import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  shopId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ shopId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || message.length < 10) {
      toast({
        title: "Validation requise",
        description: "Veuillez donner une note et écrire un message d'au moins 10 caractères.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews/`, {
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
      toast({
        title: "Succès",
        description: "Votre avis a été publié avec succès."
      });
      onReviewSubmitted();

    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Card className="bg-orange-50 border-orange-200 shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-orange-500" />
          Laissez votre avis sur cette boutique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Votre note</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-all duration-200 ${
                    (hoverRating || rating) >= star 
                      ? 'text-yellow-400 fill-yellow-400 scale-110' 
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Textarea
              placeholder="Partagez votre expérience..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none bg-white/50 border-orange-200 focus:ring-orange-400"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting} // On ne le désactive que pendant l'envoi
            className="w-full bg-orange-500 text-white shadow-lg hover:shadow-xl transition-all"
          >
            {isSubmitting ? "Envoi..." : "Publier mon avis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;