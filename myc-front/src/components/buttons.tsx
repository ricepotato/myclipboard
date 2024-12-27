import clsx from "clsx";
import { useState } from "react";
import { CgSpinnerAlt } from "react-icons/cg";
import { FaCheck } from "react-icons/fa";
import { FaRegCopy } from "react-icons/fa6";
import { IoMdRefresh } from "react-icons/io";

export function CopyCheckButton({ onClick }: { onClick: () => void }) {
  // click 되면 check icon 으로 변경되었다가 800ms 후에 다시 copy icon 으로 변경
  return (
    <ToggleCheck onClick={onClick}>
      <FaRegCopy className="cursor-pointer size-5" />
    </ToggleCheck>
  );
}

export function RefreshCheckButton({ onClick }: { onClick: () => void }) {
  // click 되면 check icon 으로 변경되었다가 800ms 후에 다시 refresh icon 으로 변경
  return (
    <ToggleCheck onClick={onClick}>
      <IoMdRefresh className="cursor-pointer size-6" />
    </ToggleCheck>
  );
}

function ToggleCheck({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const [clickCheck, setClickCheck] = useState(false);
  return (
    <span>
      {clickCheck ? (
        <FaCheck className="cursor-pointer size-5" />
      ) : (
        <span
          onClick={() => {
            setClickCheck(true);
            setTimeout(() => {
              setClickCheck(false);
            }, 800);
            onClick();
          }}
        >
          {children}
        </span>
      )}
    </span>
  );
}

export function LoadMoreButton({
  onClick,
  pending,
}: {
  onClick: () => void;
  pending: boolean;
}) {
  return (
    <div>
      <button
        disabled={pending}
        onClick={onClick}
        className={clsx(
          "border w-full h-14 rounded-sm py-4 hover:bg-slate-900",
          pending && "bg-slate-900 flex justify-center items-center"
        )}
      >
        {pending ? <CgSpinnerAlt className="animate-spin" /> : "More"}
      </button>
    </div>
  );
}
