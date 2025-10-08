import React, { useState, useRef, useEffect } from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return undefined;

    const handleError = () => setError(true);
    img.addEventListener("error", handleError);

    return () => {
      img.removeEventListener("error", handleError);
    };
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span className="text-2xl font-bold">GP</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src="/logo.svg"
      alt="Give Protocol"
      className={className}
      width={32}
      height={32}
    />
  );
};
