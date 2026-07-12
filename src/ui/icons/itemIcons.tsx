/**
 * Ícones vetoriais de fallback — usados quando a arte ilustrada de um item
 * ainda não existe em `public/items/` (ver docs/design/14-arte-de-itens.md).
 * Traço simples (`currentColor`), sem dependência externa.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SwordIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 2v13.5" />
      <path d="M8.5 6h7" />
      <path d="M9 19.5 12 22l3-2.5" />
      <path d="M12 15.5 9 19.5h6l-3-4Z" />
    </Base>
  );
}

export function AxeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 3c4 .5 6.5 3 6.5 6.5-3.5 0-6-2.5-6.5-6.5Z" />
      <path d="M12 8v13" />
      <path d="M9.5 21h5" />
    </Base>
  );
}

export function BowIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 3c6 3 6 15 0 18" />
      <path d="M6 3l12 9L6 21" opacity={0.55} />
    </Base>
  );
}

export function MaceIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="6" r="3.4" />
      <path d="M12 9.3V21" />
      <path d="M9.5 21h5" />
    </Base>
  );
}

export function WeaponGenericIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 2v20" />
      <path d="M8 6h8" />
      <path d="M9 21h6" />
    </Base>
  );
}

export function HelmetIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 14a8 8 0 0 1 16 0v3H4v-3Z" />
      <path d="M4 17h16" />
      <path d="M12 6v3" />
    </Base>
  );
}

export function ChestIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 4 12 6l6-2v9c0 5-3 8-6 9-3-1-6-4-6-9V4Z" />
      <path d="M12 6v12" />
    </Base>
  );
}

export function GlovesIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7 11V6a1.5 1.5 0 0 1 3 0v4" />
      <path d="M10 10V5a1.5 1.5 0 0 1 3 0v5" />
      <path d="M13 10V6a1.5 1.5 0 0 1 3 0v5" />
      <path d="M7 11a4 4 0 0 0-1 2.6c0 3.5 2.6 6.4 6 6.4h1c3 0 5-2.2 5-5v-4" />
    </Base>
  );
}

export function BootsIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 3v9.5l-4.5 3A2 2 0 0 0 3.6 17H15a1 1 0 0 0 1-1v-3.5" />
      <path d="M9 3h7v9.5" />
    </Base>
  );
}

export function WingsIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 5c3 3 8 3 9 1-1 6-4 9-9 11-5-2-8-5-9-11 1 2 6 2 9-1Z" />
      <path d="M12 5v11" opacity={0.5} />
    </Base>
  );
}

export function RingIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="14" r="6" />
      <path d="M9.5 8 12 3l2.5 5" />
    </Base>
  );
}

export function AmuletIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 3c1.5 3 4 4.5 6 4.5S16.5 6 18 3" />
      <circle cx="12" cy="15" r="5" />
    </Base>
  );
}

export function OffhandIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3c4.5 1 7 3 7 6.5C19 16 16 20 12 22 8 20 5 16 5 9.5 5 6 7.5 4 12 3Z" />
    </Base>
  );
}
