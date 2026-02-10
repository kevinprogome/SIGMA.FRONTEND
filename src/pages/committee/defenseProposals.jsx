import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingDefenseProposals } from "../../services/committeeService";
import DefenseProposalModal from "../../components/committee/ScheduleDefenseModal";
import "../../styles/council/defenseproposals.css";

export default function DefenseProposals() {
  const navigate = useNavigate();
  
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const data = await getPendingDefenseProposals();
      console.log("📋 Propuestas recibidas:", data);
      setProposals(data.proposals || []);
    } catch (err) {
      console.error("Error al obtener propuestas:", err);
      setError("Error al cargar las propuestas de sustentación");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSelectedProposal(null);
    setSuccessMessage("Propuesta procesada correctamente");
    fetchProposals();
    
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  if (loading) {
    return (
      <div className="defense-proposals-container">
        <div className="defense-proposals-loading">
          Cargando propuestas de sustentación...
        </div>
      </div>
    );
  }

  return (
    <div className="defense-proposals-container">
      {/* Header */}
      <div className="defense-proposals-header">
        <div>
          <h1 className="defense-proposals-title">
            Propuestas de Sustentación Pendientes
          </h1>
          <p className="defense-proposals-subtitle">
            Revisa y aprueba las propuestas enviadas por los directores de proyecto
          </p>
        </div>
        <button onClick={() => navigate("/comite")} className="back-button">
          ← Volver al Dashboard
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="defense-message error">
          {error}
          <button onClick={() => setError("")}>✕</button>
        </div>
      )}

      {successMessage && (
        <div className="defense-message success">
          {successMessage}
          <button onClick={() => setSuccessMessage("")}>✕</button>
        </div>
      )}

      {/* Contenido */}
      {proposals.length === 0 ? (
        <div className="defense-proposals-empty">
          <div className="empty-icon">📭</div>
          <h3 className="empty-text">No hay propuestas pendientes</h3>
          <p className="empty-subtext">
            Cuando los directores de proyecto propongan fechas de sustentación,
            aparecerán aquí para tu revisión.
          </p>
        </div>
      ) : (
        <div className="proposals-table-container">
          <table className="proposals-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Programa / Modalidad</th>
                <th>Director</th>
                <th>Fecha Propuesta</th>
                <th>Lugar Propuesto</th>
                <th>Enviada</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.studentModalityId}>
                  <td>
                    <div className="student-name">{proposal.studentName}</div>
                    <small>{proposal.studentCode}</small>
                  </td>
                  <td>
                    <div className="program-name">{proposal.academicProgram}</div>
                    <small className="modality-name">{proposal.modalityName}</small>
                  </td>
                  <td>
                    <div>{proposal.projectDirectorName}</div>
                    <small>{proposal.projectDirectorEmail}</small>
                  </td>
                  <td>
                    <div className="proposal-date">
                      {new Date(proposal.proposedDefenseDate).toLocaleString("es-CO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </td>
                  <td>{proposal.proposedDefenseLocation}</td>
                  <td>
                    <small>
                      {new Date(proposal.proposalSubmittedAt).toLocaleString("es-CO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </small>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedProposal(proposal)}
                      className="review-button"
                    >
                      Revisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Revisión */}
      {selectedProposal && (
        <DefenseProposalModal
          studentModalityId={selectedProposal.studentModalityId}
          proposedDefenseDate={selectedProposal.proposedDefenseDate}
          proposedDefenseLocation={selectedProposal.proposedDefenseLocation}
          onClose={() => setSelectedProposal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}