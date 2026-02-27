import { Link } from "react-router";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CourseCard } from "@/features/courses/components/CourseCard";
import { useCourses } from "@/features/courses/hooks/use-courses";

export function CourseListPage() {
  const { courses, isLoading } = useCourses();

  if (isLoading) {
    return <div className="text-muted-foreground p-4">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Manage your learning courses"
        action={
          <Button asChild>
            <Link to="/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </Link>
          </Button>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to start learning data structures and algorithms."
          actionLabel="Create Course"
          actionHref="/courses/new"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.courseId} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
