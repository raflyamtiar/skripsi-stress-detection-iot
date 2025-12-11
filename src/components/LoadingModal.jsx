import { motion, AnimatePresence } from "framer-motion";

export default function LoadingModal({
  isOpen,
  message = "Sedang memproses data...",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Animated spinner */}
              <div className="relative w-20 h-20">
                <motion.div
                  className="absolute inset-0 border-4 border-blue-200 rounded-full"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="absolute inset-2 border-4 border-transparent border-t-blue-400 rounded-full"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>

              {/* Message */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Mengklasifikasi Tingkat Stress
                </h3>
                <p className="text-gray-600">{message}</p>
              </div>

              {/* Animated dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-blue-600 rounded-full"
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
