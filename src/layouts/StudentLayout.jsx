import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function StudentLayout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </>
  );
}
