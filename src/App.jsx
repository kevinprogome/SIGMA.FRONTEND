import AppRoutes from "./routes/AppRoutes";
import ActionMessageViewportGuard from "./components/ActionMessageViewportGuard";

function App() {
  return (
    <>
      <ActionMessageViewportGuard />
      <AppRoutes />
    </>
  );
  
}

export default App;
