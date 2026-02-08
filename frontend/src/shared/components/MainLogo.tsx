import mainLogo from "@/assets/Main_Logo.webp";

export const MainLogo = () => {
  return (
    <div className="relative mt-6 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <img
            src={mainLogo}
            alt="Masterduel Counter - Yu-Gi-Oh! Master Duel Archetype Counter Guide"
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
            "
          />
        </div>
      </div>
    </div>
  );
};
