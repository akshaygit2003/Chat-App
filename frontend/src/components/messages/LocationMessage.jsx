import { MdLocationOn, MdOpenInNew } from "react-icons/md";

const LocationMessage = ({ location }) => {
  if (!location || !location.latitude || !location.longitude) return null;

  const { latitude, longitude, address } = location;
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-slate-800 border border-slate-700/80 shadow-md">
      {/* Map visual card */}
      <div className="relative h-28 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-3 text-center border-b border-slate-700/60">
        {/* Background grid design */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />

        <div className="relative flex flex-col items-center gap-1 z-10">
          <div className="p-2.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/30 animate-bounce">
            <MdLocationOn className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono text-gray-300">
            {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
          </span>
        </div>
      </div>

      {/* Info & action */}
      <div className="p-3 bg-slate-850 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {address || "Shared Location"}
          </p>
          <p className="text-[10px] text-gray-400">GPS Coordinates</p>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition shrink-0"
        >
          <span>Maps</span>
          <MdOpenInNew className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default LocationMessage;
