import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateContentButtonProps {
  hasContent: boolean;
  isGenerating: boolean;
  onClick: () => void;
}

export function GenerateContentButton({
  hasContent,
  isGenerating,
  onClick,
}: GenerateContentButtonProps) {
  return (
    <Button onClick={onClick} disabled={isGenerating}>
      {isGenerating ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : hasContent ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate Content
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Content
        </>
      )}
    </Button>
  );
}
