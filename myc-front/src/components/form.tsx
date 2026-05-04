"use client";

import { ClipboardEvent, KeyboardEvent, useRef, useState } from "react";
import { FaRegPaste } from "react-icons/fa6";
import { IoIosSend, IoMdAdd } from "react-icons/io";

const MIN_HEIGHT = 56;

export function ClipboardForm({
  onSubmit,
}: {
  onSubmit?: (data: FormData) => void;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [data, setData] = useState<string>("");
  const [imageData, setImageData] = useState<string>("");
  const [type, setType] = useState<"text" | "image">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const style = getComputedStyle(textarea);
    const lineHeight = parseFloat(style.lineHeight);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);
    const maxHeight = lineHeight * 5 + paddingTop + paddingBottom;
    textarea.style.height = "auto";
    textarea.style.height =
      Math.min(Math.max(textarea.scrollHeight, MIN_HEIGHT), maxHeight) + "px";
  };

  const resetHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = MIN_HEIGHT + "px";
  };

  const submitText = (text: string) => {
    const formData = new FormData();
    formData.append("type", "text");
    formData.append("data", text);
    onSubmit?.(formData);
  };

  const submitImage = (blob: Blob) => {
    console.log(`submitImage ${blob}`);
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("type", "image");
    formData.append("data", "image");
    onSubmit?.(formData);
  };

  const submitClipboard = async () => {
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        const blob = await clipboardItem.getType(type);
        if (type === "text/plain") {
          submitText(await blob.text());
          return;
        }

        if (type === "image/png") {
          submitImage(blob);
          return;
        }
      }
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    Array.from(items || []).forEach((item) => {
      if (item.type.includes("image")) {
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = function (event) {
          if (typeof event.target?.result === "string") {
            //setImage(event.target?.result); // preview
          }
          setType("image");
        };
        if (blob !== null) {
          submitImage(blob);
          setData("");
          setImageData("");
          resetHeight();
        }
      } else if (item.type.includes("text/plain")) {
        item.getAsString((str) => {
          submitText(str);
          setData("");
          setImageData("");
          resetHeight();
        });
      }
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (!isMobile && !e.shiftKey) {
      e.preventDefault();
      if (data.trim()) formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="fixed bottom-0 w-full box-border bg-slate-900">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSubmit) onSubmit(new FormData(e.target as HTMLFormElement));
          setData("");
          resetHeight();
        }}
        ref={formRef}
      >
        <div>
          <div>
            {image !== null ? <img src={image} alt={"preview"} /> : null}
          </div>
          <div className="flex justify-between items-stretch">
            <input type="hidden" name="type" value={type} />
            <input
              aria-label="fileInput"
              id="fileInput"
              type="file"
              name="file"
              onChange={(e) => {
                submitImage(e.target.files?.[0] as Blob);
              }}
              value={imageData}
              className="hidden"
              ref={fileInputRef}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-14 flex justify-center items-center cursor-pointer border flex-shrink-0"
            >
              <IoMdAdd className="text-lg" />
            </div>
            <div className="border flex-grow">
              <textarea
                ref={textareaRef}
                onChange={(e) => {
                  setData(e.target.value);
                  adjustHeight();
                }}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                value={data}
                id="dataInput"
                placeholder="Input your data"
                name="data"
                rows={1}
                style={{ height: MIN_HEIGHT + "px" }}
                className="w-full px-3 py-2 text-sm leading-tight bg-transparent text-white outline-none appearance-none focus:outline-none resize-none overflow-y-auto"
              />
            </div>

            {data !== "" ? (
              <div
                onClick={() => formRef.current?.requestSubmit()}
                className="w-14 flex justify-center items-center cursor-pointer border flex-shrink-0"
              >
                <IoIosSend className="text-lg" />
              </div>
            ) : (
              <div
                onClick={submitClipboard}
                className="w-14 flex justify-center items-center cursor-pointer border flex-shrink-0"
              >
                <FaRegPaste className="text-lg" />
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
