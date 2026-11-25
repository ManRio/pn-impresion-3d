import type { ImageLoaderProps } from 'next/image';

export default function cloudinaryLoader({
  src,
  width,
}: ImageLoaderProps): string {
  const marker = '/image/upload/';

  if (
    !src.startsWith('https://res.cloudinary.com/') ||
    !src.includes(marker)
  ) {
    return src;
  }

  return src.replace(
    marker,
    `${marker}f_auto,q_auto,c_limit,w_${width}/`,
  );
}
