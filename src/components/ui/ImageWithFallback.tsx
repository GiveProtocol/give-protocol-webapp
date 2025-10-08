import React, { useState, useRef, useEffect } from "react";

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return undefined;

    const handleError = () => setImgSrc(fallbackSrc);
    img.addEventListener("error", handleError);

    return () => {
      img.removeEventListener("error", handleError);
    };
  }, [fallbackSrc]);

  return <img {...props} ref={imgRef} src={imgSrc} alt={alt} />;
};
