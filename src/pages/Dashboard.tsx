import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import api from "../api/api";

interface User {
  id: number;
  nome: string;
  email: string;
}

export default function Dashboard() {
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Erro ao buscar dados do usuário");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const pages = [
    { name: "Contas", path: "/contas", icon: "👤", color: "#6366f1" },
    { name: "Estudos", path: "/estudos", icon: "📚", color: "#8b5cf6" },
    { name: "Matérias", path: "/materias", icon: "📝", color: "#ec4899" },
    { name: "Finanças", path: "/financas", icon: "💰", color: "#10b981" },
    { name: "Metas", path: "/metas", icon: "🎯", color: "#f59e0b" },
    { name: "Tarefas", path: "/tarefas", icon: "✓", color: "#06b6d4" },
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>❌ {error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.welcomeSection}>
          <div style={styles.avatar}>
            {user?.nome?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h1 style={styles.title}>Bem-vindo(a), {user?.nome}! 👋</h1>
            <p style={styles.subtitle}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Sair
        </button>
      </div>

      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Acesso Rápido</h2>
        <div style={styles.cardsGrid}>
          {pages.map((page) => (
            <a
              key={page.path}
              href={page.path}
              style={{
                ...styles.card,
                borderTop: `4px solid ${page.color}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{...styles.cardIcon, backgroundColor: page.color + "15"}}>
                <span style={styles.iconEmoji}>{page.icon}</span>
              </div>
              <h3 style={styles.cardTitle}>{page.name}</h3>
              <p style={styles.cardDescription}>Gerenciar {page.name.toLowerCase()}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    backgroundColor: "white",
    padding: "24px 32px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "16px",
  },
  welcomeSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#6366f1",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "600",
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
  logoutButton: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "600",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 32px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "24px",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    cursor: "pointer",
  },
  cardIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  iconEmoji: {
    fontSize: "24px",
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
    margin: "0",
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
  errorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "20px",
  },
  errorText: {
    fontSize: "18px",
    color: "#ef4444",
    backgroundColor: "white",
    padding: "24px 32px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
};


const globalStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = globalStyles;
  document.head.appendChild(styleTag);
}