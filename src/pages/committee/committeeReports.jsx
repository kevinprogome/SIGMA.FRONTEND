import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAvailableReports,
  getAvailableModalityTypes,
  getGlobalModalitiesReport,
  downloadGlobalModalitiesPDF,
  getModalityTypeComparison,
  downloadModalityComparisonPDF,
  getCompletedModalitiesReport,
  downloadCompletedModalitiesPDF,
  getDefenseCalendarReport,
  downloadDefenseCalendarPDF,
  getStudentListingReport,
  downloadStudentListingPDF,
  getDirectorAssignedModalities,
  downloadDirectorAssignedModalitiesPDF,
  getCurrentPeriod
} from "../../services/reportsService";
import ReportViewer from "../../components/committee/ReportViewer";
import "../../styles/council/reports.css";

export default function CommitteeReports() {
  const navigate = useNavigate();

  const [availableReports, setAvailableReports] = useState([]);
  const [modalityTypes, setModalityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [reportsData, typesData] = await Promise.all([
        getAvailableReports(),
        getAvailableModalityTypes()
      ]);
      
      if (reportsData.success) {
        setAvailableReports(reportsData.availableReports || {});
      }
      
      if (typesData.success) {
        setModalityTypes(typesData.data?.availableTypes || []);
      }
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      showMessage("Error al cargar información de reportes", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = "info") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(""), 5000);
  };

  // ==========================================
  // GENERADORES DE REPORTES
  // ==========================================

  const handleGenerateGlobalReport = async () => {
    try {
      setGeneratingReport("global");
      const data = await getGlobalModalitiesReport();
      
      if (data.success) {
        setCurrentReport(data);
        setShowViewer(true);
        showMessage("✅ Reporte global generado exitosamente", "success");
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al generar reporte global", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadGlobalPDF = async () => {
    try {
      setGeneratingReport("global-pdf");
      await downloadGlobalModalitiesPDF();
      showMessage("✅ PDF descargado exitosamente", "success");
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al descargar PDF", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleGenerateComparison = async () => {
    try {
      setGeneratingReport("comparison");
      const { year, semester } = getCurrentPeriod();
      
      const filters = {
        year,
        semester,
        onlyActiveModalities: false,
        includeHistoricalComparison: true,
        historicalPeriodsCount: 4,
        includeTrendsAnalysis: true
      };
      
      const data = await getModalityTypeComparison(filters);
      
      if (data.success) {
        setCurrentReport(data);
        setShowViewer(true);
        showMessage("✅ Reporte comparativo generado", "success");
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al generar reporte comparativo", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadComparisonPDF = async () => {
    try {
      setGeneratingReport("comparison-pdf");
      const { year, semester } = getCurrentPeriod();
      
      const filters = {
        year,
        semester,
        includeHistoricalComparison: true,
        historicalPeriodsCount: 4
      };
      
      await downloadModalityComparisonPDF(filters);
      showMessage("✅ PDF comparativo descargado", "success");
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al descargar PDF", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleGenerateCompleted = async () => {
    try {
      setGeneratingReport("completed");
      const { year } = getCurrentPeriod();
      
      const filters = {
        year,
        results: ["SUCCESS", "FAILED"],
        sortBy: "DATE",
        sortDirection: "DESC"
      };
      
      const data = await getCompletedModalitiesReport(filters);
      
      if (data.success) {
        setCurrentReport(data);
        setShowViewer(true);
        showMessage("✅ Reporte de modalidades completadas generado", "success");
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al generar reporte", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadCompletedPDF = async () => {
    try {
      setGeneratingReport("completed-pdf");
      const { year } = getCurrentPeriod();
      
      const filters = {
        year,
        results: ["SUCCESS", "FAILED"]
      };
      
      await downloadCompletedModalitiesPDF(filters);
      showMessage("✅ PDF de modalidades completadas descargado", "success");
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al descargar PDF", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleGenerateDefenseCalendar = async () => {
    try {
      setGeneratingReport("defense");
      const data = await getDefenseCalendarReport(null, null, false);
      
      if (data.success) {
        setCurrentReport(data);
        setShowViewer(true);
        showMessage("✅ Calendario de sustentaciones generado", "success");
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al generar calendario", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadDefenseCalendarPDF = async () => {
    try {
      setGeneratingReport("defense-pdf");
      await downloadDefenseCalendarPDF(null, null, false);
      showMessage("✅ PDF de calendario descargado", "success");
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al descargar PDF", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleGenerateStudentListing = async () => {
    try {
      setGeneratingReport("students");
      const { year, semester } = getCurrentPeriod();
      
      const filters = {
        year,
        semester,
        sortBy: "NAME",
        sortDirection: "ASC"
      };
      
      const data = await getStudentListingReport(filters);
      
      if (data.success) {
        setCurrentReport(data);
        setShowViewer(true);
        showMessage("✅ Listado de estudiantes generado", "success");
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al generar listado", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadStudentListingPDF = async () => {
    try {
      setGeneratingReport("students-pdf");
      const { year, semester } = getCurrentPeriod();
      
      const filters = {
        year,
        semester
      };
      
      await downloadStudentListingPDF(filters);
      showMessage("✅ PDF de listado descargado", "success");
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al descargar PDF", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleGenerateDirectorReport = async () => {
    try {
      setGeneratingReport("directors");
      const filters = {
        onlyActiveModalities: false,
        includeWorkloadAnalysis: true
      };
      
      const data = await getDirectorAssignedModalities(filters);
      
      if (data.success) {
        setCurrentReport(data);
        setShowViewer(true);
        showMessage("✅ Reporte de directores generado", "success");
      }
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al generar reporte de directores", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadDirectorPDF = async () => {
    try {
      setGeneratingReport("directors-pdf");
      const filters = {
        includeWorkloadAnalysis: true
      };
      
      await downloadDirectorAssignedModalitiesPDF(filters);
      showMessage("✅ PDF de directores descargado", "success");
    } catch (err) {
      console.error("Error:", err);
      showMessage("❌ Error al descargar PDF", "error");
    } finally {
      setGeneratingReport(null);
    }
  };

  const closeViewer = () => {
    setShowViewer(false);
    setCurrentReport(null);
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <div className="spinner"></div>
          <p>Cargando sistema de reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h1>📊 Sistema de Reportes</h1>
          <p className="reports-subtitle">
            Generación y descarga de reportes estadísticos del programa
          </p>
        </div>
        <button 
          className="btn-secondary"
          onClick={() => navigate("/committee/dashboard")}
        >
          ← Volver al Dashboard
        </button>
      </div>

      {message && (
        <div className={`reports-alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="reports-grid">
        {/* Reporte Global */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">🌍</span>
            <h3>Reporte Global</h3>
          </div>
          <p className="report-description">
            Vista completa de todas las modalidades activas, estadísticas generales y estado actual del programa.
          </p>
          <div className="report-stats">
            <span>📊 Modalidades activas</span>
            <span>👥 Estudiantes</span>
            <span>👨‍🏫 Directores</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-primary"
              onClick={handleGenerateGlobalReport}
              disabled={generatingReport !== null}
            >
              {generatingReport === "global" ? (
                <>
                  <span className="spinner-small"></span> Generando...
                </>
              ) : (
                <>Ver Reporte</>
              )}
            </button>
            <button
              className="btn-secondary"
              onClick={handleDownloadGlobalPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "global-pdf" ? (
                <>
                  <span className="spinner-small"></span> Descargando...
                </>
              ) : (
                <>📥 Descargar PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Reporte Comparativo */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">📈</span>
            <h3>Comparativa de Modalidades</h3>
          </div>
          <p className="report-description">
            Análisis comparativo entre diferentes tipos de modalidades, tendencias históricas y proyecciones.
          </p>
          <div className="report-stats">
            <span>📊 Por tipo</span>
            <span>📈 Tendencias</span>
            <span>🔮 Proyecciones</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-primary"
              onClick={handleGenerateComparison}
              disabled={generatingReport !== null}
            >
              {generatingReport === "comparison" ? (
                <>
                  <span className="spinner-small"></span> Generando...
                </>
              ) : (
                <>Ver Reporte</>
              )}
            </button>
            <button
              className="btn-secondary"
              onClick={handleDownloadComparisonPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "comparison-pdf" ? (
                <>
                  <span className="spinner-small"></span> Descargando...
                </>
              ) : (
                <>📥 Descargar PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Modalidades Completadas */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">✅</span>
            <h3>Modalidades Completadas</h3>
          </div>
          <p className="report-description">
            Reporte de modalidades finalizadas con éxito o fallidas, análisis de calificaciones y distinciones.
          </p>
          <div className="report-stats">
            <span>🎓 Exitosas</span>
            <span>📊 Calificaciones</span>
            <span>🏆 Distinciones</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-primary"
              onClick={handleGenerateCompleted}
              disabled={generatingReport !== null}
            >
              {generatingReport === "completed" ? (
                <>
                  <span className="spinner-small"></span> Generando...
                </>
              ) : (
                <>Ver Reporte</>
              )}
            </button>
            <button
              className="btn-secondary"
              onClick={handleDownloadCompletedPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "completed-pdf" ? (
                <>
                  <span className="spinner-small"></span> Descargando...
                </>
              ) : (
                <>📥 Descargar PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Calendario de Sustentaciones */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">📅</span>
            <h3>Calendario de Sustentaciones</h3>
          </div>
          <p className="report-description">
            Cronograma de defensas programadas, próximas sustentaciones y estadísticas de evaluaciones.
          </p>
          <div className="report-stats">
            <span>📅 Próximas</span>
            <span>⏰ En progreso</span>
            <span>✅ Completadas</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-primary"
              onClick={handleGenerateDefenseCalendar}
              disabled={generatingReport !== null}
            >
              {generatingReport === "defense" ? (
                <>
                  <span className="spinner-small"></span> Generando...
                </>
              ) : (
                <>Ver Calendario</>
              )}
            </button>
            <button
              className="btn-secondary"
              onClick={handleDownloadDefenseCalendarPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "defense-pdf" ? (
                <>
                  <span className="spinner-small"></span> Descargando...
                </>
              ) : (
                <>📥 Descargar PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Listado de Estudiantes */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">👥</span>
            <h3>Listado de Estudiantes</h3>
          </div>
          <p className="report-description">
            Listado completo de estudiantes con modalidades activas, progreso, estados y observaciones.
          </p>
          <div className="report-stats">
            <span>👤 Por estudiante</span>
            <span>📊 Progreso</span>
            <span>⏱️ Tiempos</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-primary"
              onClick={handleGenerateStudentListing}
              disabled={generatingReport !== null}
            >
              {generatingReport === "students" ? (
                <>
                  <span className="spinner-small"></span> Generando...
                </>
              ) : (
                <>Ver Listado</>
              )}
            </button>
            <button
              className="btn-secondary"
              onClick={handleDownloadStudentListingPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "students-pdf" ? (
                <>
                  <span className="spinner-small"></span> Descargando...
                </>
              ) : (
                <>📥 Descargar PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Reporte de Directores */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">👨‍🏫</span>
            <h3>Desempeño de Directores</h3>
          </div>
          <p className="report-description">
            Modalidades asignadas por director, carga de trabajo, tasas de éxito y análisis de desempeño.
          </p>
          <div className="report-stats">
            <span>👨‍🏫 Por director</span>
            <span>📊 Carga</span>
            <span>✅ Éxito</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-primary"
              onClick={handleGenerateDirectorReport}
              disabled={generatingReport !== null}
            >
              {generatingReport === "directors" ? (
                <>
                  <span className="spinner-small"></span> Generando...
                </>
              ) : (
                <>Ver Reporte</>
              )}
            </button>
            <button
              className="btn-secondary"
              onClick={handleDownloadDirectorPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "directors-pdf" ? (
                <>
                  <span className="spinner-small"></span> Descargando...
                </>
              ) : (
                <>📥 Descargar PDF</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="reports-footer">
        <div className="reports-info-card">
          <h4>ℹ️ Información</h4>
          <ul>
            <li>Los reportes se generan en tiempo real con datos actuales</li>
            <li>Los archivos PDF se descargan automáticamente al navegador</li>
            <li>Todos los reportes incluyen metadatos de generación y período</li>
            <li>Los reportes en pantalla permiten navegación interactiva</li>
          </ul>
        </div>

        <div className="reports-info-card">
          <h4>🔒 Seguridad</h4>
          <ul>
            <li>Solo miembros del comité pueden acceder a estos reportes</li>
            <li>Los datos están filtrados por programa académico</li>
            <li>Se registra cada generación de reporte en el sistema</li>
          </ul>
        </div>
      </div>

      {/* Visor de Reporte */}
      {showViewer && (
        <ReportViewer
          report={currentReport}
          onClose={closeViewer}
        />
      )}
    </div>
  );
}