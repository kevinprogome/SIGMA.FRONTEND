import { Outlet } from "react-router-dom";

export default function SecretaryLayout() {
  return (
    <div>
      <h1>Panel de Secretaría</h1>
      <Outlet />
    </div>
  );
}
