import type { HTMLAttributes, PropsWithChildren } from "react";

interface FramedContainerProps extends HTMLAttributes<HTMLElement> {
  maxWidthClassName?: string;
  contentClassName?: string;
}

/** Container that wraps content in a gradient-framed box with configurable dimensions */
export const FramedContainer = ({
  children,
  className,
  maxWidthClassName = "max-w-[1456px]",
  contentClassName,
  ...sectionProps
}: PropsWithChildren<FramedContainerProps>) => {
  const sectionClasses = ["w-full flex justify-center"]
    .filter(Boolean)
    .join(" ");

  const contentClasses = [
    "relative z-10 w-full overflow-hidden rounded-[26px]",
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  // Default border is blue, can be overridden by passing border class in className
  const borderClass = className || "border-slate-500/20";

  return (
    <section {...sectionProps} className={sectionClasses}>
      <div
        className={`relative w-full rounded-[28px] p-[3px] ${maxWidthClassName}`}
      >
        <div className="relative w-full overflow-hidden">
          {/* Background with gradient overlay */}
          <div className={`absolute inset-0 w-full h-full bg-indigo-950/30 border-[2px] ${borderClass}`} />
          <div className={contentClasses}>{children}</div>
        </div>
      </div>
    </section>
  );
};
