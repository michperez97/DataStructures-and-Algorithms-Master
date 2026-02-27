import { useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { toast } from "sonner";

import { useKnowledgeNode, usePrerequisiteNodes } from "../../hooks/use-knowledge-node";
import { useGlobalDSAMap } from "../../hooks/use-knowledge-map";
import { useTopicContent } from "../../hooks/use-topic-content";
import { useTopicGeneration } from "../../hooks/use-topic-generation";
import { useCategorySiblings } from "../../hooks/use-category-siblings";
import { useTopicDetailStore } from "@/stores/topic-detail-store";
import { useIsMobile } from "@/hooks/use-mobile";

import { PageHeader } from "@/components/shared/PageHeader";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import { SyllabusPanel } from "./SyllabusPanel";
import { LessonPanel } from "./LessonPanel";
import { CompanionPanel } from "./CompanionPanel";

export function TopicDetailLayout() {
  const { nodeId } = useParams();
  const isMobile = useIsMobile();

  // ─── Data hooks ────────────────────────────────────────────────────
  const { node, isLoading: nodeLoading } = useKnowledgeNode(nodeId);
  const { map } = useGlobalDSAMap();
  const { prerequisites } = usePrerequisiteNodes(map?.mapId, nodeId);

  const canonicalCourse = useLiveQuery(() =>
    db.courses.where("type").equals("Canonical").first(),
  );

  const topicTag = node?.topicTags[0];
  const {
    lessons,
    questions,
    hasContent,
    isLoading: contentLoading,
  } = useTopicContent(topicTag, canonicalCourse?.courseId);

  const { phase, isGenerating, elapsedMs, generate, cancel, reset } =
    useTopicGeneration();

  const {
    siblings,
    coveredCount,
    totalCount,
    progressPercent,
  } = useCategorySiblings(map?.mapId, node?.category);

  // ─── Panel state ───────────────────────────────────────────────────
  const {
    leftPanelOpen,
    rightPanelOpen,
    toggleLeftPanel,
    toggleRightPanel,
    openRightPanelTo,
  } = useTopicDetailStore();

  // Reset generation state when navigating to a different topic
  useEffect(() => {
    reset();
  }, [nodeId, reset]);

  // ─── Actions ───────────────────────────────────────────────────────
  const handleGenerate = useCallback(() => {
    if (node) generate(node);
  }, [node, generate]);

  const handleMarkRead = useCallback(async () => {
    if (!node) return;
    try {
      await db.knowledgeNodes.update(node.nodeId, { status: "Covered" });
      toast.success(`Marked "${node.title}" as read`);
    } catch {
      toast.error("Failed to update status");
    }
  }, [node]);

  const handlePractice = useCallback(() => {
    openRightPanelTo("assess");
  }, [openRightPanelTo]);

  // ─── Loading / Not Found ───────────────────────────────────────────
  if (nodeLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading..." />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="space-y-6">
        <PageHeader title="Topic Not Found" />
        <p className="text-muted-foreground text-sm">
          The requested topic could not be found.
        </p>
      </div>
    );
  }

  // ─── Panel content ─────────────────────────────────────────────────
  const syllabusContent = (
    <SyllabusPanel
      siblings={siblings}
      activeNodeId={node.nodeId}
      category={node.category ?? "General"}
      coveredCount={coveredCount}
      totalCount={totalCount}
      progressPercent={progressPercent}
      prerequisites={prerequisites}
    />
  );

  const companionContent = (
    <CompanionPanel questions={questions} topicTitle={node.title} />
  );

  // ─── Layout ────────────────────────────────────────────────────────
  return (
    <div className="-mx-6 -mb-6 flex h-[calc(100svh-4rem)] gap-3 p-3">
      {/* Left panel — Syllabus */}
      {isMobile ? (
        <Sheet open={leftPanelOpen} onOpenChange={toggleLeftPanel}>
          <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
            {syllabusContent}
          </SheetContent>
        </Sheet>
      ) : (
        leftPanelOpen && syllabusContent
      )}

      {/* Center panel — Lesson */}
      <LessonPanel
        node={node}
        lessons={lessons}
        hasContent={hasContent}
        contentLoading={contentLoading}
        isGenerating={isGenerating}
        phase={phase}
        elapsedMs={elapsedMs}
        onGenerate={handleGenerate}
        onCancel={cancel}
        onMarkRead={handleMarkRead}
        onPractice={handlePractice}
      />

      {/* Right panel — Companion */}
      {isMobile ? (
        <Sheet open={rightPanelOpen} onOpenChange={toggleRightPanel}>
          <SheetContent side="right" className="w-80 p-0" showCloseButton={false}>
            {companionContent}
          </SheetContent>
        </Sheet>
      ) : (
        rightPanelOpen && companionContent
      )}
    </div>
  );
}
