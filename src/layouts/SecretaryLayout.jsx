import { Outlet } from "react-router-dom";
import Navbar from "../components/NavbarAdmin";


export default function SecretaryLayout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </>
  );
}
