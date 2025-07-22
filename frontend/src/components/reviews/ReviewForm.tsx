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
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Laissez votre avis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Votre note</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-7 w-7 cursor-pointer transition-all duration-200 ${
                      (hoverRating || rating) >= star 
                        ? 'text-warning fill-warning scale-110' 
                        : 'text-muted hover:text-warning/50'
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              {rating > 0 && (
                <span className="text-sm text-muted-foreground font-medium">
                  {rating}/5 étoiles
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Votre commentaire</label>
            <Textarea
              placeholder="Partagez votre expérience avec cette boutique..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 caractères ({message.length}/10)
            </p>
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || rating === 0 || message.length < 10}
            className="w-full"
          >
            {isSubmitting ? "Envoi en cours..." : "Publier mon avis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;