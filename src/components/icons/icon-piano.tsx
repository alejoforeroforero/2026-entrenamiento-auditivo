export function IconPiano({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
    >
      {/* Base del teclado */}
      <rect x="2" y="6" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />

      {/* Teclas blancas (separadores) */}
      <line x1="5.5" y1="6" x2="5.5" y2="20" stroke="currentColor" strokeWidth="1" />
      <line x1="9" y1="6" x2="9" y2="20" stroke="currentColor" strokeWidth="1" />
      <line x1="12.5" y1="6" x2="12.5" y2="20" stroke="currentColor" strokeWidth="1" />
      <line x1="16" y1="6" x2="16" y2="20" stroke="currentColor" strokeWidth="1" />
      <line x1="19.5" y1="6" x2="19.5" y2="20" stroke="currentColor" strokeWidth="1" />

      {/* Teclas negras */}
      <rect x="4" y="6" width="2.5" height="8" rx="0.5" />
      <rect x="7.5" y="6" width="2.5" height="8" rx="0.5" />
      <rect x="14.5" y="6" width="2.5" height="8" rx="0.5" />
      <rect x="18" y="6" width="2.5" height="8" rx="0.5" />
    </svg>
  );
}
