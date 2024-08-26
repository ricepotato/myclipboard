"use client";

import { ClipboardEvent, useRef, useState } from "react";
import { FaRegPaste } from "react-icons/fa6";
import { IoIosSend, IoMdAdd } from "react-icons/io";

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

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
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
        }
      } else if (item.type.includes("text")) {
        item.getAsString((str) => {
          submitText(str);
          setData("");
          setImageData("");
        });
      }
    });
  };

  return (
    <div className="fixed bottom-0 w-full box-border bg-slate-900">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSubmit) onSubmit(new FormData(e.target as HTMLFormElement));
          setData("");
        }}
        ref={formRef}
      >
        <div>
          <div>
            {image !== null ? <img src={image} alt={"preview"} /> : null}
          </div>
          <div className="flex justify-between">
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
              className="w-14 flex justify-center items-center cursor-pointer border"
            >
              <IoMdAdd className="text-lg" />
            </div>
            <div className="border flex-grow">
              <input
                onChange={(e) => setData(e.target.value)}
                onPaste={handlePaste}
                value={data}
                id="dataInput"
                placeholder="Input your data"
                type="text"
                name="data"
                className="h-14 px-3 py-2 text-sm leading-tight bg-transparent text-white outline-none appearance-none focus:outline-none"
              />
            </div>

            {data !== "" ? (
              <div
                onClick={() => formRef.current?.requestSubmit()}
                className="w-14 flex justify-center items-center cursor-pointer border"
              >
                <IoIosSend className="text-lg" />
              </div>
            ) : (
              <div
                onClick={submitClipboard}
                className="w-14 flex justify-center items-center cursor-pointer border"
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
