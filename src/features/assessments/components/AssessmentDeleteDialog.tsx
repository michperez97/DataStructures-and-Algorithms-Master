import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AssessmentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentName: string;
  onConfirm: () => void | Promise<void>;
}

export function AssessmentDeleteDialog({
  open,
  onOpenChange,
  assessmentName,
  onConfirm,
}: AssessmentDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Assessment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{assessmentName}&quot;? This
            action cannot be undone and will remove the format profile and rubric.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
