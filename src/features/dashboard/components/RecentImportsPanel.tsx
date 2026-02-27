import { Link } from "react-router";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function RecentImportsPanel() {
  const recentDocs = useLiveQuery(() =>
    db.courseDocs.orderBy("updatedAt").reverse().limit(5).toArray(),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <FileText className="text-muted-foreground h-5 w-5" />
        <CardTitle className="text-base">Recent Imports</CardTitle>
      </CardHeader>
      <CardContent>
        {!recentDocs || recentDocs.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No documents imported yet
          </p>
        ) : (
          <div className="space-y-2">
            {recentDocs.map((doc) => (
              <Link
                key={doc.docId}
                to={`/courses/${doc.courseId}/docs/${doc.docId}`}
                className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted"
              >
                <span className="text-sm truncate max-w-[200px]">
                  {doc.rawText.slice(0, 60)}
                  {doc.rawText.length > 60 ? "..." : ""}
                </span>
                <Badge variant="outline" className="ml-2 text-xs shrink-0">
                  {doc.type}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
