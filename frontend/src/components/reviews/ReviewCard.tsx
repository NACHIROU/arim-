import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Avatar>
          <AvatarFallback>{review.author_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle className="text-sm font-medium">{review.author_name}</CardTitle>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{review.message}</p>
        <p className="text-xs text-gray-400 mt-2">
          {new Date(review.created_at).toLocaleDateString('fr-FR')}
        </p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;