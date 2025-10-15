import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import H5AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import musicTracks from "../constant/musicData";

export default function MusicPlayer({ isOpen, onClose }) {
  const [selectedTrack, setSelectedTrack] = useState(musicTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const playerRef = useRef(null);
  const shouldAutoplayNext = useRef(false);

  const progressPercent = useMemo(() => {
    if (!duration || duration === 0) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const fmt = (sec) => {
    if (!isFinite(sec)) return "0:00";
    const s = Math.max(0, Math.floor(sec));
    const mm = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  useEffect(() => {
    if (!isOpen && playerRef.current?.audio?.current) {
      playerRef.current.audio.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (playerRef.current?.audio?.current) {
      playerRef.current.audio.current.volume = volume / 100;
    }
  }, [volume, selectedTrack, isOpen]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [selectedTrack]);

  const handlePlayPause = () => {
    const audio = playerRef.current?.audio?.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handlePrevious = () => {
    const idx = musicTracks.findIndex((t) => t.id === selectedTrack.id);
    const prevIdx = idx > 0 ? idx - 1 : musicTracks.length - 1;
    shouldAutoplayNext.current = isPlaying;
    setSelectedTrack(musicTracks[prevIdx]);
  };

  const handleNext = () => {
    const idx = musicTracks.findIndex((t) => t.id === selectedTrack.id);
    const nextIdx = idx < musicTracks.length - 1 ? idx + 1 : 0;
    shouldAutoplayNext.current = isPlaying;
    setSelectedTrack(musicTracks[nextIdx]);
  };

  const handleSeekClick = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, clickX / rect.width));
    const audio = playerRef.current?.audio?.current;
    if (audio && duration > 0) {
      audio.currentTime = ratio * duration;
      setCurrentTime(audio.currentTime);
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    const audio = playerRef.current?.audio?.current;
    if (audio) audio.volume = val / 100;
  };

  const updateDuration = () => {
    const audio = playerRef.current?.audio?.current;
    if (!audio) return;
    const d = Number.isFinite(audio.duration) ? audio.duration : 0;
    if (d > 0) setDuration(d);
  };

  const onLoadedMetadata = () => {
    updateDuration();
    const audio = playerRef.current?.audio?.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime || 0);
    if (shouldAutoplayNext.current) {
      audio.play();
      shouldAutoplayNext.current = false;
    }
  };

  const onCanPlay = () => {
    updateDuration();
    if (shouldAutoplayNext.current && playerRef.current?.audio?.current) {
      playerRef.current.audio.current.play();
      shouldAutoplayNext.current = false;
    }
  };

  const onDurationChange = () => {
    updateDuration();
  };

  const onListen = () => {
    const audio = playerRef.current?.audio?.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime || 0);
  };

  const onEnded = () => {
    handleNext();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Musik Relaksasi</h1>
          <button
            onClick={() => {
              if (playerRef.current?.audio?.current) {
                playerRef.current.audio.current.pause();
              }
              setIsPlaying(false);
              onClose?.();
            }}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1 relative">
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 shadow-2xl md:sticky md:top-4">
              <img
                src={selectedTrack.cover}
                alt={selectedTrack.title}
                className="w-full aspect-square object-cover rounded-lg mb-4 shadow-lg"
              />
              <h2 className="text-2xl font-bold mb-2">{selectedTrack.title}</h2>
              <p className="text-gray-400 mb-4">{selectedTrack.artist}</p>

              <div className="mb-4">
                <div
                  className="bg-gray-600 h-1 rounded-full mb-2 cursor-pointer"
                  onClick={handleSeekClick}
                  title="Seek"
                >
                  <div
                    className="bg-green-500 h-1 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{fmt(currentTime)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={handlePrevious}
                  className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="bg-green-500 hover:bg-green-600 p-4 rounded-full transition-all shadow-lg hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#22c55e" }}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-4">Pilih Musik</h3>
            <div className="grid gap-3">
              {musicTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    shouldAutoplayNext.current = isPlaying;
                    setSelectedTrack(track);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${selectedTrack.id === track.id
                      ? "bg-green-500 bg-opacity-20 border border-green-500"
                      : "bg-gray-800 hover:bg-gray-700"
                    }`}
                >
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{track.title}</h4>
                    <p className="text-sm text-gray-400">{track.artist}</p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {selectedTrack.id === track.id ? fmt(duration) : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <H5AudioPlayer
        ref={playerRef}
        className="hidden"
        style={{ display: "none" }}
        src={selectedTrack.src}
        autoPlay={false}
        preload="auto"
        onLoadedMetadata={onLoadedMetadata}
        onCanPlay={onCanPlay}
        onDurationChange={onDurationChange}
        onListen={onListen}
        onEnded={onEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        listenInterval={250}
      />
    </div>
  );
}
