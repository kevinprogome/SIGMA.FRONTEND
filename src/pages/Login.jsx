import { useState } from "react";
import { login as loginService } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // 🔹 Lista de roles válidos
  const VALID_ROLES = ["ADMIN", "SUPERADMIN", "SECRETARY", "COUNCIL", "STUDENT", "PROJECT_DIRECTOR"];

  // 🔹 Redirigir según el rol
  const redirectByRole = (role) => {
    console.log("🚀 Redirigiendo según rol:", role);
    
    const normalizedRole = role.toUpperCase();
    
    switch (normalizedRole) {
      case "SUPERADMIN":
      case "ADMIN":
        navigate("/admin", { replace: true });
        break;
      case "SECRETARY":
        navigate("/secretary", { replace: true });
        break;
      case "COUNCIL":
        navigate("/council", { replace: true });
        break;
      case "STUDENT":
        navigate("/student", { replace: true });
        break;
      case "PROJECT_DIRECTOR":
        navigate("/project-director", { replace: true });
        break;
      default:
        console.error("❌ Rol desconocido:", role);
        setError(`Rol no reconocido: ${role}. Contacta al administrador.`);
        return false;
    }
    return true;
  };

  // 🧠 Inferir rol basado en permisos (fallback si el token no tiene rol)
  const inferRoleFromPermissions = (permissions) => {
    if (!permissions || permissions.length === 0) return null;

    const permissionsStr = permissions.join(",").toUpperCase();

    if (permissionsStr.includes("CREATE_ROLE") || 
        permissionsStr.includes("CREATE_PERMISSION") ||
        permissionsStr.includes("CREATE_MODALITY") ||
        permissionsStr.includes("UPDATE_MODALITY")) {
      return "ADMIN";
    }

    if (permissionsStr.includes("REVIEW_DOCUMENTS") || 
        permissionsStr.includes("APPROVE_DOCUMENTS")) {
      return "SECRETARY";
    }

    if (permissionsStr.includes("COUNCIL_REVIEW")) {
      return "COUNCIL";
    }

    return "STUDENT";
  };

  // 🔍 Extraer rol del token decodificado
  const extractRole = (decoded) => {
    console.log("🔍 Decodificando token:", decoded);

    // 1️⃣ Buscar en campo 'role'
    if (decoded?.role && VALID_ROLES.includes(decoded.role.toUpperCase())) {
      return decoded.role.toUpperCase();
    }

    // 2️⃣ Buscar en 'authorities' (array o string)
    if (decoded?.authorities) {
      let authorities = [];
      
      if (Array.isArray(decoded.authorities)) {
        authorities = decoded.authorities;
      } else if (typeof decoded.authorities === 'string') {
        authorities = decoded.authorities.split(',').map(a => a.trim());
      }

      console.log("📋 Authorities:", authorities);

      // Buscar un rol válido
      for (const auth of authorities) {
        const cleanAuth = auth.replace("ROLE_", "").trim().toUpperCase();
        if (VALID_ROLES.includes(cleanAuth)) {
          console.log("✅ Rol encontrado:", cleanAuth);
          return cleanAuth;
        }
      }

      // Si no encontramos rol, intentar inferir de permisos
      const inferred = inferRoleFromPermissions(authorities);
      if (inferred) {
        console.log("🧠 Rol inferido:", inferred);
        return inferred;
      }
    }

    // 3️⃣ Buscar en 'authority' (singular)
    if (decoded?.authority) {
      const cleanAuth = decoded.authority.replace("ROLE_", "").trim().toUpperCase();
      if (VALID_ROLES.includes(cleanAuth)) {
        return cleanAuth;
      }
    }

    console.error("❌ No se pudo extraer rol del token");
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("🔐 Intentando login...");
      const response = await loginService({ email, password });
      const token = typeof response === "string" ? response : response?.token;

      if (!token) {
        throw new Error("Token inválido recibido del servidor");
      }

      console.log("✅ Token recibido");

      // Decodificar y extraer rol
      const decoded = jwtDecode(token);
      const role = extractRole(decoded);

      if (!role) {
        throw new Error("No se pudo determinar tu rol. Contacta al administrador.");
      }

      console.log("🎯 Rol extraído:", role);

      // Establecer el token en el contexto
      login(token);

      // Esperar un tick para que el contexto procese
      setTimeout(() => {
        const success = redirectByRole(role);
        if (!success) {
          // Si la redirección falló, limpiar el estado
          setIsLoading(false);
        }
      }, 100);

    } catch (err) {
      console.error("❌ Error en login:", err);
      // El backend ya maneja este mensaje:
      // - "Credenciales incorrectas. Por favor, verifica tu correo institucional y contraseña."
      setError(err.response?.data || err.message || "Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Iniciar sesión</h1>
          <p>Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <div className="login-body">
          {error && (
            <div className="login-error">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-group">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="login-group">
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="login-forgot">
              <Link to="/forgot-password">¿Olvidaste la contraseña?</Link>
            </div>

            <button 
              className="login-button" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="login-footer">
            <Link to="/register">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
