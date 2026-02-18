import { useState } from "react";
import "../../styles/council/reports.css";

export default function ReportViewer({ report, onClose }) {
  const [activeTab, setActiveTab] = useState("summary");

  if (!report || !report.data) {
    return (
      <div className="report-viewer-overlay">
        <div className="report-viewer">
          <div className="report-viewer-header">
            <h2>Error</h2>
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
          <div className="report-viewer-body">
            <p>No hay datos de reporte para mostrar</p>
          </div>
        </div>
      </div>
    );
  }

  const reportData = report.data;
  const reportType = report.reportType;

  const renderSummary = () => {
    if (!reportData.executiveSummary && !reportData.summary) {
      return <p>No hay resumen ejecutivo disponible</p>;
    }

    const summary = reportData.executiveSummary || reportData.summary;

    return (
      <div className="report-section">
        <h3>📊 Resumen Ejecutivo</h3>
        <div className="summary-grid">
          {Object.entries(summary).map(([key, value]) => {
            if (typeof value === "object" && value !== null) {
              return null; // Skip nested objects
            }
            return (
              <div key={key} className="summary-card">
                <span className="summary-label">{formatKey(key)}</span>
                <span className="summary-value">{formatValue(value)}</span>
              </div>
            );
          })}
        </div>

        {summary.quickStats && (
          <div className="quick-stats">
            <h4>Estadísticas Rápidas</h4>
            <div className="stats-grid">
              {Object.entries(summary.quickStats).map(([key, value]) => (
                <div key={key} className="stat-item">
                  <span className="stat-label">{key}</span>
                  <span className="stat-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderModalities = () => {
    if (!reportData.modalities || reportData.modalities.length === 0) {
      return <p>No hay modalidades para mostrar</p>;
    }

    return (
      <div className="report-section">
        <h3>📋 Modalidades ({reportData.modalities.length})</h3>
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Modalidad</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Estudiantes</th>
                <th>Director</th>
                <th>Días</th>
              </tr>
            </thead>
            <tbody>
              {reportData.modalities.slice(0, 50).map((modality) => (
                <tr key={modality.studentModalityId}>
                  <td>{modality.studentModalityId}</td>
                  <td className="text-truncate">{modality.modalityName}</td>
                  <td>
                    <span className={`badge badge-${modality.modalityType.toLowerCase()}`}>
                      {modality.modalityType}
                    </span>
                  </td>
                  <td className="text-small">{modality.statusDescription}</td>
                  <td>{modality.students?.length || 0}</td>
                  <td className="text-truncate">
                    {modality.director?.fullName || "Sin asignar"}
                  </td>
                  <td>{modality.daysSinceStart || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {reportData.modalities.length > 50 && (
            <p className="table-note">
              Mostrando 50 de {reportData.modalities.length} registros
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderStudents = () => {
    const students = reportData.students || reportData.completedModalities;
    if (!students || students.length === 0) {
      return <p>No hay estudiantes para mostrar</p>;
    }

    return (
      <div className="report-section">
        <h3>👥 Estudiantes ({students.length})</h3>
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Progreso</th>
                <th>Días</th>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 50).map((student, idx) => (
                <tr key={student.studentId || idx}>
                  <td>{student.studentCode || student.students?.[0]?.studentCode}</td>
                  <td className="text-truncate">
                    {student.fullName || student.students?.[0]?.fullName}
                  </td>
                  <td className="text-truncate">{student.modalityName || student.modalityTypeName}</td>
                  <td>
                    <span className="badge badge-info">
                      {student.modalityStatusDescription || student.result}
                    </span>
                  </td>
                  <td>
                    {student.progressPercentage && (
                      <div className="progress-bar-mini">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${student.progressPercentage}%` }}
                        ></div>
                        <span>{student.progressPercentage}%</span>
                      </div>
                    )}
                  </td>
                  <td>{student.daysInModality || student.completionDays || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length > 50 && (
            <p className="table-note">
              Mostrando 50 de {students.length} registros
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderDirectors = () => {
    if (!reportData.directors || reportData.directors.length === 0) {
      return <p>No hay directores para mostrar</p>;
    }

    return (
      <div className="report-section">
        <h3>👨‍🏫 Directores ({reportData.directors.length})</h3>
        <div className="table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Total</th>
                <th>Activas</th>
                <th>Completadas</th>
                <th>Carga</th>
              </tr>
            </thead>
            <tbody>
              {reportData.directors.map((director, idx) => (
                <tr key={director.directorId || idx}>
                  <td className="text-truncate">{director.fullName}</td>
                  <td className="text-small">{director.email}</td>
                  <td>{director.totalAssignedModalities}</td>
                  <td>{director.activeModalities}</td>
                  <td>{director.completedModalities}</td>
                  <td>
                    <span className={`badge badge-${getWorkloadClass(director.workloadStatus)}`}>
                      {director.workloadStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    const stats = reportData.generalStatistics || reportData.programStatistics;
    if (!stats) {
      return <p>No hay estadísticas disponibles</p>;
    }

    return (
      <div className="report-section">
        <h3>📊 Estadísticas Generales</h3>
        <div className="stats-panel">
          {Array.isArray(stats) ? (
            stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <h4>{stat.programName || stat.modalityType}</h4>
                <div className="stat-details">
                  {Object.entries(stat).map(([key, value]) => {
                    if (typeof value === "object" || key === "programName") return null;
                    return (
                      <div key={key} className="stat-row">
                        <span>{formatKey(key)}:</span>
                        <strong>{formatValue(value)}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="stat-card">
              <div className="stat-details">
                {Object.entries(stats).map(([key, value]) => {
                  if (typeof value === "object" && value !== null) return null;
                  return (
                    <div key={key} className="stat-row">
                      <span>{formatKey(key)}:</span>
                      <strong>{formatValue(value)}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMetadata = () => {
    return (
      <div className="report-section">
        <h3>ℹ️ Información del Reporte</h3>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">Generado:</span>
            <span className="metadata-value">
              {new Date(reportData.generatedAt).toLocaleString("es-CO")}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Generado por:</span>
            <span className="metadata-value">{reportData.generatedBy}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Programa:</span>
            <span className="metadata-value">{reportData.academicProgramName}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Tipo:</span>
            <span className="metadata-value">{reportType}</span>
          </div>
          {reportData.metadata && (
            <>
              <div className="metadata-item">
                <span className="metadata-label">Registros:</span>
                <span className="metadata-value">{reportData.metadata.totalRecords}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Tiempo:</span>
                <span className="metadata-value">
                  {reportData.metadata.generationTimeMs}ms
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "summary", label: "Resumen", icon: "📊" },
    { id: "modalities", label: "Modalidades", icon: "📋" },
    { id: "students", label: "Estudiantes", icon: "👥" },
    { id: "directors", label: "Directores", icon: "👨‍🏫" },
    { id: "statistics", label: "Estadísticas", icon: "📈" },
    { id: "metadata", label: "Info", icon: "ℹ️" }
  ];

  return (
    <div className="report-viewer-overlay" onClick={onClose}>
      <div className="report-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="report-viewer-header">
          <div>
            <h2>📊 Visualizador de Reporte</h2>
            <p className="report-subtitle">{reportType}</p>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="report-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`report-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="report-viewer-body">
          {activeTab === "summary" && renderSummary()}
          {activeTab === "modalities" && renderModalities()}
          {activeTab === "students" && renderStudents()}
          {activeTab === "directors" && renderDirectors()}
          {activeTab === "statistics" && renderStatistics()}
          {activeTab === "metadata" && renderMetadata()}
        </div>

        <div className="report-viewer-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button 
            className="btn-primary"
            onClick={() => {
              const jsonString = JSON.stringify(report, null, 2);
              const blob = new Blob([jsonString], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `reporte_${reportType}_${Date.now()}.json`;
              a.click();
            }}
          >
            📥 Descargar JSON
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// UTILIDADES
// ==========================================

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, " ");
}

function formatValue(value) {
  if (value === null || value === undefined) return "N/D";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") {
    if (Number.isInteger(value)) return value.toLocaleString("es-CO");
    return value.toFixed(2);
  }
  return String(value);
}

function getWorkloadClass(status) {
  const statusMap = {
    "LOW": "success",
    "NORMAL": "info",
    "HIGH": "warning",
    "OVERLOADED": "danger"
  };
  return statusMap[status] || "info";
}