interface BanInfoSectionProps {
  banReason?: string | null;
  banExpires?: string | null;
}

export const BanInfoSection = ({
  banReason,
  banExpires,
}: BanInfoSectionProps) => {
  return (
    <div className="mt-6">
      <label className="block text-sm font-medium text-red-300 mb-2">
        Ban Information
      </label>
      <div className="bg-red-900/10 border border-red-800/30 rounded-lg p-4">
        <div className="space-y-2">
          {banReason && (
            <div>
              <span className="text-sm font-medium text-red-300">Reason:</span>
              <p className="text-red-200 mt-1">{banReason}</p>
            </div>
          )}
          {banExpires && (
            <div>
              <span className="text-sm font-medium text-red-300">Expires:</span>
              <p className="text-red-200 mt-1">
                {new Date(banExpires).toLocaleString()}
                {new Date(banExpires) < new Date() && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                    Expired
                  </span>
                )}
              </p>
            </div>
          )}
          {!banExpires && <p className="text-red-200 text-sm">Permanent ban</p>}
        </div>
      </div>
    </div>
  );
};
