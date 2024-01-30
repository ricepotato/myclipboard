import { ClipboardForm } from "@/components/form";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col items-center  p-10 min-h-screen bg-gray-100 w-full ">
        <h2 className="mb-5 text-2xl font-bold text-gray-700">My Clipboard</h2>
        <div className="my-2 p-5 bg-white rounded shadow-md w-full max-w-3xl">
          <ul>
            <li></li>
          </ul>
        </div>
        <div className="p-5 bg-white rounded shadow-md w-full max-w-3xl">
          <ClipboardForm />
        </div>
      </div>
    </main>
  );
}
