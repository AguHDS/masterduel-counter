import mainLogo from "@/assets/home-rework/Main_Logo_Extended.webp";

export const MainLogo = () => {
  return (
    <div className="relative mt-6 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start items-center relative top-3 max-[1279px]:justify-center">
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
                ml-4
                sm:mr-20
                md:mr-20
                lg:mr-32
                xl:ml-48
                mb-1
                max-[1279px]:mx-auto
                max-[1279px]:ml-0
              "
            />
            
            <div className="
              absolute 
              text-center 
              z-20 
              w-max
              left-1/2 
              -translate-x-1/2
              top-20
              /* Ajustes para pantallas grandes (≥1280px) */
              xl:top-20
              xl:ml-[90px]
              /* Ajustes para 1024px - 1279px */
              lg:top-[68px]
              lg:ml-[5px]
              /* Ajustes para tablets (768px - 1023px) */
              md:top-[54px]
              md:ml-8
              /* Ajustes para móvil/tablet pequeño (≤1279px) - Subtítulo más a la derecha */
              max-[1279px]:ml-[60px]
              /* Ajustes específicos para ≤1024px (mantener comportamiento original) */
              max-[1024px]:top-14
              max-[1024px]:ml-20
              max-[768px]:top-12
              max-[768px]:ml-5
              max-[640px]:top-12
              max-[640px]:ml-12
            ">
              <p className="
                text-yellow-500 
                font-semibold 
                tracking-wide 
                whitespace-nowrap 
                rounded-full 
                backdrop-blur-sm
                text-xs
                sm:text-sm
                md:text-base
                lg:text-lg
              ">
                Beat the meta. Find Counters. Master Decks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};