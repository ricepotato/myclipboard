import { useState } from "react";
import Header from "@/components/Header";
import Aside from "@/components/Aside";
import { Textarea } from "@/components/ui/textarea";

export default function Main() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        <Textarea
          className="w-full h-full resize-none border-none focus-visible:ring-0 text-base p-6"
          placeholder="여기에 입력하세요..."
        />
      </main>
    </>
  );
}
