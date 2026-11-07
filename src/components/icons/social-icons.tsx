// Lucide dropped brand/logo icons; these small inline marks fill that gap
// for the footer's social links.
import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
    >
      <path d="M14 9h2.5V6H14c-1.93 0-3.5 1.57-3.5 3.5V12H8v3h2.5v6h3v-6H16l.5-3h-3V9.5c0-.28.22-.5.5-.5Z" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <path d="M4 3h3.6l4.1 5.4L16.4 3H20l-6.2 7.9L20.4 21h-3.6l-4.5-5.9L7 21H3.4l6.6-8.4L4 3Z" />
    </svg>
  );
}
