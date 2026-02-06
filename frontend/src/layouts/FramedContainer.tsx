import type { HTMLAttributes, PropsWithChildren } from "react";
import framedContainerBackground from "@/assets/FramedContainerBackground.webp";
import framedContainerBorder from "@/assets/FramedContainerBorder.webp";

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
  const sectionClasses = ["w-full flex justify-center", className]
    .filter(Boolean)
    .join(" ");

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
        <div className="absolute inset-0 overflow-hidden rounded-[26px]">
          <img
            src={framedContainerBackground}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-fill pointer-events-none select-none opacity-70"
          />
        </div>

        <img
          src={framedContainerBorder}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-fill pointer-events-none select-none opacity-80 z-10"
        />

        {/* Contenido */}
        <div className={contentClasses}>{children}</div>
      </div>
    </section>
  );
};
