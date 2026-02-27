import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  FileText,
  ClipboardList,
  Compass,
  GraduationCap,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui-store";
import { useCourseStore } from "@/stores/course-store";

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const navigate = useNavigate();
  const activeCourseId = useCourseStore((s) => s.activeCourseId);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const runCommand = (cmd: () => void) => {
    setOpen(false);
    cmd();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/courses"))}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Courses
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/explorer"))}
          >
            <Compass className="mr-2 h-4 w-4" />
            Topic Explorer
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/my-course"))}
          >
            <GraduationCap className="mr-2 h-4 w-4" />
            My Course
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/courses/new"))}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </CommandItem>
        </CommandGroup>
        {activeCourseId && (
          <CommandGroup heading="Active Course">
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  navigate(`/courses/${activeCourseId}/docs/new`),
                )
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              Import Document
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() =>
                  navigate(`/courses/${activeCourseId}/assessments/new`),
                )
              }
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              New Assessment
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
