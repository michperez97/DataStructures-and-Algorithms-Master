import { Link } from "react-router";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CourseDoc } from "@/db/schema";

interface CourseDocCardProps {
  doc: CourseDoc;
  courseId: string;
}

export function CourseDocCard({ doc, courseId }: CourseDocCardProps) {
  const truncated =
    doc.rawText.length > 120
      ? doc.rawText.slice(0, 120) + "..."
      : doc.rawText;

  return (
    <Link to={`/courses/${courseId}/docs/${doc.docId}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="bg-primary/10 rounded-md p-2">
              <FileText className="text-primary h-5 w-5" />
            </div>
            <Badge variant="secondary">{doc.type}</Badge>
          </div>
          <CardTitle className="mt-3 text-lg line-clamp-1">
            {doc.type} Document
          </CardTitle>
          <CardDescription className="line-clamp-3">
            {truncated}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {doc.postedAt && <span>Posted: {doc.postedAt}</span>}
            {doc.dueAt && <span>Due: {doc.dueAt}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
