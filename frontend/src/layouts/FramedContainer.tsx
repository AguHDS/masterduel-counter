import type { HTMLAttributes, PropsWithChildren } from "react";
import framedContainerBackground from "@/assets/FramedContainerBackground.webp";

interface FramedContainerProps extends HTMLAttributes<HTMLElement> {
  maxWidthClassName?: string;
  contentClassName?: string;
}

export const FramedContainer = ({
  children,
  className,
  maxWidthClassName = "max-w-[1456px]",
  contentClassName,
  ...sectionProps
}: PropsWithChildren<FramedContainerProps>) => {
  const sectionClasses = ["w-full flex justify-center", className]
    .filter(Boolean)
    .join(" ");

  const wrapperClasses = [
    "relative w-full rounded-[28px] p-[3px] bg-gradient-to-br from-[#ffa94d] via-[#ff7e29] to-[#ffce6d] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.5),0_20px_40px_-20px_rgba(0,0,0,0.5)]",
    maxWidthClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const contentClasses = [
    "relative w-full overflow-hidden rounded-[26px]",
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section {...sectionProps} className={sectionClasses}>
      <div className={wrapperClasses}>
        <div className="relative w-full overflow-hidden rounded-[26px] bg-black">
          {/* Imagen de fondo con escala forzada */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={framedContainerBackground}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover scale-105 pointer-events-none select-none opacity-70"
            />
          </div>

          {/* Contenido */}
          <div className={`${contentClasses} relative z-10`}>{children}</div>
        </div>
      </div>
    </section>
  );
};
