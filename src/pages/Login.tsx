import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        toast.success("Login realizado com sucesso!");
        navigate("/admin");
      } else {
        toast.error("Email ou senha incorretos");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-pastel-pink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-brand-pink mb-2">Shake Yes!</h1>
          <p className="text-muted-foreground">Área Administrativa</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-pink"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-pink"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
