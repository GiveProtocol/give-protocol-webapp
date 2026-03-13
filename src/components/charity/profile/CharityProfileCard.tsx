import React from 'react';
import { CharityDetails } from '@/types/charity';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface CharityProfileCardProps {
  profile: CharityDetails;
}

/**
 * Renders a charity profile card displaying the charity's image, category, name, and description.
 *
 * @param {Object} props - The component props.
 * @param {CharityDetails} props.profile - The profile details of the charity.
 * @returns {JSX.Element} The rendered charity profile card component.
 */
const CharityProfileCard: React.FC<CharityProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {profile.image_url && (
        <ImageWithFallback
          src={profile.image_url}
          alt={profile.name}
          className="w-full h-48 object-cover"
          fallbackSrc="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800"
        />
      )}
      <div className="p-6">
        <span className="text-sm font-medium text-emerald-600">
          {profile.category}
        </span>
        <h3 className="mt-2 text-xl font-semibold text-gray-900">
          {profile.name}
        </h3>
        <p className="mt-2 text-gray-600">
          {profile.description}
        </p>
      </div>
    </div>
  );
};

export default CharityProfileCard;