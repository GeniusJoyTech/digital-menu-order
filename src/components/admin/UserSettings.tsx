import { useState } from "react";
import { User, Lock, Mail, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const UserSettings = () => {
  const { user, updateEmail, updatePassword } = useAuth();
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Digite um email válido");
      return;
    }
    if (newEmail === user?.email) {
      toast.info("O email é o mesmo atual");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const { error } = await updateEmail(newEmail);
      if (error) {
        toast.error(error.message || "Erro ao atualizar email");
      } else {
        toast.success("Email atualizado! Verifique sua caixa de entrada para confirmar.");
      }
    } catch (error) {
      toast.error("Erro ao atualizar email");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error(error.message || "Erro ao atualizar senha");
      } else {
        toast.success("Senha atualizada com sucesso!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error("Erro ao atualizar senha");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <User className="w-5 h-5 text-brand-pink" />
        <h3 className="font-bold text-foreground">Configurações do Usuário</h3>
      </div>

      {/* Email Section */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground"
            />
            <button
              onClick={handleUpdateEmail}
              disabled={isUpdatingEmail}
              className="px-4 py-3 rounded-xl bg-brand-pink text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isUpdatingEmail ? "..." : "Salvar"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Você receberá um email de confirmação no novo endereço.
          </p>
        </div>
      </div>

      {/* Password Section */}
      <div className="border-t border-border pt-4 space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4" />
            Nova Senha
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Digite a nova senha"
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground"
            minLength={6}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Confirmar Nova Senha
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a nova senha"
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground"
            minLength={6}
          />
        </div>
        <button
          onClick={handleUpdatePassword}
          disabled={isUpdatingPassword || !newPassword}
          className="w-full py-3 rounded-xl bg-brand-pink text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isUpdatingPassword ? "Atualizando..." : "Atualizar Senha"}
        </button>
      </div>
    </div>
  );
};

export default UserSettings;
