import type { HTMLAttributes, PropsWithChildren } from "react";
import mainContainerImg from "@/assets/Masterduel_Maincontainer_v2.webp";

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
        <img
          src={mainContainerImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-fill pointer-events-none select-none opacity-60"
        />
        <div className={contentClasses}>{children}</div>
      </div>
    </section>
  );
};
