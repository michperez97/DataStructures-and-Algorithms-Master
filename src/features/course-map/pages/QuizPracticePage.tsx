import { useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { QuizProgressBar } from "../components/QuizProgressBar";
import { QuizQuestionCard } from "../components/QuizQuestionCard";
import { QuizResultsSummary } from "../components/QuizResultsSummary";
import { useQuizSession } from "../hooks/use-quiz-session";
import { COT4400_ASSESSMENTS, COT4400_WEEKS } from "../data/cot4400-course";

export function QuizPracticePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    session,
    questions,
    attempts,
    currentQuestion,
    currentIndex,
    totalQuestions,
    showingAnswer,
    isComplete,
    score,
    masteryDeltas,
    revealAnswer,
    submitAnswer,
    isLoading,
  } = useQuizSession(sessionId);

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading quiz...</div>;
  }

  if (!session || questions.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <p>Quiz session not found.</p>
        <Button asChild variant="outline">
          <Link to="/my-course">Back to Course Map</Link>
        </Button>
      </div>
    );
  }

  const assessmentDef = COT4400_ASSESSMENTS.find(
    (a) => a.assessmentId === session.targetAssessmentId,
  );
  const weekDef = assessmentDef
    ? COT4400_WEEKS.find((w) =>
        w.assessmentRefs.includes(assessmentDef.assessmentId),
      )
    : undefined;

  if (isComplete && score) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <QuizResultsSummary
          score={score}
          questions={questions}
          attempts={attempts}
          assessmentName={assessmentDef?.name}
          weekNumber={weekDef?.weekNumber}
          masteryDeltas={masteryDeltas}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        {weekDef && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 mb-2"
          >
            <Link to={`/my-course/week/${weekDef.weekNumber}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Week {weekDef.weekNumber}
            </Link>
          </Button>
        )}
        {assessmentDef && (
          <h1 className="font-serif text-xl font-semibold tracking-tight">{assessmentDef.name}</h1>
        )}
      </div>

      <QuizProgressBar current={currentIndex} total={totalQuestions} />

      {currentQuestion && (
        <QuizQuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          showingAnswer={showingAnswer}
          onReveal={revealAnswer}
          onSubmit={submitAnswer}
        />
      )}
    </div>
  );
}
