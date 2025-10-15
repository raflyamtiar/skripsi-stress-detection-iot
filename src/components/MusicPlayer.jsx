import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from "lucide-react";

const musicTracks = [
  {
    id: 1,
    title: "Peaceful Piano",
    artist: "Relaxing Music",
    duration: "3:45",
    cover:
      "https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    id: 2,
    title: "Nature Sounds",
    artist: "Calm Collection",
    duration: "4:20",
    cover:
      "https://images.pexels.com/photos/355288/pexels-photo-355288.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    id: 3,
    title: "Ocean Waves",
    artist: "Meditation Music",
    duration: "5:15",
    cover:
      "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    id: 4,
    title: "Soft Guitar",
    artist: "Acoustic Relax",
    duration: "3:30",
    cover:
      "https://images.pexels.com/photos/1010519/pexels-photo-1010519.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    id: 5,
    title: "Meditation Flow",
    artist: "Zen Music",
    duration: "6:00",
    cover:
      "https://images.pexels.com/photos/3571551/pexels-photo-3571551.jpeg?auto=compress&cs=tinysrgb&w=300",
  },
  {
    id: 6,
    title: "Forest Ambience",
    artist: "Nature Sounds",
    duration: "4:45",
    cover:
      "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=300",
    sound: "/sound/p3.mp4",
  },
];

export default function MusicPlayer({ isOpen, onClose }) {
  const [selectedTrack, setSelectedTrack] = useState(musicTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useState(null); // Menambahkan referensi untuk elemen audio

  if (!isOpen) return null;

  // Handle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying) {
      audioRef.current.pause(); // Pause jika sudah playing
    } else {
      audioRef.current.play(); // Play jika belum playing
    }
  };

  // Handle previous and next track
  const handlePrevious = () => {
    const currentIndex = musicTracks.findIndex(
      (t) => t.id === selectedTrack.id
    );
    const previousIndex =
      currentIndex > 0 ? currentIndex - 1 : musicTracks.length - 1;
    setSelectedTrack(musicTracks[previousIndex]);
  };

  const handleNext = () => {
    const currentIndex = musicTracks.findIndex(
      (t) => t.id === selectedTrack.id
    );
    const nextIndex =
      currentIndex < musicTracks.length - 1 ? currentIndex + 1 : 0;
    setSelectedTrack(musicTracks[nextIndex]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Musik Relaksasi</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 shadow-2xl">
              <img
                src={selectedTrack.cover}
                alt={selectedTrack.title}
                className="w-full aspect-square object-cover rounded-lg mb-4 shadow-lg"
              />
              <h2 className="text-2xl font-bold mb-2">{selectedTrack.title}</h2>
              <p className="text-gray-400 mb-4">{selectedTrack.artist}</p>

              <div className="mb-4">
                <div className="bg-gray-600 h-1 rounded-full mb-2">
                  <div className="bg-green-500 h-1 rounded-full w-1/3"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1:15</span>
                  <span>{selectedTrack.duration}</span>
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
                  className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                  style={{
                    accentColor: "#22c55e",
                  }}
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
                  onClick={() => setSelectedTrack(track)}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                    selectedTrack.id === track.id
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
                    {track.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} src={selectedTrack.sound} />
    </div>
  );
}
