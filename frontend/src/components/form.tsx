"use client";

import { saveInput } from "@/lib/actions";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import React, { ClipboardEvent } from "react";

export function ClipboardForm() {
  const [error, action] = useFormState(saveInput, undefined);
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
          //console.log(event.target?.result); // This will log the image data URL
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
          action(formData);
        }
      }
    });
  };

  useEffect(() => {
    if (error && "success" in error && error.success) {
      setData("");
    }
  }, [error]);

  return (
    <form action={action}>
      <label
        htmlFor="dataInput"
        className="block mb-2 text-sm font-medium text-gray-600"
      ></label>

      <div>
        <div>
          {image !== null ? <img src={image} alt={"image preview"} /> : null}
        </div>
        <div>
          <input type="hidden" name="type" value={type} />
          <div className="my-2">
            <input
              aria-label="fileInput"
              id="fileInput"
              type="file"
              name="file"
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
            className="w-full px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline"
      >
        Submit
      </button>
    </form>
  );
}
