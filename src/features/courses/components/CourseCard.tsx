import { Link } from "react-router";
import { BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/db/schema";
import { COT4400_COURSE_ID } from "@/features/course-map/data/cot4400-course";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const href = course.courseId === COT4400_COURSE_ID
    ? "/my-course"
    : `/courses/${course.courseId}`;

  return (
    <Link to={href}>
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="bg-primary/10 rounded-md p-2">
              <BookOpen className="text-primary h-5 w-5" />
            </div>
            <Badge variant="secondary">{course.type}</Badge>
          </div>
          <CardTitle className="mt-3 text-lg">{course.name}</CardTitle>
          {course.description && (
            <CardDescription className="line-clamp-2">
              {course.description}
            </CardDescription>
          )}
        </CardHeader>
        {course.topicTags && course.topicTags.length > 0 && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1">
              {course.topicTags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {course.topicTags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{course.topicTags.length - 4}
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
