// Mock for @/components/charity/PhotosCard
// Renders a simple div with data-testid for assertions.
export const PhotosCard = ({
  ein: _ein,
  photo1Url: _photo1Url,
  photo2Url: _photo2Url,
  claimedByUserId: _claimedByUserId,
  onPhotoUploaded: _onPhotoUploaded,
}) => <div data-testid="photos-card">Photos</div>;
