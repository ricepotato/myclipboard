import { CopyButton } from "@/components/buttons";
import { ClipboardForm } from "@/components/form";
import { deleteItemAction } from "@/lib/actions";
import { getItems } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface Item {
  created_at: string;
  expired_at: string | null;
  id: string;
  type: string;
  updated_at: string;
  user_id: string;
  value: string;
}

export default function Home({
  searchParams,
}: {
  searchParams: { page?: number; size?: number };
}) {
  const page = searchParams.page || 1;
  const size = searchParams.size || 5;
  const from = (page - 1) * size;
  const to = page * size;
  return (
    <main>
      <div className="flex flex-col items-center  p-10 min-h-screen bg-gray-100 w-full ">
        <h2 className="mb-5 text-2xl font-bold text-gray-700">My Clipboard</h2>
        <div className="my-2 p-5 bg-white rounded shadow-md w-full max-w-3xl">
          <Suspense fallback={<div>Loading...</div>}>
            <ClipboardItems from={from} to={to} />
          </Suspense>
        </div>
        <div className="p-5 bg-white rounded shadow-md w-full max-w-3xl">
          <ClipboardForm />
        </div>
      </div>
    </main>
  );
}

async function ClipboardItems({ from, to }: { from: number; to: number }) {
  const result = await getItems({ from, to });

  return (
    <ul>
      {result.reverse().map((item) => {
        const datetimeStr = new Date(item.created_at);
        return (
          <li className="mt-1" key={item.id}>
            {item.type === "image" ? (
              <div className="flex justify-between items-center">
                [{datetimeStr.toLocaleString()}]
                <ImageItem item={item} />
                <div className="flex gap-1">
                  <CopyButton
                    value={`${process.env.NEXT_PUBLIC_BASE_URL}/files/${item.value}`}
                  />
                  <DeleteItemForm userId={item.user_id} id={item.id} />
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  [{datetimeStr.toLocaleString()}] {item.value}
                </div>
                <div className="flex gap-1">
                  <CopyButton value={item.value} />
                  <DeleteItemForm userId={item.user_id} id={item.id} />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ImageItem({ item }: { item: Item }) {
  return (
    <Link target="_blank" href={`/files/${item.value}`}>
      <Image
        alt={item.id}
        width={250}
        height={250}
        src={`/files/${item.value}`}
      />
    </Link>
  );
}

function DeleteItemForm({
  userId,
  id,
}: {
  userId: string;
  id: string | undefined;
}) {
  return (
    <form action={deleteItemAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Delete
      </button>
    </form>
  );
}
