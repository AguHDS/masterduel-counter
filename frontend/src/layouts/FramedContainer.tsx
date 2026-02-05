import type { HTMLAttributes, PropsWithChildren } from "react";
import framedContainerBackground from "@/assets/FramedContainerBackground.png";
import framedContainerBorder from "@/assets/FramedContainerBorder.png";

interface FramedContainerProps extends HTMLAttributes<HTMLElement> {
  maxWidthClassName?: string;
  contentClassName?: string;
}

export const FramedContainer = ({
  children,
  className,
  maxWidthClassName = "max-w-[1120px]",
  contentClassName,
  ...sectionProps
}: PropsWithChildren<FramedContainerProps>) => {
  const sectionClasses = ["w-full flex justify-center", className].filter(Boolean).join(" ");
  const wrapperClasses = [
    "relative w-full overflow-hidden rounded-[26px]",
    maxWidthClassName,
  ]
    .filter(Boolean)
    .join(" ");
  const contentClasses = ["relative w-full", contentClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section {...sectionProps} className={sectionClasses}>
      <div className={wrapperClasses}>
        {/* Contenedor interno para el background con recorte */}
        <div className="absolute inset-0 overflow-hidden rounded-[26px]">
          <img
            src={framedContainerBackground}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-fill pointer-events-none select-none opacity-70"
          />
        </div>
        {/* Borde encima del background */}
        <img
          src={framedContainerBorder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-fill pointer-events-none select-none opacity-80 z-10"
        />
        {/* Contenido */}
        <div className={contentClasses}>{children}</div>
      </div>
    </section>
  );
};