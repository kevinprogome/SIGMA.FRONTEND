// src/components/committee/CommitteeReports.jsx
import React, { useState, useEffect } from 'react';
import "../../styles/council/reports.css";

// Importar servicios
import {
  downloadGlobalModalitiesPDF,
  downloadFilteredModalitiesPDF,
  downloadModalityComparisonPDF,
  downloadModalityHistoricalPDF,
  downloadCompletedModalitiesPDF,
  downloadDefenseCalendarPDF,
  downloadStudentListingPDF,
  downloadDirectorPerformancePDF,
  downloadIndividualDirectorPDF,
  getAvailableModalityTypes,
  getDirectors,
  testConnection,
  PROCESS_STATUSES,
  RESULT_TYPES,
  DISTINCTION_TYPES,
  TIMELINE_STATUSES,
  MODALITY_TYPE_FILTERS,
  SORT_OPTIONS,
  getCurrentPeriod
} from '../../services/reportsService';

const CommitteeReports = () => {
  // ========================================
  // ESTADOS
  // ========================================
  const [openFilterDialog, setOpenFilterDialog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modalityTypes, setModalityTypes] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Estados de filtros para cada reporte
  const [filters, setFilters] = useState({
    filtered: {
      degreeModalityNames: [],
      processStatuses: [],
      startDate: '',
      endDate: '',
      includeWithoutDirector: false,
      onlyWithDirector: false
    },
    comparison: {
      year: getCurrentPeriod().year,
      semester: getCurrentPeriod().semester,
      includeHistoricalComparison: true,
      historicalPeriodsCount: 4,
      includeTrendsAnalysis: true,
      onlyActiveModalities: false
    },
    historical: {
      modalityTypeId: null,
      periods: 8
    },
    completed: {
      modalityTypes: [],
      results: [],
      year: null,
      semester: null,
      startDate: '',
      endDate: '',
      onlyWithDistinction: false,
      distinctionType: '',
      directorId: null,
      minGrade: null,
      maxGrade: null,
      modalityTypeFilter: '',
      sortBy: 'DATE',
      sortDirection: 'DESC'
    },
    calendar: {
      startDate: '',
      endDate: '',
      includeCompleted: false
    },
    studentListing: {
      statuses: [],
      modalityTypes: [],
      year: null,
      timelineStatus: '',
      modalityTypeFilter: '',
      hasDirector: null,
      sortBy: 'NAME',
      sortDirection: 'ASC',
      includeInactive: false
    },
    directors: {
      directorId: null,
      processStatuses: [],
      modalityTypes: [],
      onlyOverloaded: false,
      onlyAvailable: false,
      onlyActiveModalities: true,
      includeWorkloadAnalysis: true
    },
    individualDirector: {
      directorId: null
    }
  });

  // ========================================
  // EFECTOS
  // ========================================

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setGlobalLoading(true);
        
        // Verificar conexión
        const connected = await testConnection();
        setConnectionStatus(connected ? 'connected' : 'error');

        // Cargar tipos de modalidad
        try {
          const types = await getAvailableModalityTypes();
          setModalityTypes(types);
        } catch (err) {
          console.error('Error cargando tipos de modalidad:', err);
        }

        // Cargar directores
        try {
          const directorsList = await getDirectors();
          setDirectors(directorsList);
        } catch (err) {
          console.error('Error cargando directores:', err);
        }
      } catch (err) {
        console.error('Error cargando datos iniciales:', err);
        setConnectionStatus('error');
      } finally {
        setGlobalLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // ========================================
  // HANDLERS DE DESCARGA
  // ========================================

  const handleDownloadGlobal = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await downloadGlobalModalitiesPDF();
      setSuccess(`✅ ${result.filename} descargado exitosamente`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message || 'Error al descargar el reporte global');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFiltered = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await downloadFilteredModalitiesPDF(filters.filtered);
      setSuccess(`✅ ${result.filename} descargado exitosamente`);
      setTimeout(() => setSuccess(null), 5000);
      setOpenFilterDialog(null);
    } catch (err) {
      setError(err.message || 'Error al descargar el reporte filtrado');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await downloadModalityComparisonPDF(filters.comparison);
      setSuccess(`✅ ${result.filename} descargado exitosamente`);
      setTimeout(() => setSuccess(null), 5000);
      setOpenFilterDialog(null);
    } catch (err) {
      setError(err.message || 'Error al descargar el reporte comparativo');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHistorical = async () => {
    if (!filters.historical.modalityTypeId) {
      setError('⚠️ Debe seleccionar un tipo de modalidad');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await downloadModalityHistoricalPDF(
        filters.historical.modalityTypeId,
        filters.historical.periods
      );
      setSuccess(`✅ ${result.filename} descargado exitosamente`);
      setTimeout(() => setSuccess(null), 5000);
      setOpenFilterDialog(null);
    } catch (err) {
      setError(err.message || 'Error al descargar el reporte histórico');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCompleted = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await downloadCompletedModalitiesPDF(filters.completed);
      setSuccess(`✅ ${result.filename} descargado exitosamente`);
      setTimeout(() => setSuccess(null), 5000);
      setOpenFilterDialog(null);
    } catch (err) {
      setError(err.message || 'Error al descargar el reporte de completadas');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCalendar = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await downloadDefenseCalendarPDF(filters.calendar);
      setSuccess(`✅ ${result.filename} descargado exitosamente`);
      setTimeout(() => setSuccess(null), 5000);
      setOpenFilterDialog(null);
    } catch (err) {
      setError(err.message || 'Error al descargar el calendario');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStudentListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await downloadStudentListingPDF(filters.studentListing);
      setSuccess(`✅ ${result.filename} descargado exitosamente`);
      setTimeout(() => setSuccess(null), 5000);
      setOpenFilterDialog(null);
    } catch (err) {
      setError(err.message || 'Error al descargar el listado de estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDirectors = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await downloadDirectorPerformancePDF(filters.directors);
      setSuccess(`✅ ${result.filename} descargado exitosamente`);
      setTimeout(() => setSuccess(null), 5000);
      setOpenFilterDialog(null);
    } catch (err) {
      setError(err.message || 'Error al descargar el reporte de directores');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadIndividualDirector = async () => {
    if (!filters.individualDirector.directorId) {
      setError('⚠️ Debe seleccionar un director');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await downloadIndividualDirectorPDF(filters.individualDirector.directorId);
      setSuccess(`✅ ${result.filename} descargado exitosamente`);
      setTimeout(() => setSuccess(null), 5000);
      setOpenFilterDialog(null);
    } catch (err) {
      setError(err.message || 'Error al descargar el reporte del director');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HANDLERS DE FILTROS
  // ========================================

  const handleFilterChange = (reportType, field, value) => {
    setFilters(prev => ({
      ...prev,
      [reportType]: {
        ...prev[reportType],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (reportType, field, value) => {
    setFilters(prev => {
      const currentValues = prev[reportType][field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [reportType]: {
          ...prev[reportType],
          [field]: newValues
        }
      };
    });
  };

  // ========================================
  // RENDERIZADO DE FILTROS
  // ========================================

  const renderFilteredFilters = () => (
    <div className="filters-panel">
      <div className="filter-group">
        <label>Tipos de Modalidad</label>
        <div className="checkbox-list">
          {modalityTypes.map((type) => (
            <label key={type.id}>
              <input
                type="checkbox"
                checked={filters.filtered.degreeModalityNames.includes(type.name)}
                onChange={() => handleCheckboxChange('filtered', 'degreeModalityNames', type.name)}
              />
              {type.name} ({type.activeModalitiesCount || 0} activas)
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Estados de Proceso</label>
        <div className="checkbox-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {PROCESS_STATUSES.map((status) => (
            <label key={status.value}>
              <input
                type="checkbox"
                checked={filters.filtered.processStatuses.includes(status.value)}
                onChange={() => handleCheckboxChange('filtered', 'processStatuses', status.value)}
              />
              {status.label}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Fecha Inicio (Opcional)</label>
        <input
          type="date"
          value={filters.filtered.startDate}
          onChange={(e) => handleFilterChange('filtered', 'startDate', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Fecha Fin (Opcional)</label>
        <input
          type="date"
          value={filters.filtered.endDate}
          onChange={(e) => handleFilterChange('filtered', 'endDate', e.target.value)}
        />
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.filtered.onlyWithDirector}
            onChange={(e) => {
              setFilters(prev => ({
                ...prev,
                filtered: {
                  ...prev.filtered,
                  onlyWithDirector: e.target.checked,
                  includeWithoutDirector: false
                }
              }));
            }}
          />
          Solo modalidades con director
        </label>
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.filtered.includeWithoutDirector}
            onChange={(e) => {
              setFilters(prev => ({
                ...prev,
                filtered: {
                  ...prev.filtered,
                  includeWithoutDirector: e.target.checked,
                  onlyWithDirector: false
                }
              }));
            }}
          />
          Solo modalidades sin director
        </label>
      </div>
    </div>
  );

  const renderComparisonFilters = () => (
    <div className="filters-panel">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="filter-group">
          <label>Año</label>
          <input
            type="number"
            value={filters.comparison.year}
            onChange={(e) => handleFilterChange('comparison', 'year', parseInt(e.target.value) || getCurrentPeriod().year)}
            min="2020"
            max="2030"
          />
        </div>

        <div className="filter-group">
          <label>Semestre</label>
          <select
            value={filters.comparison.semester}
            onChange={(e) => handleFilterChange('comparison', 'semester', parseInt(e.target.value))}
          >
            <option value={1}>Semestre 1</option>
            <option value={2}>Semestre 2</option>
          </select>
        </div>
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.comparison.includeHistoricalComparison}
            onChange={(e) => handleFilterChange('comparison', 'includeHistoricalComparison', e.target.checked)}
          />
          Incluir comparación histórica
        </label>
      </div>

      {filters.comparison.includeHistoricalComparison && (
        <div className="filter-group">
          <label>Número de periodos históricos (2-10)</label>
          <input
            type="number"
            value={filters.comparison.historicalPeriodsCount}
            onChange={(e) => handleFilterChange('comparison', 'historicalPeriodsCount', parseInt(e.target.value) || 4)}
            min="2"
            max="10"
          />
          <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
            Comparará con los últimos {filters.comparison.historicalPeriodsCount} semestres ({filters.comparison.historicalPeriodsCount / 2} años)
          </small>
        </div>
      )}

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.comparison.includeTrendsAnalysis}
            onChange={(e) => handleFilterChange('comparison', 'includeTrendsAnalysis', e.target.checked)}
          />
          Incluir análisis de tendencias
        </label>
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.comparison.onlyActiveModalities}
            onChange={(e) => handleFilterChange('comparison', 'onlyActiveModalities', e.target.checked)}
          />
          Solo modalidades activas
        </label>
      </div>
    </div>
  );

  const renderHistoricalFilters = () => (
    <div className="filters-panel">
      <div className="alert-info" style={{ marginBottom: '1.5rem' }}>
        ℹ️ Selecciona un tipo de modalidad para ver su evolución histórica
      </div>

      <div className="filter-group">
        <label>Tipo de Modalidad *</label>
        <select
          value={filters.historical.modalityTypeId || ''}
          onChange={(e) => handleFilterChange('historical', 'modalityTypeId', e.target.value)}
          required
        >
          <option value="">Seleccionar...</option>
          {modalityTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Número de periodos a analizar (2-20)</label>
        <input
          type="number"
          value={filters.historical.periods}
          onChange={(e) => handleFilterChange('historical', 'periods', parseInt(e.target.value) || 8)}
          min="2"
          max="20"
        />
        <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
          Se analizarán los últimos {filters.historical.periods} periodos (≈ {(filters.historical.periods / 2).toFixed(1)} años)
        </small>
      </div>
    </div>
  );

  const renderCompletedFilters = () => (
    <div className="filters-panel">
      <div className="filter-group">
        <label>Tipos de Modalidad</label>
        <div className="checkbox-list">
          {modalityTypes.map((type) => (
            <label key={type.id}>
              <input
                type="checkbox"
                checked={filters.completed.modalityTypes.includes(type.name)}
                onChange={() => handleCheckboxChange('completed', 'modalityTypes', type.name)}
              />
              {type.name}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Resultados</label>
        <div className="checkbox-list">
          {RESULT_TYPES.map((result) => (
            <label key={result.value}>
              <input
                type="checkbox"
                checked={filters.completed.results.includes(result.value)}
                onChange={() => handleCheckboxChange('completed', 'results', result.value)}
              />
              {result.label}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="filter-group">
          <label>Año</label>
          <input
            type="number"
            value={filters.completed.year || ''}
            onChange={(e) => handleFilterChange('completed', 'year', e.target.value ? parseInt(e.target.value) : null)}
            min="2020"
            max="2030"
          />
        </div>

        <div className="filter-group">
          <label>Semestre</label>
          <select
            value={filters.completed.semester || ''}
            onChange={(e) => handleFilterChange('completed', 'semester', e.target.value || null)}
          >
            <option value="">Todos</option>
            <option value={1}>Semestre 1</option>
            <option value={2}>Semestre 2</option>
          </select>
        </div>
      </div>

      <div className="filter-group">
        <label>Fecha Inicio (Opcional)</label>
        <input
          type="date"
          value={filters.completed.startDate}
          onChange={(e) => handleFilterChange('completed', 'startDate', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Fecha Fin (Opcional)</label>
        <input
          type="date"
          value={filters.completed.endDate}
          onChange={(e) => handleFilterChange('completed', 'endDate', e.target.value)}
        />
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.completed.onlyWithDistinction}
            onChange={(e) => handleFilterChange('completed', 'onlyWithDistinction', e.target.checked)}
          />
          Solo con distinción académica
        </label>
      </div>

      {filters.completed.onlyWithDistinction && (
        <div className="filter-group">
          <label>Tipo de Distinción</label>
          <select
            value={filters.completed.distinctionType}
            onChange={(e) => handleFilterChange('completed', 'distinctionType', e.target.value)}
          >
            <option value="">Todas</option>
            {DISTINCTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="filter-group">
        <label>Director (Opcional)</label>
        <select
          value={filters.completed.directorId || ''}
          onChange={(e) => handleFilterChange('completed', 'directorId', e.target.value || null)}
        >
          <option value="">Todos</option>
          {directors.map((director) => (
            <option key={director.id} value={director.id}>
              {director.name || director.fullName}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="filter-group">
          <label>Calificación Mínima (0.0 - 5.0)</label>
          <input
            type="number"
            value={filters.completed.minGrade || ''}
            onChange={(e) => handleFilterChange('completed', 'minGrade', e.target.value ? parseFloat(e.target.value) : null)}
            min="0"
            max="5"
            step="0.1"
          />
        </div>

        <div className="filter-group">
          <label>Calificación Máxima (0.0 - 5.0)</label>
          <input
            type="number"
            value={filters.completed.maxGrade || ''}
            onChange={(e) => handleFilterChange('completed', 'maxGrade', e.target.value ? parseFloat(e.target.value) : null)}
            min="0"
            max="5"
            step="0.1"
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Tipo (Individual/Grupal)</label>
        <select
          value={filters.completed.modalityTypeFilter}
          onChange={(e) => handleFilterChange('completed', 'modalityTypeFilter', e.target.value)}
        >
          <option value="">Todos</option>
          {MODALITY_TYPE_FILTERS.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="filter-group">
          <label>Ordenar Por</label>
          <select
            value={filters.completed.sortBy}
            onChange={(e) => handleFilterChange('completed', 'sortBy', e.target.value)}
          >
            {SORT_OPTIONS.completed.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Dirección</label>
          <select
            value={filters.completed.sortDirection}
            onChange={(e) => handleFilterChange('completed', 'sortDirection', e.target.value)}
          >
            <option value="ASC">Ascendente</option>
            <option value="DESC">Descendente</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderCalendarFilters = () => (
    <div className="filters-panel">
      <div className="alert-info" style={{ marginBottom: '1.5rem' }}>
        ℹ️ Por defecto: últimos 30 días + próximos 60 días
      </div>

      <div className="filter-group">
        <label>Fecha Inicio (Opcional)</label>
        <input
          type="datetime-local"
          value={filters.calendar.startDate}
          onChange={(e) => handleFilterChange('calendar', 'startDate', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Fecha Fin (Opcional)</label>
        <input
          type="datetime-local"
          value={filters.calendar.endDate}
          onChange={(e) => handleFilterChange('calendar', 'endDate', e.target.value)}
        />
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.calendar.includeCompleted}
            onChange={(e) => handleFilterChange('calendar', 'includeCompleted', e.target.checked)}
          />
          Incluir sustentaciones ya completadas
        </label>
      </div>
    </div>
  );

  const renderStudentListingFilters = () => (
    <div className="filters-panel">
      <div className="filter-group">
        <label>Estados</label>
        <div className="checkbox-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {PROCESS_STATUSES.map((status) => (
            <label key={status.value}>
              <input
                type="checkbox"
                checked={filters.studentListing.statuses.includes(status.value)}
                onChange={() => handleCheckboxChange('studentListing', 'statuses', status.value)}
              />
              {status.label}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Tipos de Modalidad</label>
        <div className="checkbox-list">
          {modalityTypes.map((type) => (
            <label key={type.id}>
              <input
                type="checkbox"
                checked={filters.studentListing.modalityTypes.includes(type.name)}
                onChange={() => handleCheckboxChange('studentListing', 'modalityTypes', type.name)}
              />
              {type.name}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Año (Opcional)</label>
        <input
          type="number"
          value={filters.studentListing.year || ''}
          onChange={(e) => handleFilterChange('studentListing', 'year', e.target.value ? parseInt(e.target.value) : null)}
          min="2020"
          max="2030"
        />
      </div>

      <div className="filter-group">
        <label>Estado de Cronograma</label>
        <select
          value={filters.studentListing.timelineStatus}
          onChange={(e) => handleFilterChange('studentListing', 'timelineStatus', e.target.value)}
        >
          <option value="">Todos</option>
          {TIMELINE_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Tipo (Individual/Grupal)</label>
        <select
          value={filters.studentListing.modalityTypeFilter}
          onChange={(e) => handleFilterChange('studentListing', 'modalityTypeFilter', e.target.value)}
        >
          <option value="">Todos</option>
          {MODALITY_TYPE_FILTERS.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Tiene Director</label>
        <select
          value={filters.studentListing.hasDirector === null ? 'all' : filters.studentListing.hasDirector.toString()}
          onChange={(e) => {
            const value = e.target.value === 'all' ? null : e.target.value === 'true';
            handleFilterChange('studentListing', 'hasDirector', value);
          }}
        >
          <option value="all">Todos</option>
          <option value="true">Con director</option>
          <option value="false">Sin director</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="filter-group">
          <label>Ordenar Por</label>
          <select
            value={filters.studentListing.sortBy}
            onChange={(e) => handleFilterChange('studentListing', 'sortBy', e.target.value)}
          >
            {SORT_OPTIONS.student.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Dirección</label>
          <select
            value={filters.studentListing.sortDirection}
            onChange={(e) => handleFilterChange('studentListing', 'sortDirection', e.target.value)}
          >
            <option value="ASC">Ascendente</option>
            <option value="DESC">Descendente</option>
          </select>
        </div>
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.studentListing.includeInactive}
            onChange={(e) => handleFilterChange('studentListing', 'includeInactive', e.target.checked)}
          />
          Incluir estudiantes inactivos
        </label>
      </div>
    </div>
  );

  const renderDirectorsFilters = () => (
    <div className="filters-panel">
      <div className="filter-group">
        <label>Director Específico (Opcional)</label>
        <select
          value={filters.directors.directorId || ''}
          onChange={(e) => handleFilterChange('directors', 'directorId', e.target.value || null)}
        >
          <option value="">Todos los directores</option>
          {directors.map((director) => (
            <option key={director.id} value={director.id}>
              {director.name || director.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Estados de Proceso</label>
        <div className="checkbox-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {PROCESS_STATUSES.map((status) => (
            <label key={status.value}>
              <input
                type="checkbox"
                checked={filters.directors.processStatuses.includes(status.value)}
                onChange={() => handleCheckboxChange('directors', 'processStatuses', status.value)}
              />
              {status.label}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Tipos de Modalidad</label>
        <div className="checkbox-list">
          {modalityTypes.map((type) => (
            <label key={type.id}>
              <input
                type="checkbox"
                checked={filters.directors.modalityTypes.includes(type.name)}
                onChange={() => handleCheckboxChange('directors', 'modalityTypes', type.name)}
              />
              {type.name}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.directors.onlyOverloaded}
            onChange={(e) => {
              setFilters(prev => ({
                ...prev,
                directors: {
                  ...prev.directors,
                  onlyOverloaded: e.target.checked,
                  onlyAvailable: e.target.checked ? false : prev.directors.onlyAvailable
                }
              }));
            }}
          />
          Solo directores sobrecargados (≥5 modalidades)
        </label>
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.directors.onlyAvailable}
            onChange={(e) => {
              setFilters(prev => ({
                ...prev,
                directors: {
                  ...prev.directors,
                  onlyAvailable: e.target.checked,
                  onlyOverloaded: e.target.checked ? false : prev.directors.onlyOverloaded
                }
              }));
            }}
          />
          Solo directores disponibles (&lt;3 modalidades)
        </label>
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.directors.onlyActiveModalities}
            onChange={(e) => handleFilterChange('directors', 'onlyActiveModalities', e.target.checked)}
          />
          Solo modalidades activas
        </label>
      </div>

      <div className="filter-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={filters.directors.includeWorkloadAnalysis}
            onChange={(e) => handleFilterChange('directors', 'includeWorkloadAnalysis', e.target.checked)}
          />
          Incluir análisis de carga de trabajo
        </label>
      </div>
    </div>
  );

  const renderIndividualDirectorFilters = () => (
    <div className="filters-panel">
      <div className="alert-info" style={{ marginBottom: '1.5rem' }}>
        ℹ️ Genera un reporte individual de un director específico con todas sus modalidades asignadas
      </div>

      <div className="filter-group">
        <label>Seleccionar Director *</label>
        <select
          value={filters.individualDirector.directorId || ''}
          onChange={(e) => handleFilterChange('individualDirector', 'directorId', e.target.value)}
          required
        >
          <option value="">Seleccionar...</option>
          {directors.map((director) => (
            <option key={director.id} value={director.id}>
              {director.name || director.fullName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  if (globalLoading) {
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
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>📊 Reportes del Comité</h1>
          <p className="reports-subtitle">
            Sistema completo de generación de reportes en PDF con análisis detallado
          </p>
        </div>
      </div>

      {/* Estado de conexión */}
      {connectionStatus === 'error' && (
        <div className="reports-alert alert-error">
          <span>❌</span>
          <div>
            <strong>Error de Conexión</strong>
            <p>No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.</p>
          </div>
        </div>
      )}

      {/* Mensajes de éxito/error */}
      {error && (
        <div className="reports-alert alert-error">
          <span>❌</span>
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button
            className="alert-close"
            onClick={() => setError(null)}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="reports-alert alert-success">
          <span>✅</span>
          <div>
            <strong>Éxito</strong>
            <p>{success}</p>
          </div>
          <button
            className="alert-close"
            onClick={() => setSuccess(null)}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}

      {/* Grid de reportes */}
      <div className="reports-grid">
        {/* 1. Reporte Global */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">🌐</span>
            <h3>1. Reporte Global</h3>
          </div>
          <p className="report-description">
            Vista completa de todas las modalidades activas del programa académico
          </p>
          <div className="report-stats">
            <span>Sin filtros</span>
            <span>Vista completa</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-primary full-width"
              onClick={handleDownloadGlobal}
              disabled={loading}
            >
              {loading ? <span className="spinner-small"></span> : '📄'} Descargar PDF
            </button>
          </div>
        </div>

        {/* 2. Reporte Filtrado (RF-46) */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">🔍</span>
            <div>
              <h3>2. Reporte Filtrado</h3>
            </div>
          </div>
          <p className="report-description">
            Modalidades con filtros avanzados por tipo, estado, fechas y director
          </p>
          <div className="report-stats">
            <span>Múltiples filtros</span>
            <span>15-20 páginas</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-filters"
              onClick={() => setOpenFilterDialog(openFilterDialog === 'filtered' ? null : 'filtered')}
              disabled={loading}
            >
              ⚙️ {openFilterDialog === 'filtered' ? 'Ocultar' : 'Configurar'} Filtros
            </button>
            <button
              className="btn-primary full-width"
              onClick={handleDownloadFiltered}
              disabled={loading}
            >
              {loading ? <span className="spinner-small"></span> : '📄'} Descargar PDF
            </button>
          </div>
          {openFilterDialog === 'filtered' && renderFilteredFilters()}
        </div>

        {/* 3. Reporte Comparativo (RF-48) */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">📊</span>
            <div>
              <h3>3. Comparación de Periodos</h3>
            </div>
          </div>
          <p className="report-description">
            Análisis comparativo entre periodos académicos con tendencias históricas
          </p>
          <div className="report-stats">
            <span>Histórico</span>
            <span>Tendencias</span>
            <span>Proyecciones</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-filters"
              onClick={() => setOpenFilterDialog(openFilterDialog === 'comparison' ? null : 'comparison')}
              disabled={loading}
            >
              ⚙️ {openFilterDialog === 'comparison' ? 'Ocultar' : 'Configurar'} Filtros
            </button>
            <button
              className="btn-primary full-width"
              onClick={handleDownloadComparison}
              disabled={loading}
            >
              {loading ? <span className="spinner-small"></span> : '📄'} Descargar PDF
            </button>
          </div>
          {openFilterDialog === 'comparison' && renderComparisonFilters()}
        </div>

        {/* 4. Análisis Histórico */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">📈</span>
            <h3>4. Análisis Histórico</h3>
          </div>
          <p className="report-description">
            Evolución temporal de un tipo específico de modalidad con proyecciones futuras
          </p>
          <div className="report-stats">
            <span>20-30 páginas</span>
            <span>Proyecciones</span>
            <span>KPIs</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-filters"
              onClick={() => setOpenFilterDialog(openFilterDialog === 'historical' ? null : 'historical')}
              disabled={loading}
            >
              ⚙️ {openFilterDialog === 'historical' ? 'Ocultar' : 'Configurar'} Filtros
            </button>
            <button
              className="btn-primary full-width"
              onClick={handleDownloadHistorical}
              disabled={loading}
            >
              {loading ? <span className="spinner-small"></span> : '📄'} Descargar PDF
            </button>
          </div>
          {openFilterDialog === 'historical' && renderHistoricalFilters()}
        </div>

        {/* 5. Modalidades Completadas */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">✅</span>
            <h3>5. Modalidades Completadas</h3>
          </div>
          <p className="report-description">
            Análisis detallado de modalidades finalizadas con resultados, calificaciones y distinciones
          </p>
          <div className="report-stats">
            <span>Exitosas/Fallidas</span>
            <span>Distinciones</span>
            <span>Análisis temporal</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-filters"
              onClick={() => setOpenFilterDialog(openFilterDialog === 'completed' ? null : 'completed')}
              disabled={loading}
            >
              ⚙️ {openFilterDialog === 'completed' ? 'Ocultar' : 'Configurar'} Filtros
            </button>
            <button
              className="btn-primary full-width"
              onClick={handleDownloadCompleted}
              disabled={loading}
            >
              {loading ? <span className="spinner-small"></span> : '📄'} Descargar PDF
            </button>
          </div>
          {openFilterDialog === 'completed' && renderCompletedFilters()}
        </div>

        {/* 6. Calendario de Sustentaciones */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">📅</span>
            <h3>6. Calendario de Sustentaciones</h3>
          </div>
          <p className="report-description">
            Calendario completo de defensas programadas, alertas y estadísticas de jurados
          </p>
          <div className="report-stats">
            <span>Próximas defensas</span>
            <span>Alertas</span>
            <span>20-30 páginas</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-filters"
              onClick={() => setOpenFilterDialog(openFilterDialog === 'calendar' ? null : 'calendar')}
              disabled={loading}
            >
              ⚙️ {openFilterDialog === 'calendar' ? 'Ocultar' : 'Configurar'} Filtros
            </button>
            <button
              className="btn-primary full-width"
              onClick={handleDownloadCalendar}
              disabled={loading}
            >
              {loading ? <span className="spinner-small"></span> : '📄'} Descargar PDF
            </button>
          </div>
          {openFilterDialog === 'calendar' && renderCalendarFilters()}
        </div>

        {/* 7. Listado de Estudiantes */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">👥</span>
            <h3>7. Listado de Estudiantes</h3>
          </div>
          <p className="report-description">
            Reporte detallado de estudiantes con filtros avanzados y análisis de progreso
          </p>
          <div className="report-stats">
            <span>10+ filtros</span>
            <span>Ordenamiento</span>
            <span>Timeline</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-filters"
              onClick={() => setOpenFilterDialog(openFilterDialog === 'studentListing' ? null : 'studentListing')}
              disabled={loading}
            >
              ⚙️ {openFilterDialog === 'studentListing' ? 'Ocultar' : 'Configurar'} Filtros
            </button>
            <button
              className="btn-primary full-width"
              onClick={handleDownloadStudentListing}
              disabled={loading}
            >
              {loading ? <span className="spinner-small"></span> : '📄'} Descargar PDF
            </button>
          </div>
          {openFilterDialog === 'studentListing' && renderStudentListingFilters()}
        </div>

        {/* 8. Desempeño de Directores (RF-49) */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">👨‍🏫</span>
            <div>
              <h3>8. Carga de Directores</h3>
            </div>
          </div>
          <p className="report-description">
            Análisis de carga de trabajo y desempeño de directores del programa
          </p>
          <div className="report-stats">
            <span>Carga laboral</span>
            <span>Sobrecarga</span>
            <span>Disponibilidad</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-filters"
              onClick={() => setOpenFilterDialog(openFilterDialog === 'directors' ? null : 'directors')}
              disabled={loading}
            >
              ⚙️ {openFilterDialog === 'directors' ? 'Ocultar' : 'Configurar'} Filtros
            </button>
            <button
              className="btn-primary full-width"
              onClick={handleDownloadDirectors}
              disabled={loading}
            >
              {loading ? <span className="spinner-small"></span> : '📄'} Descargar PDF
            </button>
          </div>
          {openFilterDialog === 'directors' && renderDirectorsFilters()}
        </div>

        {/* 9. Reporte Individual de Director */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-icon">📋</span>
            <h3>9. Director Individual</h3>
          </div>
          <p className="report-description">
            Reporte completo de un director específico con todas sus modalidades asignadas
          </p>
          <div className="report-stats">
            <span>Director específico</span>
            <span>Detallado</span>
            <span>10-15 páginas</span>
          </div>
          <div className="report-actions">
            <button
              className="btn-filters"
              onClick={() => setOpenFilterDialog(openFilterDialog === 'individualDirector' ? null : 'individualDirector')}
              disabled={loading}
            >
              ⚙️ {openFilterDialog === 'individualDirector' ? 'Ocultar' : 'Configurar'} Filtros
            </button>
            <button
              className="btn-primary full-width"
              onClick={handleDownloadIndividualDirector}
              disabled={loading}
            >
              {loading ? <span className="spinner-small"></span> : '📄'} Descargar PDF
            </button>
          </div>
          {openFilterDialog === 'individualDirector' && renderIndividualDirectorFilters()}
        </div>
      </div>

      {/* Footer informativo */}
      <div className="reports-footer">
        <div className="reports-info-card">
          <h4>📖 Guía de Uso</h4>
          <ul>
            <li>Los reportes marcados con <strong>RF</strong> corresponden a requerimientos funcionales específicos</li>
            <li>Use el botón <strong>"Configurar Filtros"</strong> para personalizar los reportes</li>
            <li>Todos los PDFs incluyen análisis detallado, gráficos y estadísticas profesionales</li>
            <li>Los reportes se generan en tiempo real con los datos más actualizados</li>
          </ul>
        </div>

        <div className="reports-info-card">
          <h4>ℹ️ Información Adicional</h4>
          <ul>
            <li>Tamaño de reportes: entre 10-30 páginas según complejidad</li>
            <li>Tiempo de generación: 5-30 segundos aproximadamente</li>
            <li>Formato de salida: PDF con diseño institucional USCO</li>
            <li>Los filtros son opcionales en la mayoría de reportes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommitteeReports;