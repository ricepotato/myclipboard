export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col items-center gap-6">
        {/* Logo with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-20"></div>
          </div>
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
            <svg
              className="w-10 h-10 text-white animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold text-white animate-pulse">
          MyClipboard
        </h1>

        {/* Loading Spinner */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce"></div>
        </div>

        {/* Loading Text */}
        <p className="text-slate-400 text-sm animate-pulse">로딩 중...</p>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-loading-bar"></div>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
