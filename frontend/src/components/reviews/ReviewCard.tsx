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
    <Card className="hover:shadow-xl transition-shadow duration-300 border-l-4 border-orange-400">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-gray-800 truncate">
                {review.author_name}
              </h4>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {new Date(review.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pl-16">
        <p className="text-base text-gray-700 leading-relaxed italic">
          "{review.message}"
        </p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;