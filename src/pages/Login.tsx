  import { useState } from "react";
  import api from "../api/api";
  import { useNavigate } from "react-router-dom";

  export default function Login() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      try {
        await api.post(
          "/auth/login",
          { email, password: senha },
          { withCredentials: true } 
        );

        alert("Login realizado com sucesso!");
        navigate("/");
      } catch (error: any) {
        console.error("Falha no login:", error);
        if (error.response) {
          setError(error.response.data?.message || "E-mail ou senha incorretos");
        } else if (error.request) {
          setError("Não foi possível conectar ao servidor.");
        } else {
          setError("Ocorreu um erro inesperado.");
        }
      }
    };

    const goToRegister = () => {
      navigate("/auth/register");
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
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
      },
      registerButton: {
        width: "100%",
        padding: "12px 15px",
        fontSize: "16px",
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
      },
      errorText: {
        color: "red",
        fontSize: "14px",
      },
    };

    return (
      <div style={styles.container}>
        <form style={styles.formContainer} onSubmit={handleLogin}>
          <h2 style={styles.title}>Login</h2>

          {error && <p style={styles.errorText}>{error}</p>}

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
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            required
          />

          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#0056b3")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#007bff")
            }
          >
            Entrar
          </button>

          <button
            type="button"
            style={styles.registerButton}
            onClick={goToRegister}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#5a6268")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#6c757d")
            }
          >
            Registrar-se
          </button>
        </form>
      </div>
    );
  }
