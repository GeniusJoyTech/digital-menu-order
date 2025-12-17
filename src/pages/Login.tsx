import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { isAuthenticated, isAdmin, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-pastel-pink flex items-center justify-center">
        <div className="text-brand-pink">Carregando...</div>
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message || "Erro ao criar conta");
        } else {
          toast.success("Conta criada! Faça login para continuar.");
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || "Email ou senha incorretos");
        } else {
          toast.success("Login realizado com sucesso!");
          navigate("/admin");
        }
      }
    } catch (error) {
      toast.error("Erro ao processar requisição");
    } finally {
      setIsLoading(false);
    }
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
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? "Processando..." : isSignUp ? "Criar conta" : "Entrar"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-brand-pink hover:underline flex items-center gap-1 justify-center w-full"
            >
              <UserPlus className="w-4 h-4" />
              {isSignUp ? "Já tenho conta" : "Criar nova conta"}
            </button>
          </div>

          {isAuthenticated && !isAdmin && (
            <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              Você está logado, mas não tem permissão de administrador.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
