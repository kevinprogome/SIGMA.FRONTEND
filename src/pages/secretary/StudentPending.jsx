import { useEffect, useState } from "react";
import { getStudentsPendingModalities } from "../../services/secretaryService";

export default function StudentsPending() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await getStudentsPendingModalities();
        setStudents(res);
      } catch (err) {
        console.error(err);
        setMessage(
          err.response?.data?.message ||
            "Error al cargar estudiantes pendientes"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <p>Cargando estudiantes pendientes...</p>;

  return (
    <div>
      <h2>Estudiantes pendientes de revisión</h2>

      {message && <p>{message}</p>}

      {students.length === 0 ? (
        <p>No hay estudiantes pendientes 🎉</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Modalidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.studentModalityId}>
                <td>{s.studentName}</td>
                <td>{s.modalityName}</td>
                <td>{s.currentStatus}</td>
                <td>
                  <button
                    onClick={() =>
                      console.log(
                        "Ver perfil del studentModalityId:",
                        s.studentModalityId
                      )
                    }
                  >
                    Ver perfil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
