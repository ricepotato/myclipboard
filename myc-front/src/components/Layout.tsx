import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    // 화면은 즉시 보여주고, 인증 상태 확인은 백그라운드에서 진행
    let cancelled = false;
    auth.authStateReady().then(() => {
      if (!cancelled && auth.currentUser === null) {
        navigate("/login", { replace: true });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return <>{children}</>;
}
