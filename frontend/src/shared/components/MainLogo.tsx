import mainLogo from "@/assets/home-rework/MDC_logo_full.webp";

export const MainLogo = () => {
  return (
    <div className="relative mt-6 w-full mb-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center relative top-3">
          <div className="relative">
            <img
              src={mainLogo}
              alt="Masterduel Counter - Yu-Gi-Oh! Master Duel Archetype Counter Guides"
              loading="eager"
              decoding="async"
              width={800}
              height={180}
              className="
                w-auto
                h-20
                sm:h-20
                md:h-24
                lg:h-28
                xl:h-32
                max-w-full
                object-contain
                relative
                z-10
                mx-auto
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
};
