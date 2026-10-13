interface Icon3DProps {
  src: string;
  alt: string;
}

/** Floating 3D-rendered section icon (hover = tilt pop). */
export default function Icon3D({ src, alt }: Icon3DProps) {
  return (
    <span className="shrink-0 inline-block transition-transform duration-300 hover:scale-110 hover:-rotate-6">
      <img
        src={src}
        alt={alt}
        width={112}
        height={112}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain animate-float-3d drop-shadow-[0_14px_22px_rgba(220,38,38,0.35)] select-none"
      />
    </span>
  );
}
