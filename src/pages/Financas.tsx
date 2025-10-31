import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface Financa {
  id: number;
  nome: string;
  moeda: string;
  user_id: number;
}

interface FormData {
  nome: string;
  moeda: string;
  user_id: string;
}

export default function Financas() {
  const navigate = useNavigate();
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFinanca, setEditingFinanca] = useState<Financa | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    moeda: "BRL",
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
      fetchFinancas();
    }
  }, [currentPage, userId]);

  const fetchFinancas = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/financas/all?page=${currentPage}&size=6`);
      setFinancas(response.data.content);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar finanças:", err);
      setError(err.response?.data?.message || "Erro ao buscar finanças");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim() || !formData.moeda.trim() || !formData.user_id) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const payload = {
        nome: formData.nome,
        moeda: formData.moeda.toUpperCase(),
        user_id: parseInt(formData.user_id),
      };

      if (editingFinanca) {
        await api.put(`/financas/alter/${editingFinanca.id}`, payload);
      } else {
        await api.post("/financas/create", payload);
      }

      await fetchFinancas();
      closeModal();
    } catch (err: any) {
      console.error("Erro completo:", err);
      alert("Erro: " + (err.response?.data?.message || err.message || "Erro ao salvar finança"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta carteira? Todas as contas associadas serão perdidas.")) return;

    try {
      await api.delete(`/financas/delete/${id}`);
      await fetchFinancas();
    } catch (err: any) {
      alert("Erro: " + (err.response?.data?.message || "Erro ao deletar finança"));
    }
  };

  const openModal = (financa: Financa | null = null) => {
    if (financa) {
      setEditingFinanca(financa);
      setFormData({
        nome: financa.nome,
        moeda: financa.moeda,
        user_id: financa.user_id.toString(),
      });
    } else {
      setEditingFinanca(null);
      setFormData({
        nome: "",
        moeda: "BRL",
        user_id: userId?.toString() || "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFinanca(null);
    setFormData({
      nome: "",
      moeda: "BRL",
      user_id: userId?.toString() || "",
    });
  };

  const getMoedaSymbol = (moeda: string): string => {
    const symbols: { [key: string]: string } = {
      BRL: "R$",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    return symbols[moeda] || moeda;
  };

  const navigateToContas = (financaId: number) => {
    navigate(`/contas?financa=${financaId}`);
  };

  if (loading && financas.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando carteiras...</p>
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
            <h1 style={styles.title}>💰 Gestão de Finanças</h1>
            <p style={styles.subtitle}>Gerencie suas carteiras financeiras</p>
          </div>
        </div>
        <button onClick={() => openModal()} style={styles.addButton}>
          + Nova Carteira
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          ❌ {error}
        </div>
      )}

      <div style={styles.content}>
        {financas.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>💼</span>
            <h3 style={styles.emptyTitle}>Nenhuma carteira cadastrada</h3>
            <p style={styles.emptyText}>
              Comece criando sua primeira carteira financeira
            </p>
            <button onClick={() => openModal()} style={styles.emptyButton}>
              Criar primeira carteira
            </button>
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {financas.map((financa) => (
              <div 
                key={financa.id} 
                style={{
                  ...styles.card,
                  borderTop: `4px solid #10b981`,
                }}
              >
                <div style={styles.cardHeader}>
                  <div
                    style={{
                      ...styles.moedaBadge,
                      backgroundColor: "#10b98115",
                      color: "#10b981",
                    }}
                  >
                    {getMoedaSymbol(financa.moeda)} {financa.moeda}
                  </div>
                  <span style={styles.cardId}>#{financa.id}</span>
                </div>
                
                <h3 style={styles.cardTitle}>{financa.nome}</h3>
                
                <div style={styles.cardInfo}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Moeda:</span>
                    <span style={styles.infoValue}>{financa.moeda}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Símbolo:</span>
                    <span style={{...styles.infoValue, fontSize: "18px"}}>
                      {getMoedaSymbol(financa.moeda)}
                    </span>
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <button
                    onClick={() => navigateToContas(financa.id)}
                    style={styles.viewButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#059669";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#10b981";
                    }}
                  >
                    👁️ Ver Contas
                  </button>
                  <button
                    onClick={() => openModal(financa)}
                    style={styles.editButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#3b82f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#6366f1";
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(financa.id)}
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
            ))}
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
                {editingFinanca ? "Editar Carteira" : "Nova Carteira"}
              </h2>
              <button onClick={closeModal} style={styles.closeButton}>
                ✕
              </button>
            </div>

            <div style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome da Carteira *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Carteira Principal, Poupança"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Moeda *</label>
                <select
                  value={formData.moeda}
                  onChange={(e) =>
                    setFormData({ ...formData, moeda: e.target.value })
                  }
                  style={styles.select}
                >
                  <option value="BRL">BRL - Real Brasileiro (R$)</option>
                  <option value="USD">USD - Dólar Americano ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - Libra Esterlina (£)</option>
                  <option value="JPY">JPY - Iene Japonês (¥)</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button
                  onClick={closeModal}
                  style={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button onClick={handleSubmit} style={styles.submitButton}>
                  {editingFinanca ? "Salvar Alterações" : "Criar Carteira"}
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
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap" as const,
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
  moedaBadge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
  },
  cardId: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: "20px",
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
  cardActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
  },
  viewButton: {
    flex: 1,
    minWidth: "100px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  editButton: {
    flex: 1,
    minWidth: "100px",
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
    minWidth: "100px",
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
    backgroundColor: "#10b981",
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
    maxWidth: "500px",
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
    backgroundColor: "#10b981",
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
    borderTop: "4px solid #10b981",
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
    backgroundColor: "#10b981",
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