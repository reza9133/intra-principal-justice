import { SVGProps } from 'react';

export function CourtLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M24 2L42 12V32C42 41 24 46 24 46C24 46 6 41 6 32V12L24 2Z" fill="#1D4ED8" />
      <path d="M24 10V38" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 18H36" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
      <path d="M16 18L12 28C12 28 14 30 16 30C18 30 20 28 20 28L16 18Z" fill="#FFFFFF" />
      <path d="M32 18L28 28C28 28 30 30 32 30C34 30 36 28 36 28L32 18Z" fill="#FFFFFF" />
      <circle cx="24" cy="18" r="3" fill="#D97706" />
    </svg>
  );
}
