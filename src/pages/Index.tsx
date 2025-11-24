import { QuizGame } from "@/components/QuizGame";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen bg-background crt-effect"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="py-8 text-center space-y-2 px-4 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            onClick={() => navigate("/ranking")}
            variant="outline"
            size="sm"
            className="font-mono"
          >
            <Trophy size={16} className="mr-2" />
            Ranking
          </Button>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="font-mono"
          >
            <LogOut size={16} className="mr-2" />
            Sair
          </Button>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold neon-text uppercase tracking-wider">
          The Electric State
        </h1>
        <p className="text-xl md:text-2xl text-secondary uppercase tracking-widest">
          Decifrando a Rota
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-4">
          Teste seus conhecimentos sobre o universo distópico de The Electric State.
          Atravesse o deserto digital e prove que você domina a jornada!
        </p>
        {user && (
          <p className="text-xs text-primary font-mono mt-2">
            Jogador conectado
          </p>
        )}
      </header>
      
      <QuizGame />
      
      <footer className="py-6 text-center text-muted-foreground text-sm">
        <p className="font-mono">
          &lt;/&gt; Desenvolvido com técnicas da Imersão Dev Alura
        </p>
      </footer>
    </div>
  );
};

export default Index;
