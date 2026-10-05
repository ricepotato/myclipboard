import { useEffect, useLayoutEffect, useRef } from "react";
import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { getSavedScroll, saveScroll } from "../clipStore";
import Clips from "../components/Clips";
import Header from "../components/Header";
import useClip from "../hooks/useClip";

// 맨 위에서 이 거리 안으로 들어오면 이전 클립을 미리 불러옴
const LOAD_OLDER_THRESHOLD = 1200;
// 맨 아래에서 이 거리 안이면 "맨 아래를 보는 중"으로 간주
const BOTTOM_THRESHOLD = 80;

const scrollHeight = () => document.documentElement.scrollHeight;
const isAtBottom = () => window.innerHeight + window.scrollY >= scrollHeight() - BOTTOM_THRESHOLD;

export default function List() {
  const navigate = useNavigate();
  const { clips, hasMore, loadOlder, refreshLatest, removeClip } = useClip();

  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;
  // 직전 렌더 시점의 첫 클립 id와 문서 높이. 앞에 클립이 붙었는지 판단하고 스크롤을 보정하는 데 사용
  const firstIdRef = useRef<string>();
  const heightRef = useRef(0);
  const atBottomRef = useRef(true);

  const maybeLoadOlder = () => {
    if (hasMoreRef.current && window.scrollY < LOAD_OLDER_THRESHOLD) {
      loadOlder();
    }
  };

  // 처음 열면 맨 아래(최신), 다녀온 경우엔 보던 위치로
  useLayoutEffect(() => {
    // 앞에 붙인 만큼 직접 보정하므로 브라우저의 자동 스크롤 보정은 끔
    const root = document.documentElement;
    const prevAnchor = root.style.overflowAnchor;
    root.style.overflowAnchor = "none";

    const saved = getSavedScroll();
    window.scrollTo(0, !saved || saved.atBottom ? scrollHeight() : saved.y);
    atBottomRef.current = isAtBottom();

    // 다른 기기에서 추가된 클립 등을 조용히 반영
    refreshLatest();

    return () => {
      root.style.overflowAnchor = prevAnchor;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      atBottomRef.current = isAtBottom();
      saveScroll({ y: window.scrollY, atBottom: atBottomRef.current });
      maybeLoadOlder();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 목록이 바뀌면 화면에 그려지기 전에 스크롤 위치를 맞춤
  useLayoutEffect(() => {
    const prevFirstId = firstIdRef.current;
    const prevHeight = heightRef.current;
    const prepended =
      prevFirstId !== undefined &&
      clips[0]?.id !== prevFirstId &&
      clips.some((clip) => clip.id === prevFirstId);

    if (prepended) {
      // 위에 붙은 만큼 내려서 보던 내용이 그대로 보이게 함
      window.scrollBy(0, scrollHeight() - prevHeight);
    } else if (atBottomRef.current) {
      // 맨 아래를 보고 있었다면 새로 추가된 최신 클립까지 따라 내려감
      window.scrollTo(0, scrollHeight());
    }

    firstIdRef.current = clips[0]?.id;
    heightRef.current = scrollHeight();
    saveScroll({ y: window.scrollY, atBottom: atBottomRef.current });
    // 화면이 다 차지 않았거나 여전히 맨 위 근처면 계속 불러옴
    maybeLoadOlder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips]);

  return (
    <>
      <Header onRefresh={refreshLatest} />
      <main className="h-full pretendard">
        <div className="relative">
          <div className="p-4 pb-24 pt-24">
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
