import { LoadMoreButton } from "@/components/buttons";
import { useEffect, useRef } from "react";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Clips from "../components/Clips";
import useClip from "../hooks/useClip";
import Header from "../components/Header";

export default function List() {
  const navigate = useNavigate();
  const mainRef = useRef<HTMLDivElement>(null);
  const { clips, removeClip, pending, newClip, getClipsMore } = useClip();

  useEffect(() => {
    if (newClip) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [newClip, clips]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop } = document.documentElement;
      // if (window.innerHeight + scrollTop >= offsetHeight) {
      //   console.log("fetching more");
      // }
      if (scrollTop <= 500) {
        //console.log("fetching more");
        //fetchClipsDataMore();
      }
    };
    console.log("adding event listener");
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Header onRefresh={getClipsMore} />
      <main className="h-full pretendard" ref={mainRef}>
        <div className="relative">
          <div className="p-4 pb-24 pt-24">
            <LoadMoreButton
              onClick={() => {
                getClipsMore();
              }}
              pending={pending}
            />

            <Clips clips={clips} onDelete={removeClip} />
          </div>
          <button
            onClick={() => navigate("/")}
            aria-label="새 메모"
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <IoMdAdd className="size-7" />
          </button>
        </div>
      </main>
    </>
  );
}
