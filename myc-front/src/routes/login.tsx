import GoogleButton from "../components/google-btn";

export default function Login() {
  return (
    <main className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">MyClipboard</h1>
          <p className="text-slate-400 text-lg">클립보드를 클라우드에 저장</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                환영합니다
              </h2>
              <p className="text-slate-400">
                계속하려면 Google 계정으로 로그인하세요
              </p>
            </div>

            <div className="pt-4">
              <GoogleButton />
            </div>

            {/* <div className="pt-4 text-center">
              <p className="text-sm text-slate-500">
                로그인하면 <span className="text-slate-400">서비스 약관</span>{" "}
                및 <span className="text-slate-400">개인정보 보호정책</span>에
                동의하게 됩니다
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </main>
  );
}
