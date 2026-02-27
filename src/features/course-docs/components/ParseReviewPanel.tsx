import { useState } from "react";
import { toast } from "sonner";
import { Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { db } from "@/db";
import type { CourseDocParse } from "@/db/schema";

interface ParseReviewPanelProps {
  parse: CourseDocParse;
  rawText: string;
}

export function ParseReviewPanel({ parse, rawText }: ParseReviewPanelProps) {
  const [topics, setTopics] = useState(parse.detectedTopics);
  const [tasks, setTasks] = useState(parse.detectedTasks);
  const [dueDates, setDueDates] = useState(parse.detectedDueDates);
  const [coverageStatements, setCoverageStatements] = useState(
    parse.detectedCoverageStatements,
  );
  const [editingIdx, setEditingIdx] = useState<{
    section: string;
    index: number;
  } | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (section: string, index: number, currentValue: string) => {
    setEditingIdx({ section, index });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingIdx) return;
    const { section, index } = editingIdx;

    if (section === "topics") {
      const updated = [...topics];
      updated[index] = { ...updated[index], label: editValue };
      setTopics(updated);
    } else if (section === "tasks") {
      const updated = [...tasks];
      updated[index] = { ...updated[index], description: editValue };
      setTasks(updated);
    } else if (section === "dueDates") {
      const updated = [...dueDates];
      updated[index] = { ...updated[index], label: editValue };
      setDueDates(updated);
    } else if (section === "coverage") {
      const updated = [...coverageStatements];
      updated[index] = { ...updated[index], text: editValue };
      setCoverageStatements(updated);
    }

    setEditingIdx(null);
    setEditValue("");
  };

  const handleAccept = async () => {
    await db.courseDocParses.update(parse.parseId, {
      detectedTopics: topics,
      detectedTasks: tasks,
      detectedDueDates: dueDates,
      detectedCoverageStatements: coverageStatements,
      status: "Accepted",
      updatedAt: new Date().toISOString(),
    });
    toast.success("Parse accepted");
  };

  const renderEditableItem = (
    section: string,
    index: number,
    label: string,
    confidence: number,
  ) => {
    const isEditing =
      editingIdx?.section === section && editingIdx?.index === index;

    return (
      <div
        key={`${section}-${index}`}
        className="flex items-center gap-2 py-1"
      >
        {isEditing ? (
          <>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 flex-1"
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
            />
            <Button size="sm" variant="ghost" onClick={saveEdit}>
              <Check className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <>
            <span className="flex-1 text-sm">{label}</span>
            <ConfidenceBadge confidence={confidence} />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startEdit(section, index, label)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Raw Text</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground max-h-96 overflow-y-auto">
            {rawText}
          </pre>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Topics ({topics.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topics.length === 0 && (
              <p className="text-sm text-muted-foreground">None detected</p>
            )}
            {topics.map((t, i) =>
              renderEditableItem("topics", i, t.label, t.confidence),
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Tasks ({tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground">None detected</p>
            )}
            {tasks.map((t, i) =>
              renderEditableItem("tasks", i, t.description, t.confidence),
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Due Dates ({dueDates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dueDates.length === 0 && (
              <p className="text-sm text-muted-foreground">None detected</p>
            )}
            {dueDates.map((d, i) =>
              renderEditableItem(
                "dueDates",
                i,
                `${d.label} — ${d.date}`,
                d.confidence,
              ),
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Coverage ({coverageStatements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coverageStatements.length === 0 && (
              <p className="text-sm text-muted-foreground">None detected</p>
            )}
            {coverageStatements.map((c, i) => (
              <div key={`coverage-${i}`} className="py-1">
                {renderEditableItem("coverage", i, c.text, c.confidence)}
                <div className="flex flex-wrap gap-1 ml-1 mt-1">
                  {c.mappedTopics.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={handleAccept} className="w-full">
          <Check className="mr-2 h-4 w-4" />
          Accept Parse
        </Button>
      </div>
    </div>
  );
}
