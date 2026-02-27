import { useParams, Link } from "react-router";
import { Settings, FileText, ClipboardList, Palette, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCourse } from "@/features/courses/hooks/use-course";
import { useCourseDocs } from "@/features/course-docs/hooks/use-course-docs";
import { useAssessments } from "@/features/assessments/hooks/use-assessments";
import { useStyleProfile } from "@/features/course-style/hooks/use-style-profile";

export function CourseDetailPage() {
  const { courseId } = useParams();
  const { course, isLoading } = useCourse(courseId);
  const { docs } = useCourseDocs(courseId);
  const { assessments } = useAssessments(courseId);
  const { profile: styleProfile } = useStyleProfile(courseId);

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading...</div>;
  }

  if (!course) {
    return <div className="text-muted-foreground p-4">Course not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.name}
        action={
          <Button variant="outline" asChild>
            <Link to={`/courses/${course.courseId}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge>{course.type}</Badge>
        {course.difficultyDefault && (
          <Badge variant="outline">{course.difficultyDefault}</Badge>
        )}
        <Badge variant="secondary">{course.privacyMode}</Badge>
      </div>

      {course.description && (
        <p className="text-muted-foreground max-w-2xl">{course.description}</p>
      )}

      {course.topicTags && course.topicTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {course.topicTags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to={`/courses/${course.courseId}/docs`}>
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="bg-primary/10 rounded-md p-2">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Documents</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {docs.length} imported
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Import course materials to extract topics, tasks, and due dates.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to={`/courses/${course.courseId}/assessments`}>
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="bg-primary/10 rounded-md p-2">
                <ClipboardList className="text-primary h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Assessments</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {assessments.length} defined
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Define class assessments and generate targeted practice.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to={`/courses/${course.courseId}/style`}>
          <Card className="transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="bg-primary/10 rounded-md p-2">
                <Palette className="text-primary h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Course Style</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {styleProfile ? "Configured" : "Not configured"}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Terminology, notation, and difficulty preferences.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="bg-muted rounded-md p-2">
              <Brain className="text-muted-foreground h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Practice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Start quiz sessions and track mastery. Coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
