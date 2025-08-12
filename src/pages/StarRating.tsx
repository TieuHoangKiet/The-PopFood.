// components/StarRating.tsx
import React from 'react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'md' }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;

  const sizeClasses = {
    sm: 'fs-6',
    md: 'fs-5',
    lg: 'fs-4',
  };

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <i key={i} className={`bi bi-star-fill text-warning ${sizeClasses[size]}`}></i>
    );
  }

  if (hasHalf) {
    stars.push(
      <i key="half" className={`bi bi-star-half text-warning ${sizeClasses[size]}`}></i>
    );
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <i key={`empty-${i}`} className={`bi bi-star text-muted ${sizeClasses[size]}`}></i>
    );
  }

  return <div>{stars}</div>;
};

export default StarRating;