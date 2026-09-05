// Marca geométrica mínima para el logo: un triángulo de "play" simplificado
// dentro de un cuadrado de trazo, en el mismo espíritu que el cuarto-de-
// círculo-con-punto de la referencia, pero con motivo de cine.
export default function ReelMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="1" y="1" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 6.2 14 10 8 13.8Z" fill="currentColor" />
    </svg>
  );
}
