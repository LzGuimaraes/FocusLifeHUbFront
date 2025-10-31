import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface Meta {
  id: number;
  titulo: string;
  descricao: string;
  prograsso: number;
  prazo: string;
  status: "PENDENTE" | "Ativa" | "Concluida" | "Cancelada";
  user_id: number;
}

interface FormData {
  titulo: string;
  descricao: string;
  prograsso: string;
  prazo: string;
  status: string;
  user_id: string;
}

export default function Metas() {
  const navigate = useNavigate();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    descricao: "",
    prograsso: "0",
    prazo: "",
    status: "PENDENTE",
    user_id: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me");
        setUserId(response.data.id);
        setFormData(prev => ({ ...prev, user_id: response.data.id.toString() }));
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMetas();
    }
  }, [currentPage, userId]);

  const fetchMetas = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/metas/all?page=${currentPage}&size=6`);
      setMetas(response.data.content);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar metas:", err);
      setError(err.response?.data?.message || "Erro ao buscar metas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.titulo.trim() || !formData.prazo || !formData.user_id) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        prograsso: parseFloat(formData.prograsso),
        prazo: new Date(formData.prazo).toISOString(),
        status: formData.status,
        user_id: parseInt(formData.user_id),
      };

      if (editingMeta) {
        await api.put(`/metas/alter/${editingMeta.id}`, payload);
      } else {
        await api.post("/metas/create", payload);
      }

      await fetchMetas();
      closeModal();
    } catch (err: any) {
      console.error("Erro completo:", err);
      alert("Erro: " + (err.response?.data?.message || err.message || "Erro ao salvar meta"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta meta?")) return;

    try {
      await api.delete(`/metas/delete/${id}`);
      await fetchMetas();
    } catch (err: any) {
      alert("Erro: " + (err.response?.data?.message || "Erro ao deletar meta"));
    }
  };

  const openModal = (meta: Meta | null = null) => {
    if (meta) {
      setEditingMeta(meta);
      setFormData({
        titulo: meta.titulo,
        descricao: meta.descricao,
        prograsso: meta.prograsso.toString(),
        prazo: meta.prazo ? new Date(meta.prazo).toISOString().split('T')[0] : "",
        status: meta.status,
        user_id: meta.user_id.toString(),
      });
    } else {
      setEditingMeta(null);
      setFormData({
        titulo: "",
        descricao: "",
        prograsso: "0",
        prazo: "",
        status: "PENDENTE",
        user_id: userId?.toString() || "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMeta(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluida": return { bg: "#d1fae5", color: "#059669" };
      case "Ativa": return { bg: "#dbeafe", color: "#3b82f6" };
      case "Cancelada": return { bg: "#fee2e2", color: "#dc2626" };
      default: return { bg: "#fef3c7", color: "#f59e0b" };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Sem prazo";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "#10b981";
    if (progress >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const filteredMetas = filterStatus === "all" 
    ? metas 
    : metas.filter(m => m.status === filterStatus);

  if (loading && metas.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando metas...</p>
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
          >
            ← Voltar
          </button>
          <div>
            <h1 style={styles.title}>🎯 Gestão de Metas</h1>
            <p style={styles.subtitle}>Acompanhe seus objetivos e progresso</p>
          </div>
        </div>
        <button onClick={() => openModal()} style={styles.addButton}>
          + Nova Meta
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          ❌ {error}
        </div>
      )}

      <div style={styles.filterContainer}>
        <label style={styles.filterLabel}>Filtrar por Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">Todas</option>
          <option value="PENDENTE">Pendente</option>
          <option value="Ativa">Ativa</option>
          <option value="Concluida">Concluída</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      <div style={styles.content}>
        {filteredMetas.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🎯</span>
            <h3 style={styles.emptyTitle}>Nenhuma meta encontrada</h3>
            <p style={styles.emptyText}>
              Comece definindo sua primeira meta
            </p>
            <button onClick={() => openModal()} style={styles.emptyButton}>
              Criar primeira meta
            </button>
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {filteredMetas.map((meta) => {
              const statusColors = getStatusColor(meta.status);
              const progressColor = getProgressColor(meta.prograsso);
              
              return (
                <div 
                  key={meta.id} 
                  style={{
                    ...styles.card,
                    borderTop: `4px solid ${progressColor}`,
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: statusColors.bg,
                      color: statusColors.color,
                    }}>
                      {meta.status}
                    </div>
                    <span style={styles.cardId}>#{meta.id}</span>
                  </div>
                  
                  <h3 style={styles.cardTitle}>{meta.titulo}</h3>
                  
                  {meta.descricao && (
                    <p style={styles.cardDescription}>{meta.descricao}</p>
                  )}
                  
                  <div style={styles.progressContainer}>
                    <div style={styles.progressHeader}>
                      <span style={styles.progressLabel}>Progresso</span>
                      <span style={{...styles.progressValue, color: progressColor}}>
                        {meta.prograsso.toFixed(0)}%
                      </span>
                    </div>
                    <div style={styles.progressBar}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${Math.min(meta.prograsso, 100)}%`,
                        backgroundColor: progressColor,
                      }} />
                    </div>
                  </div>

                  <div style={styles.cardInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Prazo:</span>
                      <span style={styles.infoValue}>{formatDate(meta.prazo)}</span>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => openModal(meta)}
                      style={styles.editButton}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(meta.id)}
                      style={styles.deleteButton}
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
                {editingMeta ? "Editar Meta" : "Nova Meta"}
              </h2>
              <button onClick={closeModal} style={styles.closeButton}>
                ✕
              </button>
            </div>

            <div style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  placeholder="Ex: Concluir curso de React"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Descreva sua meta (opcional)"
                  style={{...styles.input, minHeight: "80px", resize: "vertical" as const}}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Progresso (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.prograsso}
                    onChange={(e) =>
                      setFormData({ ...formData, prograsso: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    style={styles.select}
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="Ativa">Ativa</option>
                    <option value="Concluida">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Prazo *</label>
                <input
                  type="date"
                  value={formData.prazo}
                  onChange={(e) =>
                    setFormData({ ...formData, prazo: e.target.value })
                  }
                  style={styles.input}
                  required
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
                  {editingMeta ? "Salvar Alterações" : "Criar Meta"}
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
    backgroundColor: "#f59e0b",
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
    minWidth: "150px",
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
  statusBadge: {
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
    margin: "0 0 8px 0",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 16px 0",
    lineHeight: "1.5",
  },
  progressContainer: {
    marginBottom: "16px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  progressLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
  },
  progressValue: {
    fontSize: "14px",
    fontWeight: "700",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
    borderRadius: "4px",
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
    backgroundColor: "#f59e0b",
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
    backgroundColor: "#f59e0b",
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
    borderTop: "4px solid #f59e0b",
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
    backgroundColor: "#f59e0b",
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