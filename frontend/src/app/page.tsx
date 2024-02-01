import { ClipboardForm } from "@/components/form";
import { getDataList } from "@/lib/datastore";
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
            [{datetimeStr.toLocaleString()}] {item.data}
          </li>
        );
      })}
    </ul>
  );
}
