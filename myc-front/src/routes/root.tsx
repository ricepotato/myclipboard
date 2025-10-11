import { LoadMoreButton, RefreshCheckButton } from "@/components/buttons";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Clips from "../components/Clips";
import { ClipboardForm } from "../components/form";
import useClip from "../hooks/useClip";
import { addClip } from "../repository";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Root() {
  const mainRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { clips, setClips, pending, newClip, getClipsData, getClipsMore } =
    useClip();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest(".user-menu-container")) {
          setShowUserMenu(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

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

  const handleLogout = async () => {
    const ok = window.confirm("로그아웃 하시겠습니까?");
    if (ok) {
      await auth.signOut();
      navigate("/login");
    }
  };

  return (
    <>
      <header className="fixed w-full flex items-center justify-between px-6 py-4 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
            <h1 className="text-xl font-bold text-white">MyClipboard</h1>
          </div>
          <RefreshCheckButton onClick={getClipsMore} />
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-lg"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-800 border border-slate-700 shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-slate-700">
                    <p className="text-sm font-medium text-white truncate">
                      {user.displayName || "사용자"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                로그인
              </button>
            </Link>
          )}
        </div>
      </header>
      <main className="h-full" ref={mainRef}>
        <div className="relative">
          <div className="p-4 pb-20 pt-24">
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
