import { SVGProps } from 'react';

export function GenLayerLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M40 30L20 10V50L40 30Z" fill="currentColor" />
      <path d="M60 30L80 10V50L60 30Z" fill="currentColor" />
      <circle cx="50" cy="30" r="10" fill="currentColor" />
      <text x="100" y="38" fontSize="24" fontWeight="bold" fill="currentColor">GenLayer</text>
    </svg>
  );
}
