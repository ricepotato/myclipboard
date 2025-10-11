import "./index.css";

import { useEffect, useState } from "react";
import { RouterProvider, createHashRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Loading from "./components/Loading";
import { ThemeProvider } from "./components/theme-provider";
import ErrorPage from "./error-page";
import { auth } from "./firebase";
import Login from "./routes/login";
import Root from "./routes/root";

const router = createHashRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Root />
      </Layout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
]);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const init = async () => {
    // 로딩 화면을 최소 1초는 보이도록 함
    await Promise.all([
      auth.authStateReady(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    init();
  }, []);
  return (
    <div className="App relative">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {isLoading ? <Loading /> : <RouterProvider router={router} />}
      </ThemeProvider>
    </div>
  );
}

export default App;
