"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [tooltipText, setTooltipText] = useState("Copy to clipboard");
  return (
    <Tooltip text={tooltipText}>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          copyToClipboard(value);
          setTooltipText("Copied!");
        }}
        onMouseLeave={() => setTooltipText("Copy to clipboard")}
      >
        Copy
      </button>
    </Tooltip>
  );
}

function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <div className="relative group">
      {children}
      <div className="hidden group-hover:block absolute bg-black text-white text-xs rounded p-1 -mt-16 -ml-12">
        {text}
      </div>
    </div>
  );
}

function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value);
}
