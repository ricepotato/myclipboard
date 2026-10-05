import clsx from "clsx";
import { ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { IoMdMenu } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { addClip } from "../repository";

type Toast = { message: string; error?: boolean };

export default function Editor() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    textareaRef.current?.focus();
    return () => clearTimeout(toastTimerRef.current);
  }, []);

  const showToast = (next: Toast) => {
    clearTimeout(toastTimerRef.current);
    setToast(next);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  };

  // 저장은 백그라운드에서 진행하고, 입력창은 즉시 비워 다음 입력을 받음
  const save = async (clip: { text?: string; type: string; file?: File }) => {
    try {
      const result = await addClip(clip);
      showToast(result ? { message: "저장됨" } : { message: "저장 실패", error: true });
    } catch (e) {
      console.error(e);
      showToast({ message: "저장 실패", error: true });
    }
  };

  const handleSave = () => {
    if (!text.trim()) return;
    save({ text, type: "text" });
    setText("");
    textareaRef.current?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    // 이미지는 붙여넣는 즉시 저장. 텍스트는 기본 동작대로 입력창에 삽입
    const imageItem = Array.from(event.clipboardData?.items || []).find(
      (item) => item.type.includes("image")
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
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        placeholder="여기에 입력하세요..."
        className="w-full h-full resize-none bg-transparent text-white text-3xl md:text-4xl leading-relaxed outline-none px-5 pt-16 pb-24 placeholder:text-slate-500"
      />

      {toast && (
        <div
          className={clsx(
            "fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm shadow-lg",
            toast.error ? "bg-red-600 text-white" : "bg-slate-700 text-slate-100"
          )}
        >
          {toast.message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!text.trim()}
        className="fixed bottom-6 right-6 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        저장
      </button>
    </main>
  );
}
