// 로그인은 선택 사항. 로그인하지 않아도 입력/목록 화면을 쓰고, 저장한 내용은 브라우저에 보관했다가
// 로그인하면 백그라운드에서 서버와 동기화됨 (repository.startBackgroundSync)
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
