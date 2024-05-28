import { ClipboardForm } from "../components/form";

export default function Root() {
  return (
    <main>
      <div className="p-4">
        <ul>
          <li>item1</li>
          <li>item2</li>
        </ul>
        <ClipboardForm />
      </div>
    </main>
  );
}
