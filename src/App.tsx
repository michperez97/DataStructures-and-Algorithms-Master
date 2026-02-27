import { RouterProvider } from "react-router";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { router } from "@/routes";
import { useEffect } from "react";
import { seedDatabase } from "@/db/seed";

function App() {
  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <ThemeProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
