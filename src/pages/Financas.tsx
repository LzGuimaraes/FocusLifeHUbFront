import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

interface Conta {
  id: number;
  nome: string;
  tipo: string;
  saldo: number;
  financas_id: number;
}

interface Financa {
  id: number;
  nome: string;
  moeda: string;
}

interface FormData {
  nome: string;
  tipo: string;
  financas_id: string;
  saldo: string;
}

export default function Contas() {
  const navigate = useNavigate();
  const [contas, setContas] = useState<Conta[]>([]);
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingConta, setEditingConta] = useState<Conta | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedFinanca, setSelectedFinanca] = useState<string>("all");
  
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    tipo: "Despesa",
    financas_id: "",
    saldo: "0",
  });

  useEffect(() => {
    const fetchFinancas = async () => {
      try {
        const response = await api.get("/financas/all?page=0&size=100");
        setFinancas(response.data.content);
      } catch (err: any) {
        console.error("Erro ao buscar finanças:", err);
      }
    };
    fetchFinancas();
  }, []);

  useEffect(() => {
    fetchContas();
  }, [currentPage, selectedFinanca]);

  const fetchContas = async () => {
    setLoading(true);
    try {
      if (selectedFinanca === "all") {
        const response = await api.get(`/contas/all?page=${currentPage}&size=6`);
        setContas(response.data.content);
        setTotalPages(response.data.totalPages);
      } else {
        const response = await api.get(`/contas/by-financa/${selectedFinanca}`);
        setContas(response.data);
        setTotalPages(1);
      }
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar contas:", err);
      setError(err.response?.data?.message || "Erro ao buscar contas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim() || !formData.tipo.trim() || !formData.financas_id) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const payload = {
        nome: formData.nome,
        tipo: formData.tipo,
        financas_id: parseInt(formData.financas_id),
        saldo: formData.saldo ? parseFloat(formData.saldo) : 0,
      };

      if (editingConta) {
        await api.put(`/contas/alter/${editingConta.id}`, payload);
      } else {
        await api.post("/contas/create", payload);
      }

      await fetchContas();
      closeModal();
    } catch (err: any) {
      console.error("Erro completo:", err);
      alert("Erro: " + (err.response?.data?.message || err.message || "Erro ao salvar conta"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta conta?")) return;

    try {
      await api.delete(`/contas/delete/${id}`);
      await fetchContas();
    } catch (err: any) {
      alert("Erro: " + (err.response?.data?.message || "Erro ao deletar conta"));
    }
  };

  const openModal = (conta: Conta | null = null) => {
    if (conta) {
      setEditingConta(conta);
      setFormData({
        nome: conta.nome,
        tipo: conta.tipo,
        financas_id: conta.financas_id.toString(),
        saldo: conta.saldo.toString(),
      });
    } else {
      setEditingConta(null);
      setFormData({
        nome: "",
        tipo: "Despesa",
        financas_id: financas.length > 0 ? financas[0].id.toString() : "",
        saldo: "0",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingConta(null);
    setFormData({
      nome: "",
      tipo: "Despesa",
      financas_id: "",
      saldo: "0",
    });
  };

  const getFinancaNome = (financas_id: number): string => {
    return financas.find((f) => f.id === financas_id)?.nome || "N/A";
  };

  const getFinancaMoeda = (financas_id: number): string => {
    return financas.find((f) => f.id === financas_id)?.moeda || "BRL";
  };

  const formatCurrency = (value: number, moeda: string): string => {
    const symbols: { [key: string]: string } = {
      BRL: "R$",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    };
    return `${symbols[moeda] || moeda} ${value.toFixed(2)}`;
  };

  if (loading && contas.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando contas...</p>
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
            <h1 style={styles.title}>💳 Gestão de Contas</h1>
            <p style={styles.subtitle}>Gerencie suas contas bancárias</p>
          </div>
        </div>
        <button onClick={() => openModal()} style={styles.addButton}>
          + Nova Conta
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          ❌ {error}
        </div>
      )}

      <div style={styles.filterContainer}>
        <label style={styles.filterLabel}>Filtrar por Carteira:</label>
        <select
          value={selectedFinanca}
          onChange={(e) => {
            setSelectedFinanca(e.target.value);
            setCurrentPage(0);
          }}
          style={styles.filterSelect}
        >
          <option value="all">Todas as Carteiras</option>
          {financas.map((financa) => (
            <option key={financa.id} value={financa.id}>
              {financa.nome} ({financa.moeda})
            </option>
          ))}
        </select>
      </div>

      <div style={styles.content}>
        {contas.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📊</span>
            <h3 style={styles.emptyTitle}>Nenhuma conta cadastrada</h3>
            <p style={styles.emptyText}>
              Comece criando sua primeira conta bancária
            </p>
            <button onClick={() => openModal()} style={styles.emptyButton}>
              Criar primeira conta
            </button>
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {contas.map((conta) => (
              <div 
                key={conta.id} 
                style={{
                  ...styles.card,
                  borderLeft: `4px solid #6366f1`,
                }}
              >
                <div style={styles.cardHeader}>
                  <div
                    style={{
                      ...styles.tipoBadge,
                      backgroundColor: "#6366f115",
                      color: "#6366f1",
                    }}
                  >
                    {conta.tipo}
                  </div>
                  <span style={styles.cardId}>#{conta.id}</span>
                </div>
                
                <h3 style={styles.cardTitle}>{conta.nome}</h3>
                
                <div style={styles.cardInfo}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Saldo:</span>
                    <span style={{
                      ...styles.infoValue,
                      color: conta.saldo >= 0 ? "#10b981" : "#ef4444",
                      fontWeight: "700",
                      fontSize: "18px",
                    }}>
                      {formatCurrency(conta.saldo, getFinancaMoeda(conta.financas_id))}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Tipo:</span>
                    <span style={styles.infoValue}>{conta.tipo}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Carteira:</span>
                    <span style={styles.infoValue}>{getFinancaNome(conta.financas_id)}</span>
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <button
                    onClick={() => openModal(conta)}
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
                    onClick={() => handleDelete(conta.id)}
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

        {totalPages > 1 && selectedFinanca === "all" && (
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
                {editingConta ? "Editar Conta" : "Nova Conta"}
              </h2>
              <button onClick={closeModal} style={styles.closeButton}>
                ✕
              </button>
            </div>

            <div style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome da Conta *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Conta Corrente, Cartão de Crédito"
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipo de Conta *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    style={styles.select}
                  >
                    <option value="Despesa">Despesa</option>
                    <option value="Saldo">Saldo</option>
                    <option value="Receita">Receita</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Saldo Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.saldo}
                    onChange={(e) =>
                      setFormData({ ...formData, saldo: e.target.value })
                    }
                    placeholder="0.00"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Carteira *</label>
                <select
                  value={formData.financas_id}
                  onChange={(e) =>
                    setFormData({ ...formData, financas_id: e.target.value })
                  }
                  style={styles.select}
                >
                  <option value="">Selecione...</option>
                  {financas.map((financa) => (
                    <option key={financa.id} value={financa.id}>
                      {financa.nome} ({financa.moeda})
                    </option>
                  ))}
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
                  {editingConta ? "Salvar Alterações" : "Criar Conta"}
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
    backgroundColor: "#6366f1",
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
  tipoBadge: {
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
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 8px 0",
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
    backgroundColor: "#6366f1",
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
    backgroundColor: "#6366f1",
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
    borderTop: "4px solid #6366f1",
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
    backgroundColor: "#6366f1",
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