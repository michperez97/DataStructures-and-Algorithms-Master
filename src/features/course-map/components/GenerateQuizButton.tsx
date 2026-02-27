import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Play } from "lucide-react";
import { DifficultySelector } from "./DifficultySelector";
import { useQuizGeneration } from "../hooks/use-quiz-generation";
import type { Difficulty } from "@/db/schema";

interface GenerateQuizButtonProps {
  assessmentId: string;
  assessmentName: string;
  questionCount: number;
}

export function GenerateQuizButton({
  assessmentId,
  assessmentName,
  questionCount,
}: GenerateQuizButtonProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const { phase, isGenerating, elapsedMs, lastSessionId, generate, cancel } =
    useQuizGeneration();
  const navigate = useNavigate();

  const handleGenerate = () => {
    generate(assessmentId, assessmentName, difficulty, questionCount);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <DifficultySelector
          value={difficulty}
          onChange={setDifficulty}
          disabled={isGenerating}
        />
        <Button
          onClick={isGenerating ? cancel : handleGenerate}
          disabled={questionCount === 0}
          variant={isGenerating ? "outline" : "default"}
          size="sm"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating... ({(elapsedMs / 1000).toFixed(0)}s)
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Quiz
            </>
          )}
        </Button>
      </div>

      {phase === "done" && lastSessionId && (
        <Button
          size="sm"
          onClick={() => navigate(`/my-course/quiz/${lastSessionId}`)}
        >
          <Play className="mr-2 h-4 w-4" />
          Start Quiz
        </Button>
      )}

      {phase === "error" && (
        <p className="text-destructive text-sm">
          Generation failed. Try again.
        </p>
      )}
    </div>
  );
}
