
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
        <Avatar className="h-10 w-10 ring-2 ring-orange-100">
          <AvatarFallback className="bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 font-medium">
            {review.author_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <CardTitle className="text-sm font-semibold text-gray-900">{review.author_name}</CardTitle>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 transition-colors ${
                  i < review.rating 
                    ? 'text-amber-400 fill-amber-400' 
                    : 'text-gray-200 fill-gray-200'
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(review.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 leading-relaxed italic">
          "{review.message}"
        </p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
