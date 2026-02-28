import type { HTMLAttributes, PropsWithChildren } from "react";

interface ListFramedContainerProps extends HTMLAttributes<HTMLElement> {
  maxWidthClassName?: string;
  contentClassName?: string;
}

export const ListFramedContainer = ({
  children,
  className,
  maxWidthClassName = "max-w-[1456px]",
  contentClassName,
  ...sectionProps
}: PropsWithChildren<ListFramedContainerProps>) => {
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
        className={`relative w-full rounded-[28px] p-[3px] ${maxWidthClassName}`}
      >
        <div className="relative w-full overflow-hidden">
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950/40 via-slate-950/40 to-slate-950/40 border-y-2 border-blue-700/90" />
          <div className={contentClasses}>{children}</div>
        </div>
      </div>
    </section>
  );
};
