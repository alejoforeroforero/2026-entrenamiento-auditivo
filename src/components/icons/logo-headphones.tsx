export function LogoHeadphones({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      <path
        d="M8,22 Q8,8 20,8 Q32,8 32,22"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="4" y="20" width="10" height="16" rx="3" />
      <rect x="6" y="23" width="6" height="10" rx="2" opacity="0.3" />
      <rect x="26" y="20" width="10" height="16" rx="3" />
      <rect x="28" y="23" width="6" height="10" rx="2" opacity="0.3" />
    </svg>
  );
}
