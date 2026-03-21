import mainLogo from "@/assets/home-rework/Main_Logo_Extended.webp";

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
            
            <div className="
              absolute 
              text-center 
              z-20 
              w-max
              left-1/2
              ml-14 
              -translate-x-1/2
              top-20
              sm:top-16
              md:top-[68px]
              lg:top-20
              xl:top-20
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
                Find Counters. Learn Combos. Build Decks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};