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
  const VALID_ROLES = ["ADMIN", "SUPERADMIN", "PROGRAM_HEAD", "PROGRAM_CURRICULUM_COMMITTEE", "STUDENT", "PROJECT_DIRECTOR", "EXAMINER"];

  // 🔹 Redirigir según el rol
  const redirectByRole = (role) => {
    console.log("🚀 Redirigiendo según rol:", role);
    
    const normalizedRole = role.toUpperCase();
    
    switch (normalizedRole) {
      case "SUPERADMIN":
      case "ADMIN":
        navigate("/admin", { replace: true });
        break;
      case "PROGRAM_HEAD":
        navigate("/jefeprograma", { replace: true });
        break;
      case "PROGRAM_CURRICULUM_COMMITTEE":
        navigate("/comite", { replace: true });
        break;
      case "STUDENT":
        navigate("/student", { replace: true });
        break;
      case "PROJECT_DIRECTOR":
        navigate("/project-director", { replace: true });
        break;
      case "EXAMINER":
        navigate("/examiner", { replace: true });
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

    // ✅ PRIMERO verificar EXAMINER
    if (permissionsStr.includes("EVALUATE_DEFENSE") || 
        permissionsStr.includes("GRADE_DEFENSE") ||
        permissionsStr.includes("VIEW_DEFENSE_ASSIGNMENTS")) {
      return "EXAMINER";
    }

    // Verificar PROJECT_DIRECTOR
    if (permissionsStr.includes("PROPOSE_DEFENSE") ||
        permissionsStr.includes("MANAGE_STUDENT_PROJECT")) {
      return "PROJECT_DIRECTOR";
    }

    // Verificar ADMIN
    if (permissionsStr.includes("CREATE_ROLE") || 
        permissionsStr.includes("CREATE_PERMISSION") ||
        permissionsStr.includes("CREATE_MODALITY") ||
        permissionsStr.includes("UPDATE_MODALITY")) {
      return "ADMIN";
    }

    // Verificar PROGRAM_HEAD
    if (permissionsStr.includes("REVIEW_DOCUMENTS") || 
        permissionsStr.includes("APPROVE_DOCUMENTS")) {
      return "PROGRAM_HEAD";
    }

    // Verificar COMMITTEE
    if (permissionsStr.includes("COUNCIL_REVIEW")) {
      return "PROGRAM_CURRICULUM_COMMITTEE";
    }

    return "STUDENT";
  };

  // 🔍 Extraer rol del token decodificado
  const extractRole = (decoded) => {
    console.log("🔍 Decodificando token:", decoded);

    // 1️⃣ Buscar en campo 'role'
    if (decoded?.role && VALID_ROLES.includes(decoded.role.toUpperCase())) {
      console.log("✅ Rol encontrado en campo 'role':", decoded.role.toUpperCase());
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
          console.log("✅ Rol encontrado en authorities:", cleanAuth);
          return cleanAuth;
        }
      }

      // Si no encontramos rol, intentar inferir de permisos
      const inferred = inferRoleFromPermissions(authorities);
      if (inferred) {
        console.log("🧠 Rol inferido de permisos:", inferred);
        return inferred;
      }
    }

    // 3️⃣ Buscar en 'authority' (singular)
    if (decoded?.authority) {
      const cleanAuth = decoded.authority.replace("ROLE_", "").trim().toUpperCase();
      if (VALID_ROLES.includes(cleanAuth)) {
        console.log("✅ Rol encontrado en authority:", cleanAuth);
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
      
      // Debug completo del token
      console.log("🔍 TOKEN COMPLETO DECODIFICADO:", JSON.stringify(decoded, null, 2));
      console.log("🔍 decoded.role:", decoded.role);
      console.log("🔍 decoded.authorities:", decoded.authorities);
      console.log("🔍 decoded.authority:", decoded.authority);
      
      const role = extractRole(decoded);

      if (!role) {
        throw new Error("No se pudo determinar tu rol. Contacta al administrador.");
      }

      console.log("🎯 Rol extraído:", role);

      // Establecer el token en el contexto
      login(token);

      // Esperar un tick para que el contexto procese
      setTimeout(() => {
        console.log("🎯 A punto de redirigir, rol:", role);
        const success = redirectByRole(role);
        if (!success) {
          setIsLoading(false);
        }
      }, 100);

    } catch (err) {
      console.error("❌ Error en login:", err);
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