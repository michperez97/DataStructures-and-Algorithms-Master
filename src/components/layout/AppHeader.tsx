import { useLocation, Link } from "react-router";
import { LayoutDashboard, BookOpen, GraduationCap, Compass, PanelLeft, PanelRight } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useTopicDetailStore } from "@/stores/topic-detail-store";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Courses", href: "/courses", icon: BookOpen },
  { title: "COT4400", href: "/my-course", icon: GraduationCap },
  { title: "Explorer", href: "/explorer", icon: Compass },
];

export function AppHeader() {
  const { pathname } = useLocation();
  const { leftPanelOpen, rightPanelOpen, toggleLeftPanel, toggleRightPanel } =
    useTopicDetailStore();

  const isTopicDetail = /^\/explorer\/.+/.test(pathname);

  return (
    <div className="fixed top-0 left-0 w-full flex justify-center pt-4 pb-2 z-30 pointer-events-none px-4">
      <div className="flex items-center bg-white/90 dark:bg-[#201E1D]/90 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 rounded-full shadow-lg shadow-stone-200/30 dark:shadow-black/40 pointer-events-auto p-1.5 transition-all">

        {/* Left: Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 pl-2 pr-4 border-r border-stone-200/80 dark:border-stone-700/60 font-serif font-medium text-foreground hover:opacity-70 transition-opacity"
        >
          <span className="text-sm tracking-tight">DSA Master</span>
        </Link>

        {/* Center: Nav tabs */}
        <nav className="flex items-center gap-0.5 px-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-stone-900 text-white dark:bg-stone-200 dark:text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <item.icon className="size-3.5" />
                <span className="hidden sm:block">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 pl-2 border-l border-stone-200/80 dark:border-stone-700/60">
          {isTopicDetail && (
            <>
              <button
                onClick={toggleLeftPanel}
                className={`flex items-center justify-center rounded-full p-1.5 transition-all ${
                  leftPanelOpen
                    ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300"
                }`}
                title="Toggle syllabus panel"
              >
                <PanelLeft className="size-3.5" />
              </button>
              <button
                onClick={toggleRightPanel}
                className={`flex items-center justify-center rounded-full p-1.5 transition-all ${
                  rightPanelOpen
                    ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300"
                }`}
                title="Toggle companion panel"
              >
                <PanelRight className="size-3.5" />
              </button>
            </>
          )}
          <ThemeToggle />
        </div>

      </div>
    </div>
  );
}
