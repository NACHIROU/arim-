import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, User } from 'lucide-react';

interface Review {
  author_name: string;
  rating: number;
  message: string;
  created_at: string;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-foreground truncate">
                {review.author_name}
              </h4>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(review.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < review.rating 
                      ? 'text-warning fill-warning' 
                      : 'text-muted fill-muted'
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                {review.rating}/5
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">
          "{review.message}"
        </p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;