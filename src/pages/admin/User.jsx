import { useEffect, useState } from "react";
import {
  getAllUsers,
  changeUserStatus,
  assignRoleToUser,
  getAllRoles,
  registerUserByAdmin,
  getAllAcademicPrograms,
} from "../../services/adminService";
import "../../styles/admin/Roles.css";

// Roles que requieren programa académico
const ROLES_REQUIRING_PROGRAM = [
  "PROGRAM_HEAD",
  "PROJECT_DIRECTOR",
  "PROGRAM_CURRICULUM_COMMITTEE"
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  
  // Filtros
  const [searchName, setSearchName] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Form data para crear usuario
  const [createFormData, setCreateFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    roleName: "",
    academicProgramId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchName, allUsers]);

  const fetchData = async () => {
    try {
      const [usersData, rolesData, programsData] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
        getAllAcademicPrograms(),
      ]);
      
      console.log("Users data:", usersData);
      console.log("Roles data:", rolesData);
      console.log("Programs data:", programsData);
      
      const enrichedRoles = rolesData.map((role, index) => ({
        ...role,
        id: role.id || index + 1,
      }));
      
      setAllUsers(Array.isArray(usersData) ? usersData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(enrichedRoles);
      setPrograms(Array.isArray(programsData) ? programsData : []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setMessage("Error al cargar datos: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchName.trim()) {
      setUsers(allUsers);
      return;
    }

    const searchLower = searchName.toLowerCase().trim();
    const filtered = allUsers.filter((user) => {
      const fullName = `${user.name || ''} ${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      
      return fullName.includes(searchLower) || email.includes(searchLower);
    });

    setUsers(filtered);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchName(searchInput);
  };

  const handleClearSearch = () => {
    setSearchName("");
    setSearchInput("");
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await changeUserStatus({ userId, status: newStatus });
      setMessage(`Usuario ${newStatus === "ACTIVE" ? "activado" : "desactivado"} exitosamente`);
      fetchData();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setMessage("Error al cambiar estado del usuario: " + (err.response?.data || err.message));
    }
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRoleId("");
    setShowRoleModal(true);
  };

  const handleOpenCreateModal = () => {
    setCreateFormData({
      name: "",
      lastName: "",
      email: "",
      password: "",
      roleName: "",
      academicProgramId: "",
    });
    setShowCreateModal(true);
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    
    console.log("Asignando rol:", {
      userId: selectedUser.id,
      roleId: parseInt(selectedRoleId)
    });
    
    try {
      await assignRoleToUser({
        userId: selectedUser.id,
        roleId: parseInt(selectedRoleId),
      });
      setMessage("Rol asignado exitosamente");
      setShowRoleModal(false);
      fetchData();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error al asignar rol:", err);
      setMessage("Error al asignar rol: " + (err.response?.data || err.message));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validación de correo institucional
    if (!createFormData.email.endsWith("@usco.edu.co")) {
      setMessage("El correo debe ser institucional con dominio @usco.edu.co");
      return;
    }

    // Preparar datos para enviar
    const userData = {
      name: createFormData.name,
      lastName: createFormData.lastName,
      email: createFormData.email,
      password: createFormData.password,
      roleName: createFormData.roleName,
    };

    // Solo agregar academicProgramId si el rol lo requiere
    if (ROLES_REQUIRING_PROGRAM.includes(createFormData.roleName)) {
      if (!createFormData.academicProgramId) {
        setMessage(`El rol ${createFormData.roleName} requiere que se especifique un programa académico`);
        return;
      }
      userData.academicProgramId = parseInt(createFormData.academicProgramId);
    }

    console.log("Creando usuario:", userData);

    try {
      const response = await registerUserByAdmin(userData);
      setMessage(response || "Usuario registrado exitosamente");
      setShowCreateModal(false);
      fetchData();
      
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error("Error al crear usuario:", err);
      const errorMsg = err.response?.data || err.message;
      setMessage("Error al crear usuario: " + errorMsg);
    }
  };

  const requiresProgram = () => {
    return ROLES_REQUIRING_PROGRAM.includes(createFormData.roleName);
  };

  const getFullName = (user) => {
    if (user.name) {
      return user.name;
    }
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Sin nombre';
  };

  if (loading) {
    return <div className="admin-loading">Cargando usuarios...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestión de Usuarios</h1>
          <p className="admin-page-subtitle">Administra usuarios y sus estados</p>
        </div>
        <button onClick={handleOpenCreateModal} className="admin-btn-primary">
          ➕ Crear Usuario
        </button>
      </div>

      {message && (
        <div className={`admin-message ${message.includes("Error") || message.includes("error") ? "error" : "success"}`}>
          {message}
          <button onClick={() => setMessage("")} style={{ marginLeft: "1rem" }}>✕</button>
        </div>
      )}

      {/* Filtro de búsqueda */}
      <div className="admin-filters">
        <div className="filter-section">
          <label className="filter-label">Buscar usuario por nombre o email:</label>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nombre o email del usuario..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              Buscar
            </button>
          </form>
        </div>

        {searchName && (
          <button onClick={handleClearSearch} className="clear-filters-button">
            ✕ Limpiar Búsqueda
          </button>
        )}
      </div>

      {/* Indicador de búsqueda activa */}
      {searchName && (
        <div className="active-filters">
          <strong>Búsqueda activa:</strong>
          <span className="filter-tag">"{searchName}"</span>
        </div>
      )}

      {/* Contador de resultados */}
      {searchName && (
        <div className="results-count">
          {users.length === 0 
            ? "No se encontraron usuarios" 
            : `Mostrando ${users.length} usuario${users.length !== 1 ? 's' : ''}`}
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                  {searchName 
                    ? `No se encontraron usuarios que coincidan con "${searchName}"`
                    : "No hay usuarios registrados"}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{getFullName(user)}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div className="admin-tags">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, idx) => (
                          <span key={idx} className="admin-tag">
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="admin-text-muted">Sin rol</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${user.status?.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        onClick={() => handleStatusToggle(user.id, user.status)}
                        className={user.status === "ACTIVE" ? "admin-btn-delete" : "admin-btn-edit"}
                      >
                        {user.status === "ACTIVE" ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleOpenRoleModal(user)}
                        className="admin-btn-action"
                      >
                        Asignar Rol
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Crear Nuevo Usuario</h2>
              <button onClick={() => setShowCreateModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Nombre *</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="admin-input"
                  placeholder="Juan"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Apellido *</label>
                <input
                  type="text"
                  value={createFormData.lastName}
                  onChange={(e) => setCreateFormData({ ...createFormData, lastName: e.target.value })}
                  className="admin-input"
                  placeholder="Pérez"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Email Institucional *</label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="admin-input"
                  placeholder="juan.perez@usco.edu.co"
                  required
                />
                <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
                  Debe terminar en @usco.edu.co
                </small>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Contraseña *</label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  className="admin-input"
                  placeholder="Contraseña segura"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Rol *</label>
                <select
                  value={createFormData.roleName}
                  onChange={(e) => setCreateFormData({ ...createFormData, roleName: e.target.value })}
                  className="admin-select"
                  required
                >
                  <option value="">-- Selecciona un rol --</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {requiresProgram() && (
                <div className="admin-form-group">
                  <label className="admin-label">Programa Académico *</label>
                  <select
                    value={createFormData.academicProgramId}
                    onChange={(e) => setCreateFormData({ ...createFormData, academicProgramId: e.target.value })}
                    className="admin-select"
                    required
                  >
                    <option value="">-- Selecciona un programa --</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: "#f59e0b", marginTop: "0.5rem", display: "block" }}>
                    ⚠️ Este rol requiere un programa académico
                  </small>
                </div>
              )}

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showRoleModal && (
        <div className="admin-modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Asignar Rol a Usuario</h2>
              <button onClick={() => setShowRoleModal(false)} className="admin-modal-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignRole} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-label">Usuario</label>
                <input
                  type="text"
                  value={getFullName(selectedUser)}
                  className="admin-input"
                  disabled
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Email</label>
                <input
                  type="text"
                  value={selectedUser.email}
                  className="admin-input"
                  disabled
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Seleccionar Rol</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="admin-select"
                  required
                >
                  <option value="">-- Selecciona un rol --</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-modal-actions">
                <button type="button" onClick={() => setShowRoleModal(false)} className="admin-btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary" disabled={!selectedRoleId}>
                  Asignar Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}