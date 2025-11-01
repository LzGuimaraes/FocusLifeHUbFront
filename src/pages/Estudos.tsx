import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface Estudo {
  id: number;
  nome: string;
  duracao_min: number;
  data: string;
  notas: string;
  materia_id: number;
}

interface Materia {
  id: number;
  nome: string;
}

interface FormData {
  nome: string;
  duracao_min: string;
  data: string;
  notas: string;
  materia_id: string;
}

export default function Estudos() {
  const navigate = useNavigate();
  const [estudos, setEstudos] = useState<Estudo[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEstudo, setEditingEstudo] = useState<Estudo | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterMateria, setFilterMateria] = useState<string>("all");
  
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    duracao_min: "",
    data: "",
    notas: "",
    materia_id: "",
  });

  useEffect(() => {
    fetchMaterias();
    fetchEstudos();
  }, [currentPage]);

  const fetchMaterias = async () => {
    try {
      const response = await api.get("/materias/all?page=0&size=100");
      setMaterias(response.data.content || []);
    } catch (err) {
      console.error("Erro ao buscar matérias:", err);
    }
  };

  const fetchEstudos = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/estudos/all?page=${currentPage}&size=6`);
      setEstudos(response.data.content);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar estudos:", err);
      setError(err.response?.data?.message || "Erro ao buscar estudos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim() || !formData.data || !formData.materia_id) {
      alert("Preencha todos os campos obrigatórios (Nome, Data e Matéria)");
      return;
    }

    try {
      const payload = {
        nome: formData.nome,
        duracao_min: formData.duracao_min ? parseInt(formData.duracao_min) : 0,
        data: new Date(formData.data).toISOString(),
        notas: formData.notas,
        materia_id: parseInt(formData.materia_id),
      };

      if (editingEstudo) {
        await api.put(`/estudos/alter/${editingEstudo.id}`, payload);
      } else {
        await api.post("/estudos/create", payload);
      }

      await fetchEstudos();
      closeModal();
    } catch (err: any) {
      console.error("Erro completo:", err);
      alert("Erro: " + (err.response?.data?.message || err.message || "Erro ao salvar estudo"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta sessão de estudo?")) return;

    try {
      await api.delete(`/estudos/delete/${id}`);
      await fetchEstudos();
    } catch (err: any) {
      alert("Erro: " + (err.response?.data?.message || "Erro ao deletar estudo"));
    }
  };

  const openModal = (estudo: Estudo | null = null) => {
    if (estudo) {
      setEditingEstudo(estudo);
      setFormData({
        nome: estudo.nome,
        duracao_min: estudo.duracao_min.toString(),
        data: estudo.data ? new Date(estudo.data).toISOString().split('T')[0] : "",
        notas: estudo.notas || "",
        materia_id: estudo.materia_id.toString(),
      });
    } else {
      setEditingEstudo(null);
      setFormData({
        nome: "",
        duracao_min: "",
        data: "",
        notas: "",
        materia_id: materias.length > 0 ? materias[0].id.toString() : "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEstudo(null);
    setFormData({
      nome: "",
      duracao_min: "",
      data: "",
      notas: "",
      materia_id: "",
    });
  };

  const getMateriaNome = (materiaId: number): string => {
    const materia = materias.find(m => m.id === materiaId);
    return materia ? materia.nome : "Matéria não encontrada";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Sem data";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getDurationColor = (minutes: number) => {
    if (minutes >= 120) return "#10b981"; // Verde - 2h+
    if (minutes >= 60) return "#3b82f6";  // Azul - 1h+
    if (minutes >= 30) return "#f59e0b";  // Laranja - 30min+
    return "#ef4444"; // Vermelho - menos de 30min
  };

  const filteredEstudos = filterMateria === "all" 
    ? estudos 
    : estudos.filter(e => e.materia_id.toString() === filterMateria);

  if (loading && estudos.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando estudos...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button 
            onClick={() => navigate("/dashboard")} 
            style={styles.backButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ← Voltar
          </button>
          <div>
            <h1 style={styles.title}>📚 Gestão de Estudos</h1>
            <p style={styles.subtitle}>Registre e acompanhe suas sessões de estudo</p>
          </div>
        </div>
        <button onClick={() => openModal()} style={styles.addButton}>
          + Nova Sessão
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          ❌ {error}
        </div>
      )}

      <div style={styles.filterContainer}>
        <label style={styles.filterLabel}>Filtrar por Matéria:</label>
        <select
          value={filterMateria}
          onChange={(e) => setFilterMateria(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">Todas as Matérias</option>
          {materias.map(materia => (
            <option key={materia.id} value={materia.id.toString()}>
              {materia.nome}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.content}>
        {filteredEstudos.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📖</span>
            <h3 style={styles.emptyTitle}>Nenhuma sessão de estudo encontrada</h3>
            <p style={styles.emptyText}>
              {materias.length === 0 
                ? "Primeiro cadastre uma matéria para começar a registrar seus estudos"
                : "Comece registrando sua primeira sessão de estudo"}
            </p>
            {materias.length > 0 ? (
              <button onClick={() => openModal()} style={styles.emptyButton}>
                Registrar primeira sessão
              </button>
            ) : (
              <button onClick={() => navigate("/materias")} style={styles.emptyButton}>
                Cadastrar Matéria
              </button>
            )}
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {filteredEstudos.map((estudo) => {
              const durationColor = getDurationColor(estudo.duracao_min);
              
              return (
                <div 
                  key={estudo.id} 
                  style={{
                    ...styles.card,
                    borderTop: `4px solid ${durationColor}`,
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={{
                      ...styles.materiaBadge,
                      backgroundColor: "#8b5cf615",
                      color: "#8b5cf6",
                    }}>
                      {getMateriaNome(estudo.materia_id)}
                    </div>
                    <span style={styles.cardId}>#{estudo.id}</span>
                  </div>
                  
                  <h3 style={styles.cardTitle}>{estudo.nome}</h3>
                  
                  <div style={styles.durationContainer}>
                    <div style={styles.durationBadge}>
                      <span style={{...styles.durationIcon, color: durationColor}}>⏱️</span>
                      <span style={{...styles.durationText, color: durationColor}}>
                        {formatDuration(estudo.duracao_min)}
                      </span>
                    </div>
                  </div>

                  {estudo.notas && (
                    <div style={styles.notasContainer}>
                      <p style={styles.notasLabel}>Anotações:</p>
                      <p style={styles.notasText}>{estudo.notas}</p>
                    </div>
                  )}

                  <div style={styles.cardInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Data:</span>
                      <span style={styles.infoValue}>{formatDate(estudo.data)}</span>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => openModal(estudo)}
                      style={styles.editButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#4f46e5";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#6366f1";
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(estudo.id)}
                      style={styles.deleteButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#dc2626";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#ef4444";
                      }}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              style={{
                ...styles.pageButton,
                ...(currentPage === 0 ? styles.pageButtonDisabled : {}),
              }}
            >
              ← Anterior
            </button>
            
            <span style={styles.pageInfo}>
              Página {currentPage + 1} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              style={{
                ...styles.pageButton,
                ...(currentPage >= totalPages - 1 ? styles.pageButtonDisabled : {}),
              }}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingEstudo ? "Editar Sessão de Estudo" : "Nova Sessão de Estudo"}
              </h2>
              <button onClick={closeModal} style={styles.closeButton}>
                ✕
              </button>
            </div>

            <div style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome da Sessão *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Revisão de álgebra, Leitura do capítulo 3"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Matéria *</label>
                <select
                  value={formData.materia_id}
                  onChange={(e) =>
                    setFormData({ ...formData, materia_id: e.target.value })
                  }
                  style={styles.select}
                  required
                >
                  <option value="">Selecione uma matéria</option>
                  {materias.map(materia => (
                    <option key={materia.id} value={materia.id}>
                      {materia.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Duração (minutos)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duracao_min}
                    onChange={(e) =>
                      setFormData({ ...formData, duracao_min: e.target.value })
                    }
                    placeholder="Ex: 60"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Data *</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) =>
                      setFormData({ ...formData, data: e.target.value })
                    }
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Anotações</label>
                <textarea
                  value={formData.notas}
                  onChange={(e) =>
                    setFormData({ ...formData, notas: e.target.value })
                  }
                  placeholder="Adicione suas anotações sobre esta sessão (opcional)"
                  style={{...styles.input, minHeight: "100px", resize: "vertical" as const}}
                />
              </div>

              <div style={styles.formActions}>
                <button
                  onClick={closeModal}
                  style={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button onClick={handleSubmit} style={styles.submitButton}>
                  {editingEstudo ? "Salvar Alterações" : "Registrar Sessão"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    backgroundColor: "white",
    padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "16px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap" as const,
  },
  backButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    backgroundColor: "transparent",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0",
  },
  addButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap" as const,
  },
  filterContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px 16px 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap" as const,
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },
  filterSelect: {
    padding: "10px 16px",
    fontSize: "14px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    minWidth: "200px",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px 16px",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "all 0.3s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  materiaBadge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardId: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 12px 0",
  },
  durationContainer: {
    marginBottom: "16px",
  },
  durationBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
  },
  durationIcon: {
    fontSize: "18px",
  },
  durationText: {
    fontSize: "16px",
    fontWeight: "700",
  },
  notasContainer: {
    backgroundColor: "#fefce8",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid #fef08a",
  },
  notasLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#854d0e",
    margin: "0 0 4px 0",
  },
  notasText: {
    fontSize: "13px",
    color: "#713f12",
    margin: "0",
    lineHeight: "1.5",
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    marginBottom: "20px",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: "14px",
    color: "#1e293b",
    fontWeight: "600",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
  },
  editButton: {
    flex: 1,
    minWidth: "120px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deleteButton: {
    flex: 1,
    minWidth: "120px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "32px",
    flexWrap: "wrap" as const,
  },
  pageButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  pageButtonDisabled: {
    backgroundColor: "#cbd5e1",
    cursor: "not-allowed",
  },
  pageInfo: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "600",
  },
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "16px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#64748b",
    cursor: "pointer",
    padding: "0",
    width: "32px",
    height: "32px",
  },
  form: {
    padding: "24px",
  },
  formGroup: {
    marginBottom: "20px",
    flex: 1,
  },
  formRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap" as const,
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box" as const,
  },
  select: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "white",
    cursor: "pointer",
    boxSizing: "border-box" as const,
  },
  formActions: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    flexWrap: "wrap" as const,
  },
  cancelButton: {
    flex: 1,
    minWidth: "120px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  submitButton: {
    flex: 1,
    minWidth: "120px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #8b5cf6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "16px",
    fontSize: "16px",
    color: "#64748b",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "16px 24px",
    textAlign: "center" as const,
    fontSize: "14px",
    fontWeight: "600",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  emptyIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  emptyText: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 24px 0",
  },
  emptyButton: {
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleTag);
}