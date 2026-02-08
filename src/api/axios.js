import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Rutas públicas que NO necesitan token
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password"
];

// ✅ Interceptor para añadir el token a cada petición
instance.interceptors.request.use(
  (config) => {
    // ✅ No agregar token a rutas públicas
    const isPublicRoute = PUBLIC_ROUTES.some(route => config.url?.includes(route));
    
    if (!isPublicRoute) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 Token agregado a petición:", config.url);
      } else {
        console.warn("⚠️ No hay token disponible para:", config.url);
      }
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

// ✅ Interceptor para manejar errores de autenticación
instance.interceptors.response.use(
  (response) => {
    console.log("✅ Respuesta exitosa de:", response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error(`❌ Error ${status} en petición a:`, url);
    console.error("❌ Detalle del error:", error.response?.data);

    if (status === 401 || status === 403) {
      console.error("🚨 Error de autenticación/autorización");
      console.error("🚨 Usuario no autorizado para:", url);
      
      // Solo limpiar el token si es 401 (no autenticado)
      if (status === 401) {
        console.error("🔐 Token inválido o expirado, limpiando localStorage");
        localStorage.removeItem("token");
        
        // Emitir un evento personalizado para que el AuthContext lo maneje
        window.dispatchEvent(new Event('unauthorized'));
      }
      
      // Si es 403, el usuario está autenticado pero no tiene permisos
      if (status === 403) {
        console.error("🔒 Usuario autenticado pero sin permisos suficientes");
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;