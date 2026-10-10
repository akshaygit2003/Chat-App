import { useState, useRef, useEffect } from "react";
import { BsPlayFill, BsPauseFill, BsDownload } from "react-icons/bs";
import { MdGraphicEq } from "react-icons/md";

const VoicePlayer = ({ audioUrl, duration = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    try {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `voice-message-${Date.now()}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(audioUrl, "_blank");
    }
  };

  const formatTime = (secs) => {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 bg-slate-800/80 rounded-2xl border border-slate-700/60 min-w-[190px] sm:min-w-[220px] max-w-[280px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play / Pause Button */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30 transition transform active:scale-95"
      >
        {isPlaying ? (
          <BsPauseFill className="w-5 h-5" />
        ) : (
          <BsPlayFill className="w-5 h-5 ml-0.5" />
        )}
      </button>

      {/* Scrubber and Visual Waveform */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-1.5 mb-1">
          <MdGraphicEq
            className={`w-4 h-4 ${
              isPlaying ? "text-cyan-400 animate-pulse" : "text-gray-400"
            }`}
          />
          <input
            type="range"
            min="0"
            max={totalDuration || 1}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-400 px-0.5 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Download Audio */}
      <button
        onClick={handleDownload}
        title="Download voice note"
        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition"
      >
        <BsDownload className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default VoicePlayer;
