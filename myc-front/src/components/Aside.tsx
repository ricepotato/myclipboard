interface AsideProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Aside({ isOpen, onToggle }: AsideProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-700 shadow-xl transition-all duration-300 ease-in-out z-40 pretendard ${
        isOpen ? "w-80" : "w-16"
      }`}
    >
      <div className="h-full flex flex-col pt-20">
        {/* Sidebar Header */}
        <div
          className={`flex items-center px-4 py-3 border-b border-slate-700 ${
            isOpen ? "justify-between" : "flex-col gap-3"
          }`}
        >
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label={isOpen ? "사이드바 숨기기" : "사이드바 열기"}
          >
            <svg
              className="w-5 h-5 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
          <button
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="검색"
          >
            <svg
              className="w-5 h-5 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {/* Recent Items List */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">
              최근 목록
            </h3>
            {/* 여기에 최근 목록 아이템들이 들어갈 예정 */}
            <div className="space-y-2">
              {/* 예시 아이템 */}
              <div className="p-3 rounded-lg bg-slate-800 hover:bg-slate-750 cursor-pointer transition-colors">
                <p className="text-sm text-slate-300 line-clamp-2">
                  예시 텍스트입니다...
                </p>
                <span className="text-xs text-slate-500 mt-1">방금 전</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
