"use client";

import { ClipboardEvent, useState } from "react";
import { Button } from "./ui/button";

export function ClipboardForm({
  onSubmit,
}: {
  onSubmit?: (data: FormData) => void;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [data, setData] = useState<string>("");
  const [type, setType] = useState<"text" | "image">("text");

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
          reader.readAsDataURL(blob);
          const formData = new FormData();
          formData.append("file", blob);
          formData.append("type", "image");
          formData.append("data", "image");
          onSubmit?.(formData);
        }
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(new FormData(e.target as HTMLFormElement));

        setData("");
      }}
    >
      <label
        htmlFor="dataInput"
        className="block mb-2 text-sm font-medium text-gray-600"
      ></label>

      <div>
        <div>{image !== null ? <img src={image} alt={"preview"} /> : null}</div>
        <div>
          <input type="hidden" name="type" value={type} />
          <div className="my-2">
            <input
              aria-label="fileInput"
              id="fileInput"
              type="file"
              name="file"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setType("image");
                }
              }}
            />
          </div>
          <input
            onChange={(e) => setData(e.target.value)}
            onPaste={handlePaste}
            value={data}
            id="dataInput"
            placeholder="Input your data"
            type="text"
            name="data"
            className="w-full h-12 px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border rounded-md shadow appearance-none focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
