import MDCBackground from "@/assets/HomeAllPages_Background2.webp";

interface MaintenanceScreenProps {
  message?: string | null;
}

/** Full-screen "we're doing some improvements" shown to regular users while maintenance is active */
export const MaintenanceScreen = ({ message }: MaintenanceScreenProps) => {
  return (
    <div className="min-h-screen bg-black/70 relative flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${MDCBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-xl">

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          We're doing some improvements
        </h1>
        <p className="mt-4 text-slate-300 text-lg">
          The site is getting a quick upgrade to improve the user experience. Come back soon!
        </p>
        {message && (
          <p className="mt-3 text-slate-400 text-sm italic">{message}</p>
        )}
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
        </div>
      </div>
    </div>
  );
};