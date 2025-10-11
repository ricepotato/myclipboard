import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Aside from "@/components/Aside";
import { Textarea } from "@/components/ui/textarea";

export default function Main() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [content, setContent] = useState("");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSave = () => {
    // TODO: 저장 로직 구현
    console.log("저장:", content);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content]);

  return (
    <>
      <Aside isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <Header />

      {/* Main content area */}
      <main
        className={`h-screen pt-20 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-80" : "ml-16"
        }`}
      >
        <div className="w-full h-full relative">
          <Textarea
            className="w-full h-full resize-none border-none focus-visible:ring-0 text-base p-6 pb-24"
            placeholder="여기에 입력하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Save Button */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleSave}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              <span>저장</span>
              <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-white/20 rounded text-xs">
                <span>⌘</span>
                <span>S</span>
              </div>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
