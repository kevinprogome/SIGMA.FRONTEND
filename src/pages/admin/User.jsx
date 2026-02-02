import { useEffect, useState } from "react";
import { getAllUsers, changeUserStatus, assignRoleToUser, getAllRoles } from "../../services/adminService";
import "../../styles/admin/Roles.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Para guardar todos los usuarios
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  
  // Filtros
  const [searchName, setSearchName] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar usuarios cuando cambie la búsqueda
  useEffect(() => {
    filterUsers();
  }, [searchName, allUsers]);

  const fetchData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
      ]);
      
      console.log("Users data:", usersData);
      console.log("Roles data:", rolesData);
      
      // Enriquecer roles con IDs temporales si no los tienen
      const enrichedRoles = rolesData.map((role, index) => ({
        ...role,
        id: role.id || index + 1,
      }));
      
      setAllUsers(usersData);
      setUsers(usersData);
      setRoles(enrichedRoles);
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

  // Función para obtener el nombre completo del usuario
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
      </div>

      {message && (
        <div className={`admin-message ${message.includes("Error") || message.includes("error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* Filtro de búsqueda */}
      <div className="admin-filters">
        <div className="filter-section">
          <label className="filter-label">Buscar usuario por nombre, email o código:</label>
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