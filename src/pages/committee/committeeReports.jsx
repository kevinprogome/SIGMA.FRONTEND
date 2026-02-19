import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAvailableModalityTypes,
  downloadGlobalModalitiesPDF,
  downloadModalityComparisonPDF,
  downloadCompletedModalitiesPDF,
  downloadDefenseCalendarPDF,
  downloadStudentListingPDF,
  downloadDirectorAssignedModalitiesPDF,
  getCurrentPeriod,
  RESULT_TYPES,
  SORT_OPTIONS
} from "../../services/reportsService";
import "../../styles/council/reports.css";

export default function CommitteeReports() {
  const navigate = useNavigate();

  const [modalityTypes, setModalityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(null);
  const [message, setMessage] = useState("");
  
  // Estados de filtros por reporte
  const [showFilters, setShowFilters] = useState(null);
  const [filters, setFilters] = useState({
    comparison: {
      year: getCurrentPeriod().year,
      semester: getCurrentPeriod().semester,
      onlyActiveModalities: false,
      includeHistoricalComparison: true,
      historicalPeriodsCount: 4,
      includeTrendsAnalysis: true
    },
    completed: {
      year: getCurrentPeriod().year,
      semester: null,
      results: ["SUCCESS", "FAILED"],
      sortBy: "DATE",
      sortDirection: "DESC"
    },
    defense: {
      includeCompleted: false
    },
    students: {
      year: getCurrentPeriod().year,
      semester: getCurrentPeriod().semester,
      sortBy: "NAME",
      sortDirection: "ASC"
    },
    directors: {
      onlyActiveModalities: false,
      includeWorkloadAnalysis: true
    }
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const typesData = await getAvailableModalityTypes();
      
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

  const toggleFilters = (reportType) => {
    setShowFilters(showFilters === reportType ? null : reportType);
  };

  const updateFilter = (reportType, field, value) => {
    setFilters(prev => ({
      ...prev,
      [reportType]: {
        ...prev[reportType],
        [field]: value
      }
    }));
  };

  // ==========================================
  // DESCARGA DE REPORTES CON FILTROS
  // ==========================================

  const handleDownloadGlobalPDF = async () => {
    try {
      setGeneratingReport("global-pdf");
      console.log("📊 Descargando reporte global");
      await downloadGlobalModalitiesPDF();
      showMessage("✅ PDF descargado exitosamente", "success");
    } catch (err) {
      console.error("❌ Error detallado:", err);
      console.error("Response:", err.response?.data);
      showMessage(
        `❌ Error al descargar PDF: ${err.response?.data?.error || err.message || 'Error desconocido'}`,
        "error"
      );
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadComparisonPDF = async () => {
    try {
      setGeneratingReport("comparison-pdf");
      console.log("📊 Descargando reporte comparativo con filtros:", filters.comparison);
      await downloadModalityComparisonPDF(filters.comparison);
      showMessage("✅ PDF comparativo descargado", "success");
    } catch (err) {
      console.error("❌ Error detallado al descargar PDF comparativo:", err);
      console.error("Filtros enviados:", filters.comparison);
      console.error("Response:", err.response?.data);
      showMessage(
        `❌ Error al descargar PDF: ${err.response?.data?.error || err.message || 'Error desconocido'}`,
        "error"
      );
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadCompletedPDF = async () => {
    try {
      setGeneratingReport("completed-pdf");
      console.log("📊 Descargando reporte de completadas con filtros:", filters.completed);
      await downloadCompletedModalitiesPDF(filters.completed);
      showMessage("✅ PDF de modalidades completadas descargado", "success");
    } catch (err) {
      console.error("❌ Error detallado:", err);
      console.error("Filtros enviados:", filters.completed);
      console.error("Response:", err.response?.data);
      showMessage(
        `❌ Error al descargar PDF: ${err.response?.data?.error || err.message || 'Error desconocido'}`,
        "error"
      );
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadDefenseCalendarPDF = async () => {
    try {
      setGeneratingReport("defense-pdf");
      console.log("📊 Descargando calendario con filtros:", filters.defense);
      await downloadDefenseCalendarPDF(
        null, 
        null, 
        filters.defense.includeCompleted
      );
      showMessage("✅ PDF de calendario descargado", "success");
    } catch (err) {
      console.error("❌ Error detallado:", err);
      console.error("Filtros enviados:", filters.defense);
      console.error("Response:", err.response?.data);
      showMessage(
        `❌ Error al descargar PDF: ${err.response?.data?.error || err.message || 'Error desconocido'}`,
        "error"
      );
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadStudentListingPDF = async () => {
    try {
      setGeneratingReport("students-pdf");
      console.log("📊 Descargando listado de estudiantes con filtros:", filters.students);
      await downloadStudentListingPDF(filters.students);
      showMessage("✅ PDF de listado descargado", "success");
    } catch (err) {
      console.error("❌ Error detallado:", err);
      console.error("Filtros enviados:", filters.students);
      console.error("Response:", err.response?.data);
      showMessage(
        `❌ Error al descargar PDF: ${err.response?.data?.error || err.message || 'Error desconocido'}`,
        "error"
      );
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadDirectorPDF = async () => {
    try {
      setGeneratingReport("directors-pdf");
      console.log("📊 Descargando reporte de directores con filtros:", filters.directors);
      await downloadDirectorAssignedModalitiesPDF(filters.directors);
      showMessage("✅ PDF de directores descargado", "success");
    } catch (err) {
      console.error("❌ Error detallado:", err);
      console.error("Filtros enviados:", filters.directors);
      console.error("Response:", err.response?.data);
      showMessage(
        `❌ Error al descargar PDF: ${err.response?.data?.error || err.message || 'Error desconocido'}`,
        "error"
      );
    } finally {
      setGeneratingReport(null);
    }
  };

  // ==========================================
  // COMPONENTES DE FILTROS
  // ==========================================

  const renderComparisonFilters = () => (
    <div className="filters-panel">
      <div className="filter-group">
        <label>Año:</label>
        <input
          type="number"
          value={filters.comparison.year}
          onChange={(e) => updateFilter('comparison', 'year', parseInt(e.target.value))}
          min="2020"
          max="2030"
        />
      </div>
      <div className="filter-group">
        <label>Semestre:</label>
        <select
          value={filters.comparison.semester}
          onChange={(e) => updateFilter('comparison', 'semester', parseInt(e.target.value))}
        >
          <option value={1}>Semestre 1</option>
          <option value={2}>Semestre 2</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Períodos históricos:</label>
        <input
          type="number"
          value={filters.comparison.historicalPeriodsCount}
          onChange={(e) => updateFilter('comparison', 'historicalPeriodsCount', parseInt(e.target.value))}
          min="2"
          max="12"
        />
      </div>
      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.comparison.onlyActiveModalities}
            onChange={(e) => updateFilter('comparison', 'onlyActiveModalities', e.target.checked)}
          />
          Solo modalidades activas
        </label>
      </div>
      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.comparison.includeHistoricalComparison}
            onChange={(e) => updateFilter('comparison', 'includeHistoricalComparison', e.target.checked)}
          />
          Incluir comparación histórica
        </label>
      </div>
      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.comparison.includeTrendsAnalysis}
            onChange={(e) => updateFilter('comparison', 'includeTrendsAnalysis', e.target.checked)}
          />
          Incluir análisis de tendencias
        </label>
      </div>
    </div>
  );

  const renderCompletedFilters = () => (
    <div className="filters-panel">
      <div className="filter-group">
        <label>Año:</label>
        <input
          type="number"
          value={filters.completed.year}
          onChange={(e) => updateFilter('completed', 'year', parseInt(e.target.value))}
          min="2020"
          max="2030"
        />
      </div>
      <div className="filter-group">
        <label>Semestre (opcional):</label>
        <select
          value={filters.completed.semester || ""}
          onChange={(e) => updateFilter('completed', 'semester', e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Todos los semestres</option>
          <option value={1}>Semestre 1</option>
          <option value={2}>Semestre 2</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Resultados:</label>
        <div className="checkbox-list">
          {RESULT_TYPES.map(result => (
            <label key={result.value}>
              <input
                type="checkbox"
                checked={filters.completed.results.includes(result.value)}
                onChange={(e) => {
                  const newResults = e.target.checked
                    ? [...filters.completed.results, result.value]
                    : filters.completed.results.filter(r => r !== result.value);
                  updateFilter('completed', 'results', newResults);
                }}
              />
              {result.label}
            </label>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <label>Ordenar por:</label>
        <select
          value={filters.completed.sortBy}
          onChange={(e) => updateFilter('completed', 'sortBy', e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Dirección:</label>
        <select
          value={filters.completed.sortDirection}
          onChange={(e) => updateFilter('completed', 'sortDirection', e.target.value)}
        >
          <option value="ASC">Ascendente</option>
          <option value="DESC">Descendente</option>
        </select>
      </div>
    </div>
  );

  const renderDefenseFilters = () => (
    <div className="filters-panel">
      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.defense.includeCompleted}
            onChange={(e) => updateFilter('defense', 'includeCompleted', e.target.checked)}
          />
          Incluir sustentaciones completadas
        </label>
      </div>
    </div>
  );

  const renderStudentFilters = () => (
    <div className="filters-panel">
      <div className="filter-group">
        <label>Año:</label>
        <input
          type="number"
          value={filters.students.year}
          onChange={(e) => updateFilter('students', 'year', parseInt(e.target.value))}
          min="2020"
          max="2030"
        />
      </div>
      <div className="filter-group">
        <label>Semestre:</label>
        <select
          value={filters.students.semester}
          onChange={(e) => updateFilter('students', 'semester', parseInt(e.target.value))}
        >
          <option value={1}>Semestre 1</option>
          <option value={2}>Semestre 2</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Ordenar por:</label>
        <select
          value={filters.students.sortBy}
          onChange={(e) => updateFilter('students', 'sortBy', e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Dirección:</label>
        <select
          value={filters.students.sortDirection}
          onChange={(e) => updateFilter('students', 'sortDirection', e.target.value)}
        >
          <option value="ASC">Ascendente</option>
          <option value="DESC">Descendente</option>
        </select>
      </div>
    </div>
  );

  const renderDirectorFilters = () => (
    <div className="filters-panel">
      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.directors.onlyActiveModalities}
            onChange={(e) => updateFilter('directors', 'onlyActiveModalities', e.target.checked)}
          />
          Solo modalidades activas
        </label>
      </div>
      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.directors.includeWorkloadAnalysis}
            onChange={(e) => updateFilter('directors', 'includeWorkloadAnalysis', e.target.checked)}
          />
          Incluir análisis de carga de trabajo
        </label>
      </div>
    </div>
  );

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
            Configuración y descarga de reportes estadísticos del programa
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
        {/* Reporte Global - SIN FILTROS */}
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
              className="btn-primary full-width"
              onClick={handleDownloadGlobalPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "global-pdf" ? (
                <>
                  <span className="spinner-small"></span> Generando PDF...
                </>
              ) : (
                <>📥 Descargar Reporte PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Reporte Comparativo - CON FILTROS */}
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
          
          <button 
            className="btn-filters"
            onClick={() => toggleFilters('comparison')}
          >
            {showFilters === 'comparison' ? '▼' : '▶'} Configurar Filtros
          </button>
          
          {showFilters === 'comparison' && renderComparisonFilters()}
          
          <div className="report-actions">
            <button
              className="btn-primary full-width"
              onClick={handleDownloadComparisonPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "comparison-pdf" ? (
                <>
                  <span className="spinner-small"></span> Generando PDF...
                </>
              ) : (
                <>📥 Descargar Reporte PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Modalidades Completadas - CON FILTROS */}
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
          
          <button 
            className="btn-filters"
            onClick={() => toggleFilters('completed')}
          >
            {showFilters === 'completed' ? '▼' : '▶'} Configurar Filtros
          </button>
          
          {showFilters === 'completed' && renderCompletedFilters()}
          
          <div className="report-actions">
            <button
              className="btn-primary full-width"
              onClick={handleDownloadCompletedPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "completed-pdf" ? (
                <>
                  <span className="spinner-small"></span> Generando PDF...
                </>
              ) : (
                <>📥 Descargar Reporte PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Calendario de Sustentaciones - CON FILTROS */}
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
          
          <button 
            className="btn-filters"
            onClick={() => toggleFilters('defense')}
          >
            {showFilters === 'defense' ? '▼' : '▶'} Configurar Filtros
          </button>
          
          {showFilters === 'defense' && renderDefenseFilters()}
          
          <div className="report-actions">
            <button
              className="btn-primary full-width"
              onClick={handleDownloadDefenseCalendarPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "defense-pdf" ? (
                <>
                  <span className="spinner-small"></span> Generando PDF...
                </>
              ) : (
                <>📥 Descargar Reporte PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Listado de Estudiantes - CON FILTROS */}
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
          
          <button 
            className="btn-filters"
            onClick={() => toggleFilters('students')}
          >
            {showFilters === 'students' ? '▼' : '▶'} Configurar Filtros
          </button>
          
          {showFilters === 'students' && renderStudentFilters()}
          
          <div className="report-actions">
            <button
              className="btn-primary full-width"
              onClick={handleDownloadStudentListingPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "students-pdf" ? (
                <>
                  <span className="spinner-small"></span> Generando PDF...
                </>
              ) : (
                <>📥 Descargar Reporte PDF</>
              )}
            </button>
          </div>
        </div>

        {/* Reporte de Directores - CON FILTROS */}
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
          
          <button 
            className="btn-filters"
            onClick={() => toggleFilters('directors')}
          >
            {showFilters === 'directors' ? '▼' : '▶'} Configurar Filtros
          </button>
          
          {showFilters === 'directors' && renderDirectorFilters()}
          
          <div className="report-actions">
            <button
              className="btn-primary full-width"
              onClick={handleDownloadDirectorPDF}
              disabled={generatingReport !== null}
            >
              {generatingReport === "directors-pdf" ? (
                <>
                  <span className="spinner-small"></span> Generando PDF...
                </>
              ) : (
                <>📥 Descargar Reporte PDF</>
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
            <li>Configura los filtros antes de descargar cada reporte</li>
            <li>Los archivos PDF se descargan automáticamente al navegador</li>
            <li>Todos los reportes incluyen metadatos de generación y período</li>
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
    </div>
  );
}