import { LoadMoreButton, RefreshCheckButton } from "@/components/buttons";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Clips from "../components/Clips";
import { ClipboardForm } from "../components/form";
import useClip from "../hooks/useClip";
import { addClip } from "../repository";

export default function Root() {
  const mainRef = useRef<HTMLDivElement>(null);
  const { clips, setClips, pending, newClip, getClipsData, getClipsMore } =
    useClip();

  useEffect(() => {
    if (newClip) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [newClip, clips]);

  const onSubmit = async (data: FormData) => {
    const dataText = data.get("data");
    const type = data.get("type");
    const file = data.get("file");
    if (type === null || type === undefined) {
      console.warn("No type");
      return;
    }

    await addClip({
      text: dataText ? dataText.toString() : undefined,
      type: type.toString(),
      file: file ? (file as File) : undefined,
    });

    await getClipsData();
  };

  useEffect(() => {
    const handleScroll = () => {
      console.log("scrolling");
      const { scrollTop, offsetHeight } = document.documentElement;
      console.log(scrollTop);
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

  const onDelete = (id: string) => {
    setClips((prev) => prev.filter((clip) => clip.id !== id));
  };
  return (
    <>
      <header className="fixed w-full flex items-center justify-between p-4 z-50 bg-gray-900">
        <div>
          <RefreshCheckButton onClick={getClipsMore} />
        </div>
        <div>
          <Link to="/login">Login</Link>
        </div>
      </header>
      <main className="h-full" ref={mainRef}>
        <div className="relative">
          <div className="p-4 pb-20 pt-16">
            <LoadMoreButton
              onClick={() => {
                getClipsMore();
              }}
              pending={pending}
            />

            <Clips clips={clips} onDelete={onDelete} />
          </div>
          <ClipboardForm onSubmit={onSubmit} />
        </div>
      </main>
    </>
  );
}
