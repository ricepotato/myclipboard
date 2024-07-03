import "./index.css";

import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import ErrorPage from "./error-page";
import { auth } from "./firebase";
import Login from "./routes/login";
import Root from "./routes/root";
import { ThemeProvider } from "./components/theme-provider";
import { cn } from "@/lib/utils";

const router = createBrowserRouter([
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
    await auth.authStateReady();
    setIsLoading(false);
  };

  cn();

  useEffect(() => {
    init();
  }, []);
  return (
    <div className="App">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {isLoading ? (
          <div>loading...</div>
        ) : (
          <RouterProvider router={router}></RouterProvider>
        )}
      </ThemeProvider>
    </div>
  );
}

export default App;
