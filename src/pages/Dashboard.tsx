import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/auth/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      navigate("/auth/login");
    }
  };

  const pages = [
    { name: "Tarefas", path: "/tarefas", icon: "✓", color: "#06b6d4", description: "Organize suas tarefas diárias" },
    { name: "Matérias", path: "/materias", icon: "📝", color: "#ec4899", description: "Gerencie suas matérias" },
    { name: "Metas", path: "/metas", icon: "🎯", color: "#f59e0b", description: "Acompanhe seus objetivos" },
    { name: "Finanças", path: "/financas", icon: "💰", color: "#10b981", description: "Controle suas finanças" },
  ];

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
        <button 
          onClick={handleLogout} 
          style={{
            ...styles.logoutButton,
            opacity: isLoggingOut ? 0.6 : 1,
            cursor: isLoggingOut ? "not-allowed" : "pointer"
          }}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Saindo..." : "Sair"}
        </button>
      </div>

      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Acesso Rápido</h2>
        <div style={styles.cardsGrid}>
          {pages.map((page) => (
            <div
              key={page.path}
              onClick={() => navigate(page.path)}
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
              <p style={styles.cardDescription}>{page.description}</p>
            </div>
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
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "24px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "white",
    padding: "32px 24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
    cursor: "pointer",
    minHeight: "200px",
    justifyContent: "center",
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