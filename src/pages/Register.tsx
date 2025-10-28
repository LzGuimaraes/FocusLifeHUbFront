import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom"; 

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState(""); 
  const navigate = useNavigate(); 
  const handleRegister = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setError(""); 

    try {
      await api.post("auth/register", {
        name: nome,
        email: email,
        password: password,
      });
      
      alert("Conta criada com sucesso!");
      navigate("/auth/login"); 
    
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao registrar.");
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      backgroundColor: "#f0f2f5",
      fontFamily: "Arial, sans-serif",
    },
    formContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
      padding: "40px",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      width: "350px",
      textAlign: "center",
    },
    title: {
      margin: 0,
      marginBottom: "10px",
      fontSize: "24px",
      color: "#333",
    },
    input: {
      width: "100%",
      padding: "12px 15px",
      fontSize: "16px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      boxSizing: "border-box",
    },
    button: {
      width: "100%",
      padding: "12px 15px",
      fontSize: "16px",
      backgroundColor: "#28a745", 
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    loginButton: {
      width: "100%",
      padding: "12px 15px",
      fontSize: "16px",
      backgroundColor: "#007bff", 
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      marginTop: "10px", 
    },
    errorText: {
      color: "red",
      fontSize: "14px",
    },
  };
  return (
    <div style={styles.container}>
      <form style={styles.formContainer} onSubmit={handleRegister}>
        <h2 style={styles.title}>Criar Conta</h2>

        {error && <p style={styles.errorText}>{error}</p>}

        <input
          style={styles.input}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome"
          required
        />
        <input
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          required
        />
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
        />

        <button
          type="submit"
          style={styles.button}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#218838")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#28a745")}
        >
          Criar conta
        </button>
        <button
          type="button" 
          style={styles.loginButton}
          onClick={() => navigate("/auth/login")}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
        >
          Já tenho uma conta
        </button>
      </form>
    </div>
  );
}