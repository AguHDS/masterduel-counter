import mainLogo from "@/assets/home-rework/MDC_logo_full.webp";

interface MainLogoProps {
  asHeading?: boolean;
}

export const MainLogo = ({ asHeading = false }: MainLogoProps) => {
  const Wrapper = asHeading ? 'h1' : 'div';
  
  return (
    <div className="relative mt-2 w-full ">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center relative top-3">
          <Wrapper className="relative">
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
            {asHeading && (
              <span className="sr-only">
                Yu-Gi-Oh! Counter and Deck Guides for All Formats
              </span>
            )}
          </Wrapper>
        </div>
      </div>
    </div>
  );
};
