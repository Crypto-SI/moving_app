import { PageHeader } from "@/components/layout/page-header";
import { TimelineBoard } from "@/components/sections/timeline-board";

export default function MovingTimelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Moving Timeline" description="The full relocation checklist supports list, kanban, and timeline views while the sticky summary strip remains visible above the page content." actionLabel="Add milestone" />
      <TimelineBoard />
    </div>
  );
}
