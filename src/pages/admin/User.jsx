import { useEffect, useState } from "react";
import { getAllUsers, changeUserStatus, assignRoleToUser, getAllRoles } from "../../services/adminService";
import "../../styles/admin/Roles.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
      ]);
      
      console.log("Users data:", usersData); // DEBUG
      console.log("Roles data:", rolesData); // DEBUG
      
      // Enriquecer roles con IDs temporales si no los tienen
      const enrichedRoles = rolesData.map((role, index) => ({
        ...role,
        id: role.id || index + 1, // Si no tiene ID, generar uno temporal
      }));
      
      setUsers(usersData);
      setRoles(enrichedRoles);
    } catch (err) {
      console.error("Error al cargar datos:", err); // DEBUG
      setMessage("Error al cargar datos: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await changeUserStatus({ userId, status: newStatus });
      setMessage(`Usuario ${newStatus === "ACTIVE" ? "activado" : "desactivado"} exitosamente`);
      fetchData();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error al cambiar estado:", err); // DEBUG
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
    
    console.log("Asignando rol:", { // DEBUG
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
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error al asignar rol:", err); // DEBUG
      setMessage("Error al asignar rol: " + (err.response?.data || err.message));
    }
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
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}</strong>
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
                      {user.status === "ACTIVE" ? "🚫 Desactivar" : "✅ Activar"}
                    </button>
                    <button
                      onClick={() => handleOpenRoleModal(user)}
                      className="admin-btn-action"
                    >
                      👥 Asignar Rol
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
                  value={selectedUser.name || `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.email}
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
