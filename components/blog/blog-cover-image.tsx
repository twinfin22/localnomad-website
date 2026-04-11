'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BlogCoverImageProps {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function BlogCoverImage({ src, alt, sizes, priority, className }: BlogCoverImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return <div className="h-full w-full bg-gradient-to-br from-[#1B4965]/10 to-[#1B4965]/5" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setError(true)}
    />
  );
}
