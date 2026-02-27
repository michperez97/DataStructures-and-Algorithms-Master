import { createBrowserRouter } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { CourseListPage } from "@/features/courses/pages/CourseListPage";
import { CourseCreatePage } from "@/features/courses/pages/CourseCreatePage";
import { CourseDetailPage } from "@/features/courses/pages/CourseDetailPage";
import { CourseSettingsPage } from "@/features/courses/pages/CourseSettingsPage";
import { CourseDocListPage } from "@/features/course-docs/pages/CourseDocListPage";
import { CourseDocImportPage } from "@/features/course-docs/pages/CourseDocImportPage";
import { CourseDocDetailPage } from "@/features/course-docs/pages/CourseDocDetailPage";
import { CourseDocEditPage } from "@/features/course-docs/pages/CourseDocEditPage";
import { AssessmentListPage } from "@/features/assessments/pages/AssessmentListPage";
import { AssessmentCreatePage } from "@/features/assessments/pages/AssessmentCreatePage";
import { AssessmentDetailPage } from "@/features/assessments/pages/AssessmentDetailPage";
import { AssessmentEditPage } from "@/features/assessments/pages/AssessmentEditPage";
import { CourseStylePage } from "@/features/course-style/pages/CourseStylePage";
import { TopicExplorerPage } from "@/features/topic-explorer/pages/TopicExplorerPage";
import { TopicDetailPage } from "@/features/topic-explorer/pages/TopicDetailPage";
import { CourseMapPage } from "@/features/course-map/pages/CourseMapPage";
import { WeekDetailPage } from "@/features/course-map/pages/WeekDetailPage";
import { QuizPracticePage } from "@/features/course-map/pages/QuizPracticePage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "courses", element: <CourseListPage /> },
      { path: "courses/new", element: <CourseCreatePage /> },
      { path: "courses/:courseId", element: <CourseDetailPage /> },
      { path: "courses/:courseId/settings", element: <CourseSettingsPage /> },
      { path: "courses/:courseId/docs", element: <CourseDocListPage /> },
      { path: "courses/:courseId/docs/new", element: <CourseDocImportPage /> },
      { path: "courses/:courseId/docs/:docId", element: <CourseDocDetailPage /> },
      { path: "courses/:courseId/docs/:docId/edit", element: <CourseDocEditPage /> },
      { path: "courses/:courseId/assessments", element: <AssessmentListPage /> },
      { path: "courses/:courseId/assessments/new", element: <AssessmentCreatePage /> },
      { path: "courses/:courseId/assessments/:assessmentId", element: <AssessmentDetailPage /> },
      { path: "courses/:courseId/assessments/:assessmentId/edit", element: <AssessmentEditPage /> },
      { path: "courses/:courseId/style", element: <CourseStylePage /> },
      { path: "explorer", element: <TopicExplorerPage /> },
      { path: "explorer/:nodeId", element: <TopicDetailPage /> },
      { path: "my-course", element: <CourseMapPage /> },
      { path: "my-course/week/:weekNum", element: <WeekDetailPage /> },
      { path: "my-course/quiz/:sessionId", element: <QuizPracticePage /> },
    ],
  },
]);
