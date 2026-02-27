import type { InteractiveLesson, Question } from "@/db/schema";
import { LessonRenderer } from "./content/LessonRenderer";
import { QuestionRenderer } from "./content/QuestionRenderer";

interface TopicContentPanelProps {
  lessons: InteractiveLesson[];
  questions: Question[];
}

export function TopicContentPanel({ lessons, questions }: TopicContentPanelProps) {
  return (
    <div className="space-y-8">
      {lessons.length > 0 && <LessonRenderer lessons={lessons} />}
      <QuestionRenderer questions={questions} />
    </div>
  );
}
