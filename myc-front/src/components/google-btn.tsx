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
      className="flex items-center justify-center gap-3 w-full h-14 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      <FcGoogle size={24} />
      <span>Google로 계속하기</span>
    </button>
  );
}
