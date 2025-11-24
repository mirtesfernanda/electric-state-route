import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Home, LogOut, Timer, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

interface RankingPlayer {
  id: string;
  username: string;
  avatar_url: string | null;
  score: number;
  time_seconds: number;
  created_at: string;
  rank: number;
}

const Ranking = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const { data: rankings, isLoading, error } = useQuery({
    queryKey: ["global-ranking"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_global_ranking", {
        limit_count: 100,
      });

      if (error) throw error;
      return data as RankingPlayer[];
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-neon-yellow" size={32} />;
      case 2:
        return <Medal className="text-muted-foreground" size={28} />;
      case 3:
        return <Award className="text-accent" size={24} />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
      <header className="py-6 px-4 border-b border-border/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="sm"
              className="font-mono"
            >
              <Home size={16} className="mr-2" />
              Início
            </Button>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold neon-text uppercase tracking-wider text-center flex-1">
            Ranking Global
          </h1>

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
      </header>

      <main className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="neon-border bg-card/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-foreground flex items-center justify-center gap-3">
                <Trophy className="text-neon-yellow" />
                Top Jogadores do Deserto Digital
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground font-mono">Carregando ranking...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-destructive font-mono">Erro ao carregar ranking</p>
                </div>
              )}

              {rankings && rankings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground font-mono">
                    Nenhuma pontuação registrada ainda. Seja o primeiro!
                  </p>
                </div>
              )}

              {rankings && rankings.length > 0 && (
                <div className="space-y-3">
                  {rankings.map((player) => {
                    const isCurrentUser = user?.id === player.id;
                    
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          isCurrentUser
                            ? "bg-primary/10 border-primary"
                            : "bg-muted/20 border-border/30 hover:border-border/60"
                        }`}
                      >
                        {/* Rank Icon */}
                        <div className="w-12 flex items-center justify-center">
                          {getRankIcon(player.rank)}
                        </div>

                        {/* Avatar */}
                        <Avatar className="h-12 w-12 border-2 border-primary/30">
                          <AvatarImage src={player.avatar_url || undefined} alt={player.username} />
                          <AvatarFallback className="bg-card text-foreground font-bold">
                            {player.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Username */}
                        <div className="flex-1">
                          <p className={`font-bold ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                            {player.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs font-mono text-primary">(você)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {new Date(player.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Target size={16} className="text-primary" />
                              <span className="text-xl font-bold text-foreground">
                                {player.score}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">pontos</p>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Timer size={16} className="text-secondary" />
                              <span className="text-lg font-mono text-foreground">
                                {formatTime(player.time_seconds)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">tempo</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-muted-foreground text-sm font-mono">
            Complete o quiz para aparecer no ranking global
          </p>
        </div>
      </main>

      <footer className="py-6 text-center text-muted-foreground text-sm">
        <p className="font-mono">
          &lt;/&gt; Desenvolvido com técnicas da Imersão Dev Alura
        </p>
      </footer>
    </div>
  );
};

export default Ranking;
