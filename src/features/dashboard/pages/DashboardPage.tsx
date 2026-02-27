import { PageHeader } from "@/components/shared/PageHeader";
import { ThisWeekPanel } from "@/features/dashboard/components/ThisWeekPanel";
import { DueSoonPanel } from "@/features/dashboard/components/DueSoonPanel";
import { RecommendedPracticePanel } from "@/features/dashboard/components/RecommendedPracticePanel";
import { RecentImportsPanel } from "@/features/dashboard/components/RecentImportsPanel";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your learning overview at a glance"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <ThisWeekPanel />
        <DueSoonPanel />
        <RecommendedPracticePanel />
        <RecentImportsPanel />
      </div>
    </div>
  );
}
