import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import michelleImg from "@/assets/michelle.jpg";
import robotImg from "@/assets/robot.jpg";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  image: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Qual é o nome da protagonista que atravessa o deserto à procura de seu irmão?",
    options: ["Caresse", "Michelle", "Sarah", "Emily"],
    correctAnswer: 1,
    image: michelleImg,
  },
  {
    id: 2,
    question: "Que tipo de companheiro acompanha Michelle em sua jornada?",
    options: ["Um cachorro robótico", "Um robô amarelo", "Um drone", "Um holograma"],
    correctAnswer: 1,
    image: robotImg,
  },
  {
    id: 3,
    question: "Em que década se passa a história de The Electric State?",
    options: ["Anos 70", "Anos 80", "Anos 90", "Anos 2000"],
    correctAnswer: 2,
    image: michelleImg,
  },
  {
    id: 4,
    question: "Qual é o tema central da história?",
    options: [
      "Corrida espacial",
      "Guerra contra robôs",
      "Controle mental através da tecnologia",
      "Viagem no tempo",
    ],
    correctAnswer: 2,
    image: robotImg,
  },
  {
    id: 5,
    question: "Qual elemento visual icônico aparece repetidamente no universo de The Electric State?",
    options: [
      "Robôs gigantes abandonados",
      "Carros voadores",
      "Portais dimensionais",
      "Cidades flutuantes",
    ],
    correctAnswer: 0,
    image: michelleImg,
  },
];

export const QuizGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);

  useEffect(() => {
    // Efeito glitch aleatório
    const glitchInterval = setInterval(() => {
      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 300);
    }, 8000);

    return () => clearInterval(glitchInterval);
  }, []);

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameFinished(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameFinished(false);
  };

  if (gameFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 bg-card/90 backdrop-blur-sm neon-border">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold neon-text">
              {score >= 4 ? "ROTA CONFIRMADA!" : "FALHA NA TRANSMISSÃO"}
            </h2>
            <div className="text-6xl font-bold text-secondary">
              {score} / {questions.length}
            </div>
            <p className="text-xl text-foreground/80">
              {score >= 4
                ? "Você domina o universo de The Electric State!"
                : "Continue explorando o universo para melhorar!"}
            </p>
            <Button
              onClick={resetGame}
              size="lg"
              className="mt-6 bg-primary hover:bg-primary/80 text-primary-foreground font-bold px-8 py-6 text-lg neon-border transition-all hover:scale-105"
            >
              REINICIAR JORNADA
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-card/90 backdrop-blur-sm neon-border overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Lado da Imagem */}
          <div className="relative h-64 md:h-auto overflow-hidden crt-effect">
            <img
              src={question.image}
              alt="Character"
              className={`w-full h-full object-cover transition-all duration-300 ${
                showGlitch ? "glitch-effect" : ""
              }`}
            />
            <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded neon-border">
              <span className="text-primary font-bold">
                {currentQuestion + 1}/{questions.length}
              </span>
            </div>
          </div>

          {/* Lado do Quiz */}
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">
                  Decifrando a Rota
                </h3>
                <div className="text-sm font-bold text-accent">
                  PONTOS: {score}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground leading-tight">
                {question.question}
              </h2>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = index === question.correctAnswer;
                const showCorrect = showResult && isCorrectOption;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswerClick(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full justify-start text-left p-4 h-auto transition-all ${
                      showCorrect
                        ? "bg-primary text-primary-foreground neon-border"
                        : showWrong
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                    variant="ghost"
                  >
                    <span className="font-bold mr-3 text-secondary">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </Button>
                );
              })}
            </div>

            {showResult && (
              <div
                className={`p-4 rounded text-center font-bold ${
                  isCorrect
                    ? "bg-primary/20 text-primary neon-border"
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                {isCorrect ? "✓ ROTA CONFIRMADA!" : "✗ FALHA NA TRANSMISSÃO"}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
