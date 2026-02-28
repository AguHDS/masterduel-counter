import type { HTMLAttributes, PropsWithChildren } from "react";
import instanceEditorBackground from "@/assets/instanceEditorAndProfile_background.webp";

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

  const contentClasses = [
    "relative z-10 w-full overflow-hidden rounded-[26px]",
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section {...sectionProps} className={sectionClasses}>
      <div
        className={`relative w-full rounded-[28px] p-[3px] bg-gradient-to-br from-[#ffa94d] via-[#ff7e29] to-[#ffce6d] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.5),0_20px_40px_-20px_rgba(0,0,0,0.5)] ${maxWidthClassName}`}
      >
        <div className="relative w-full overflow-hidden rounded-[26px] bg-black">
          <div className="absolute inset-0 w-full h-full">
            <img
              src={instanceEditorBackground}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover scale-105 pointer-events-none select-none opacity-40"
            />
          </div>

          <div className={contentClasses}>{children}</div>
        </div>
      </div>
    </section>
  );
};