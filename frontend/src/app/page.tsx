import { ClipboardForm } from "@/components/form";
import { getDataList, Item } from "@/lib/datastore";
import Image from "next/image";
import { Suspense } from "react";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col items-center  p-10 min-h-screen bg-gray-100 w-full ">
        <h2 className="mb-5 text-2xl font-bold text-gray-700">My Clipboard</h2>
        <div className="my-2 p-5 bg-white rounded shadow-md w-full max-w-3xl">
          <Suspense fallback={<div>Loading...</div>}>
            <ClipboardItems />
          </Suspense>
        </div>
        <div className="p-5 bg-white rounded shadow-md w-full max-w-3xl">
          <ClipboardForm />
        </div>
      </div>
    </main>
  );
}

async function ClipboardItems() {
  const result = await getDataList("ricepotato");
  return (
    <ul>
      {result.data.map((item) => {
        const datetimeStr = new Date(parseInt(item.timestamp));
        return (
          <li key={item.id}>
            {item.type === "image" ? (
              <>
                [{datetimeStr.toLocaleString()}]
                <ImageItem item={item} />
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                  Delete
                </button>
              </>
            ) : (
              <>
                <div>
                  [{datetimeStr.toLocaleString()}] {item.data}
                </div>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                  Delete
                </button>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ImageItem({ item }: { item: Item }) {
  return (
    <Image alt={item.id} width={250} height={250} src={`/files/${item.data}`} />
  );
}
