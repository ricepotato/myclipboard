import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../firebase";

export default function GoogleButton() {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <button
      onClick={onClick}
      className="flex gap-2 justify-center border w-full h-14 rounded-sm py-4 hover:bg-slate-900"
    >
      <FcGoogle size={20} />
      Continue with Google
    </button>
  );
}
