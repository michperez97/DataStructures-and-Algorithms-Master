import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Search, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useGlobalDSAMap } from "../hooks/use-knowledge-map";
import { useKnowledgeNodes } from "../hooks/use-knowledge-nodes";
import { DSA_CATEGORIES, type DSACategory } from "../data/dsa-taxonomy";
import { StatusSparkIcon } from "../components/StatusSparkIcon";

// ─── Super-categories that group the existing DSA categories ────────

interface SuperCategory {
  label: string;
  categories: DSACategory[];
}

const SUPER_CATEGORIES: SuperCategory[] = [
  {
    label: "Foundations",
    categories: ["Complexity Analysis"],
  },
  {
    label: "Data Structures",
    categories: [
      "Arrays & Strings",
      "Linked Lists",
      "Stacks & Queues",
      "Hash Tables",
      "Trees",
      "Heaps & Priority Queues",
      "Graphs",
    ],
  },
  {
    label: "Algorithms",
    categories: [
      "Sorting",
      "Searching",
      "Recursion & Backtracking",
      "Divide and Conquer",
      "Dynamic Programming",
      "Greedy Algorithms",
    ],
  },
];

// ─── Page ───────────────────────────────────────────────────────────

export function TopicExplorerPage() {
  const { map, isLoading: mapLoading } = useGlobalDSAMap();
  const { nodes, isLoading: nodesLoading } = useKnowledgeNodes(map?.mapId);
  const [search, setSearch] = useState("");

  const isLoading = mapLoading || nodesLoading;

  const categories = useMemo(() => {
    const q = search.toLowerCase();
    return DSA_CATEGORIES.map((cat) => {
      const catNodes = nodes.filter((n) => n.category === cat);
      const coveredCount = catNodes.filter(
        (n) => n.status === "Covered" || n.status === "Mastered",
      ).length;
      const firstNodeId = catNodes[0]?.nodeId;
      return { name: cat, nodes: catNodes, coveredCount, total: catNodes.length, firstNodeId };
    })
      .filter((c) => c.total > 0)
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.nodes.some((n) => n.title.toLowerCase().includes(q))
        );
      });
  }, [nodes, search]);

  const totalCovered = nodes.filter(
    (n) => n.status === "Covered" || n.status === "Mastered",
  ).length;

  // Group filtered categories into super-categories
  const sections = useMemo(() => {
    return SUPER_CATEGORIES
      .map((sc) => ({
        label: sc.label,
        items: sc.categories
          .map((name) => categories.find((c) => c.name === name))
          .filter(Boolean) as typeof categories,
      }))
      .filter((s) => s.items.length > 0);
  }, [categories]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Topic Explorer" />
        <p className="text-muted-foreground text-sm">Loading topics...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Topic Explorer"
        description={`${totalCovered} of ${nodes.length} topics covered`}
      />

      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search categories or topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {sections.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No categories found"
          description="Try adjusting your search."
        />
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.label}>
              <h2 className="mb-3 font-mono text-[0.6875rem] font-medium uppercase tracking-widest text-stone-400 dark:text-stone-500">
                {section.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.items.map((cat) => {
                  const pct = cat.total > 0 ? Math.round((cat.coveredCount / cat.total) * 100) : 0;
                  const dominantStatus =
                    cat.coveredCount === cat.total
                      ? "Mastered"
                      : cat.coveredCount > 0
                        ? "InProgress"
                        : "NotCovered";

                  return (
                    <Link
                      key={cat.name}
                      to={cat.firstNodeId ? `/explorer/${cat.firstNodeId}` : "/explorer"}
                      className="group flex items-start gap-4 rounded-2xl border border-stone-200/80 bg-white/80 px-5 py-4 backdrop-blur-xl transition-all hover:border-stone-300 hover:shadow-md dark:border-white/5 dark:bg-[#201E1D]/80 dark:hover:border-white/10"
                    >
                      <StatusSparkIcon
                        status={dominantStatus}
                        className="mt-0.5 size-5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                          {cat.name}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {cat.total} topics
                        </p>

                        {/* Progress bar */}
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700/50">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[0.6875rem] tabular-nums text-stone-400">
                            {cat.coveredCount}/{cat.total}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
