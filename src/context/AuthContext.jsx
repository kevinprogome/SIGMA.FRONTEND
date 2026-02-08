import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Lista de roles válidos del sistema
  const VALID_ROLES = ["ADMIN", "SUPERADMIN", "PROGRAM_HEAD", "PROGRAM_CURRICULUM_COMMITTEE", "STUDENT", "PROJECT_DIRECTOR"];

  // 🔹 Extrae y normaliza el rol desde el JWT
  const extractRole = (decoded) => {
    console.log("🔍 Extrayendo rol del token:", decoded);

    // 1️⃣ Intentar obtener el rol directo
    if (decoded?.role) {
      const normalizedRole = decoded.role.toUpperCase();
      if (VALID_ROLES.includes(normalizedRole)) {
        console.log("✅ Rol encontrado en campo 'role':", normalizedRole);
        return normalizedRole;
      }
    }

    // 2️⃣ Intentar obtener de authorities (puede ser array o string)
    if (decoded?.authorities) {
      let authorities = [];
      
      if (Array.isArray(decoded.authorities)) {
        authorities = decoded.authorities;
      } else if (typeof decoded.authorities === 'string') {
        authorities = decoded.authorities.split(',').map(a => a.trim());
      }
      
      console.log("📋 Authorities encontradas:", authorities);

      // Buscar un ROL válido en las authorities
      for (const auth of authorities) {
        const cleanAuth = auth.replace("ROLE_", "").trim().toUpperCase();
        if (VALID_ROLES.includes(cleanAuth)) {
          console.log("✅ Rol encontrado en authorities:", cleanAuth);
          return cleanAuth;
        }
      }

      // Si no encontramos un rol válido, pero hay authorities, 
      // intentar inferir el rol basado en permisos
      const inferredRole = inferRoleFromPermissions(authorities);
      if (inferredRole) {
        console.log("🧠 Rol inferido de permisos:", inferredRole);
        return inferredRole;
      }
    }

    // 3️⃣ Intentar obtener de authority (singular)
    if (decoded?.authority) {
      const cleanAuth = decoded.authority.replace("ROLE_", "").trim().toUpperCase();
      if (VALID_ROLES.includes(cleanAuth)) {
        console.log("✅ Rol encontrado en authority:", cleanAuth);
        return cleanAuth;
      }
    }

    console.error("❌ No se pudo extraer un rol válido del token");
    return null;
  };

  // 🧠 Inferir rol basado en los permisos que tiene
  const inferRoleFromPermissions = (permissions) => {
    if (!permissions || permissions.length === 0) return null;

    const permissionsStr = permissions.join(",").toUpperCase();

    // Si tiene permisos de ADMIN (crear roles, permisos, etc.)
    if (permissionsStr.includes("CREATE_ROLE") || 
        permissionsStr.includes("CREATE_PERMISSION") ||
        permissionsStr.includes("CREATE_MODALITY")) {
      return "ADMIN";
    }

    // Si tiene permisos de jefe programa
    if (permissionsStr.includes("REVIEW_DOCUMENTS") || 
        permissionsStr.includes("APPROVE_DOCUMENTS")) {
      return "PROGRAM_HEAD";
    }

    // Si tiene permisos de comite
    if (permissionsStr.includes("COUNCIL_REVIEW")) {
      return "PROGRAM_CURRICULUM_COMMITTEE";
    }

    // Por defecto, si no podemos inferir, asumimos STUDENT
    return "STUDENT";
  };

  // 🔹 Extrae información del usuario desde el JWT
  const extractUserInfo = (decoded) => {
    return {
      email: decoded?.sub || decoded?.email || null,
      name: decoded?.name || null,
      userId: decoded?.userId || null,
    };
  };

  // 🔄 Restaurar sesión al recargar
  useEffect(() => {
    console.log("🔄 Inicializando AuthContext...");
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      try {
        console.log("📦 Token encontrado en localStorage");
        const decoded = jwtDecode(storedToken);
        console.log("🔍 Token decodificado:", decoded);
        
        const extractedRole = extractRole(decoded);
        const extractedUser = extractUserInfo(decoded);
        
        console.log("🎯 Rol extraído:", extractedRole);
        console.log("👤 Usuario extraído:", extractedUser);
        
        if (!extractedRole) {
          console.error("❌ No se pudo extraer rol, eliminando token");
          localStorage.removeItem("token");
          setLoading(false);
          return;
        }
        
        setToken(storedToken);
        setRole(extractedRole);
        setUser(extractedUser);
      } catch (error) {
        console.error("❌ Error al decodificar token:", error);
        localStorage.removeItem("token");
      }
    } else {
      console.log("📭 No hay token en localStorage");
    }

    setLoading(false);
    console.log("✅ AuthContext inicializado");
  }, []);

  // ✅ Escuchar evento de unauthorized desde axios
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log("🚨 Evento unauthorized recibido, cerrando sesión");
      logout();
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  // 🔐 Login
  const login = (newToken) => {
    console.log("🔐 Procesando login en contexto...");
    localStorage.setItem("token", newToken);
    
    try {
      const decoded = jwtDecode(newToken);
      console.log("🔍 Token decodificado en login:", decoded);
      
      const extractedRole = extractRole(decoded);
      const extractedUser = extractUserInfo(decoded);
      
      console.log("🎯 Estableciendo rol:", extractedRole);
      console.log("👤 Estableciendo usuario:", extractedUser);
      
      if (!extractedRole) {
        throw new Error("No se pudo extraer el rol del token");
      }
      
      setToken(newToken);
      setRole(extractedRole);
      setUser(extractedUser);
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    }
  };

  // 🚪 Logout
  const logout = () => {
    console.log("🚪 Cerrando sesión");
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);