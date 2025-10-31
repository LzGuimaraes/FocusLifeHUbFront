import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface Tarefa {
  id: number;
  titulo: string;
  status: "PENDENTE" | "Ativa" | "Concluida" | "Cancelada";
  prioridade: "baixa" | "media" | "alta";
  prazo: string;
  user_id: number;
}

interface FormData {
  titulo: string;
  status: string;
  prioridade: string;
  prazo: string;
  user_id: string;
}

export default function Tarefas() {
  const navigate = useNavigate();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    status: "PENDENTE",
    prioridade: "media",
    prazo: "",
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
      fetchTarefas();
    }
  }, [currentPage, userId]);

  const fetchTarefas = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/tarefas/all?page=${currentPage}&size=6`);
      setTarefas(response.data.content);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar tarefas:", err);
      setError(err.response?.data?.message || "Erro ao buscar tarefas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.titulo.trim() || !formData.user_id) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const payload = {
        titulo: formData.titulo,
        status: formData.status,
        prioridade: formData.prioridade,
        prazo: formData.prazo ? new Date(formData.prazo).toISOString() : null,
        user_id: parseInt(formData.user_id),
      };

      if (editingTarefa) {
        await api.put(`/tarefas/alter/${editingTarefa.id}`, payload);
      } else {
        await api.post("/tarefas/create", payload);
      }

      await fetchTarefas();
      closeModal();
    } catch (err: any) {
      console.error("Erro completo:", err);
      alert("Erro: " + (err.response?.data?.message || err.message || "Erro ao salvar tarefa"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta tarefa?")) return;

    try {
      await api.delete(`/tarefas/delete/${id}`);
      await fetchTarefas();
    } catch (err: any) {
      alert("Erro: " + (err.response?.data?.message || "Erro ao deletar tarefa"));
    }
  };

  const openModal = (tarefa: Tarefa | null = null) => {
    if (tarefa) {
      setEditingTarefa(tarefa);
      setFormData({
        titulo: tarefa.titulo,
        status: tarefa.status,
        prioridade: tarefa.prioridade,
        prazo: tarefa.prazo ? new Date(tarefa.prazo).toISOString().split('T')[0] : "",
        user_id: tarefa.user_id.toString(),
      });
    } else {
      setEditingTarefa(null);
      setFormData({
        titulo: "",
        status: "PENDENTE",
        prioridade: "media",
        prazo: "",
        user_id: userId?.toString() || "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTarefa(null);
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta": return { bg: "#fef2f2", color: "#dc2626" };
      case "media": return { bg: "#fef3c7", color: "#f59e0b" };
      case "baixa": return { bg: "#dbeafe", color: "#3b82f6" };
      default: return { bg: "#f3f4f6", color: "#6b7280" };
    }
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

  const filteredTarefas = filterStatus === "all" 
    ? tarefas 
    : tarefas.filter(t => t.status === filterStatus);

  if (loading && tarefas.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando tarefas...</p>
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
            <h1 style={styles.title}>✓ Gestão de Tarefas</h1>
            <p style={styles.subtitle}>Organize suas atividades diárias</p>
          </div>
        </div>
        <button onClick={() => openModal()} style={styles.addButton}>
          + Nova Tarefa
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
        {filteredTarefas.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📋</span>
            <h3 style={styles.emptyTitle}>Nenhuma tarefa encontrada</h3>
            <p style={styles.emptyText}>
              Comece criando sua primeira tarefa
            </p>
            <button onClick={() => openModal()} style={styles.emptyButton}>
              Criar primeira tarefa
            </button>
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {filteredTarefas.map((tarefa) => {
              const prioridadeColors = getPrioridadeColor(tarefa.prioridade);
              const statusColors = getStatusColor(tarefa.status);
              
              return (
                <div 
                  key={tarefa.id} 
                  style={{
                    ...styles.card,
                    borderLeft: `4px solid ${prioridadeColors.color}`,
                  }}
                >
                  <div style={styles.cardHeader}>
                    <div style={{
                      ...styles.badge,
                      backgroundColor: prioridadeColors.bg,
                      color: prioridadeColors.color,
                    }}>
                      {tarefa.prioridade.toUpperCase()}
                    </div>
                    <span style={styles.cardId}>#{tarefa.id}</span>
                  </div>
                  
                  <h3 style={styles.cardTitle}>{tarefa.titulo}</h3>
                  
                  <div style={styles.cardInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Status:</span>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusColors.bg,
                        color: statusColors.color,
                      }}>
                        {tarefa.status}
                      </span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Prazo:</span>
                      <span style={styles.infoValue}>{formatDate(tarefa.prazo)}</span>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => openModal(tarefa)}
                      style={styles.editButton}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(tarefa.id)}
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
                {editingTarefa ? "Editar Tarefa" : "Nova Tarefa"}
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
                  placeholder="Ex: Estudar React"
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Prioridade</label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) =>
                      setFormData({ ...formData, prioridade: e.target.value })
                    }
                    style={styles.select}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
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
                <label style={styles.label}>Prazo</label>
                <input
                  type="date"
                  value={formData.prazo}
                  onChange={(e) =>
                    setFormData({ ...formData, prazo: e.target.value })
                  }
                  style={styles.input}
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
                  {editingTarefa ? "Salvar Alterações" : "Criar Tarefa"}
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
    backgroundColor: "#06b6d4",
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
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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
  badge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
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
    margin: "0 0 16px 0",
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
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
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
    backgroundColor: "#06b6d4",
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
    backgroundColor: "#06b6d4",
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
    borderTop: "4px solid #06b6d4",
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
    backgroundColor: "#06b6d4",
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