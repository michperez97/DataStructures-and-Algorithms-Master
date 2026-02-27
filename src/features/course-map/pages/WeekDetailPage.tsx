import { useParams, Link, useNavigate } from "react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, FileText, Megaphone } from "lucide-react";
import { AssessmentCard } from "../components/AssessmentCard";
import { GenerateQuizButton } from "../components/GenerateQuizButton";
import { WeekUploadSection } from "../components/WeekUploadSection";
import { useWeekDetail } from "../hooks/use-week-detail";
import { StatusSparkIcon } from "@/features/topic-explorer/components/StatusSparkIcon";

export function WeekDetailPage() {
  const { weekNum } = useParams<{ weekNum: string }>();
  const weekNumber = Number(weekNum);
  const navigate = useNavigate();

  const {
    weekDef,
    assessmentDefs,
    module,
    sourceQuestions,
    pastSessions,
    weekDocs,
    topicNodes,
    isLoading,
  } = useWeekDetail(weekNumber);

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading week details...</div>;
  }

  if (!weekDef || !module) {
    return (
      <div className="space-y-4 p-4">
        <p>Week not found.</p>
        <Button asChild variant="outline">
          <Link to="/my-course">Back to Course Map</Link>
        </Button>
      </div>
    );
  }

  // Prefer module data (from uploaded announcement) over static weekDef
  const hasModuleUpdate = !!module.description;
  const displayName = module.name || weekDef.name;
  const displayTopics = hasModuleUpdate
    ? module.description!
    : weekDef.topics;
  const displayTags =
    module.topicTags && module.topicTags.length > 0
      ? module.topicTags
      : weekDef.topicTags;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/my-course")}
          className="-ml-2 mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Course Map
        </Button>
        <PageHeader
          title={displayName}
          description={displayTopics}
        />
      </div>

      {displayTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {displayTags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Topic tiles linking to topic explorer */}
      {topicNodes.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Topics
          </h3>
          <div className="grid gap-1.5">
            {topicNodes.map((node) => (
              <Link
                key={node.nodeId}
                to={`/explorer/${node.nodeId}`}
                className="group flex items-center gap-2 rounded-lg border border-stone-200/80 bg-white/80 px-3 py-1.5 backdrop-blur-xl transition-all hover:border-stone-300 hover:shadow-md dark:border-white/[0.06] dark:bg-[#201E1D]/80 dark:hover:border-white/15"
              >
                <StatusSparkIcon status={node.status} className="size-4 shrink-0" />
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                  {node.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <WeekUploadSection
        weekNumber={weekNumber}
        moduleId={weekDef.moduleId}
        assessmentRefs={weekDef.assessmentRefs}
      />

      {weekDocs.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Uploaded Documents
          </h3>
          {weekDocs.map((doc) => (
            <div
              key={doc.docId}
              className="flex items-center gap-3 rounded-xl border border-stone-200/60 p-3 dark:border-white/[0.06]"
            >
              {doc.type === "Announcement" ? (
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium">{doc.type}</span>
                <p className="truncate text-xs text-muted-foreground">
                  {doc.rawText.slice(0, 100)}
                  {doc.rawText.length > 100 ? "..." : ""}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {assessmentDefs.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No assessments scheduled for this week.
        </p>
      )}

      {assessmentDefs.map((aDef) => {
        const aSourceQs = sourceQuestions.filter(
          (q) => q.targetAssessmentId === aDef.assessmentId,
        );
        const aSessions = pastSessions.filter(
          (s) => s.targetAssessmentId === aDef.assessmentId,
        );

        return (
          <AssessmentCard
            key={aDef.assessmentId}
            assessmentDef={aDef}
            sourceQuestions={aSourceQs}
          >
            <div className="space-y-4">
              <GenerateQuizButton
                assessmentId={aDef.assessmentId}
                assessmentName={aDef.name}
                questionCount={
                  aDef.format.questionCount > 0
                    ? aDef.format.questionCount
                    : aSourceQs.length
                }
              />

              {aSessions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Previous Attempts</h4>
                  {aSessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className="flex items-center justify-between rounded-xl border border-stone-200/60 dark:border-white/[0.06] p-3"
                    >
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </span>
                        {session.difficulty && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs"
                          >
                            {session.difficulty}
                          </Badge>
                        )}
                        {session.completedAt && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-xs"
                          >
                            Completed
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/my-course/quiz/${session.sessionId}`)
                        }
                      >
                        <Play className="mr-1 h-3 w-3" />
                        {session.completedAt ? "Review" : "Resume"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AssessmentCard>
        );
      })}
    </div>
  );
}
