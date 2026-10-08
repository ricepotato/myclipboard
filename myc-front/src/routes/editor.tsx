import clsx from "clsx";
import {
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { IoMdMenu } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase";
import { addClip, getClip, updateClip } from "../repository";

type Toast = { message: string; error?: boolean };

// 로그인하지 않았거나 오프라인이면 서버 반영은 나중에 이루어짐을 알려줌
const savedMessage = () =>
  auth.currentUser && navigator.onLine ? "저장됨" : "기기에 저장됨";

export default function Editor() {
  const navigate = useNavigate();
  // id가 있으면 기존 클립 수정 모드
  const { id } = useParams();
  const isEdit = id !== undefined;
  const [text, setText] = useState("");
  // 수정 모드에서 마지막으로 저장된 내용. 변경 여부 판단에 사용
  const [savedText, setSavedText] = useState("");
  const [loading, setLoading] = useState(isEdit);
  // 새 항목을 처음 저장하는 중. 중복 생성을 막기 위해 그동안 저장 버튼을 끔
  const [creating, setCreating] = useState(false);
  // 이 화면에서 방금 만든 항목의 id. 수정 모드로 바뀌어도 서버에서 다시 불러오지 않음
  const createdIdRef = useRef<string>();
  const [toast, setToast] = useState<Toast | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    textareaRef.current?.focus();
    return () => clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isEdit || id === createdIdRef.current) return;
    let cancelled = false;
    getClip(id)
      .then((clip) => {
        if (cancelled) return;
        if (!clip || clip.type.includes("image")) {
          navigate("/list", { replace: true });
          return;
        }
        setText(clip.text || "");
        setSavedText(clip.text || "");
        setLoading(false);
        // 로딩 중엔 textarea가 disabled라 포커스가 풀려 있으므로 다시 잡고 커서를 끝으로
        requestAnimationFrame(() => {
          const el = textareaRef.current;
          if (!el) return;
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        });
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) navigate("/list", { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate]);

  const showToast = (next: Toast) => {
    clearTimeout(toastTimerRef.current);
    setToast(next);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  };

  // 붙여넣은 이미지를 별도 항목으로 저장
  const save = async (clip: { text?: string; type: string; file?: File }) => {
    try {
      const result = await addClip(clip);
      showToast(
        result
          ? { message: savedMessage() }
          : { message: "저장 실패", error: true },
      );
    } catch (e) {
      console.error(e);
      showToast({ message: "저장 실패", error: true });
    }
  };

  // 새 항목은 저장 후에도 내용을 그대로 두고, 이 항목의 수정 모드로 전환.
  // 같은 화면을 계속 쓰므로 이어서 고치고 저장하면 같은 항목이 갱신됨
  const create = async (nextText: string) => {
    setCreating(true);
    try {
      const result = await addClip({ text: nextText, type: "text" });
      if (!result) {
        showToast({ message: "저장 실패", error: true });
        return;
      }
      createdIdRef.current = result.id;
      setSavedText(nextText);
      navigate(`/edit/${result.id}`, { replace: true });
      showToast({ message: savedMessage() });
    } catch (e) {
      console.error(e);
      showToast({ message: "저장 실패", error: true });
    } finally {
      setCreating(false);
    }
  };

  const update = async (clipId: string, nextText: string) => {
    try {
      const result = await updateClip(clipId, nextText);
      if (result) setSavedText(nextText);
      showToast(
        result
          ? { message: savedMessage() }
          : { message: "저장 실패", error: true },
      );
    } catch (e) {
      console.error(e);
      showToast({ message: "저장 실패", error: true });
    }
  };

  const canSave =
    !loading && !creating && !!text.trim() && (!isEdit || text !== savedText);

  const handleSave = () => {
    if (!canSave) return;
    // 저장 후에도 화면에 머무르며 내용을 유지
    if (isEdit) {
      update(id, text);
    } else {
      create(text);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    // 수정 모드에서는 텍스트만 다루므로 이미지 즉시 저장을 하지 않음
    if (isEdit) return;
    // 이미지는 붙여넣는 즉시 저장. 텍스트는 기본 동작대로 입력창에 삽입
    const imageItem = Array.from(event.clipboardData?.items || []).find(
      (item) => item.type.includes("image"),
    );
    const file = imageItem?.getAsFile();
    if (!file) return;
    event.preventDefault();
    save({ text: "image", type: "image", file });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <main className="relative h-[100dvh] w-full pretendard bg-slate-900">
      <button
        onClick={() => navigate("/list")}
        aria-label="목록 보기"
        className="fixed top-3 left-3 z-10 p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
      >
        <IoMdMenu className="size-7" />
      </button>

      <textarea
        name="clip_textarea"
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        disabled={loading}
        placeholder={loading ? "불러오는 중..." : "여기에 입력하세요..."}
        className="w-full h-full resize-none bg-transparent text-white text-3xl md:text-4xl leading-relaxed outline-none px-5 pt-16 pb-24 placeholder:text-slate-500"
      />

      {toast && (
        <div
          className={clsx(
            "fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm shadow-lg",
            toast.error
              ? "bg-red-600 text-white"
              : "bg-slate-700 text-slate-100",
          )}
        >
          {toast.message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!canSave}
        className="fixed bottom-6 right-6 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        저장
      </button>
    </main>
  );
}
