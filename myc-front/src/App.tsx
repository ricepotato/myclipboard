import "./index.css";

import { RouterProvider, createHashRouter } from "react-router-dom";
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/theme-provider";
import ErrorPage from "./error-page";
import Editor from "./routes/editor";
import List from "./routes/list";
import Login from "./routes/login";

const router = createHashRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Editor />
      </Layout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/edit/:id",
    element: (
      <Layout>
        <Editor />
      </Layout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/list",
    element: (
      <Layout>
        <List />
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
  // 로딩 화면 없이 즉시 렌더링. 인증/서버 연결은 백그라운드에서 진행됨
  return (
    <div className="App relative">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </div>
  );
}

export default App;
