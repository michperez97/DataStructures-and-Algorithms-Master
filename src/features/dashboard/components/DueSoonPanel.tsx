import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DueSoonPanel() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <Clock className="text-muted-foreground h-5 w-5" />
        <CardTitle className="text-base">Due Soon</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">Coming soon</p>
      </CardContent>
    </Card>
  );
}
