import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  courseSchema,
  type CourseFormData,
} from "@/features/courses/schemas/course-schema";
import type { Course } from "@/db/schema";

interface CourseFormProps {
  initialData?: Course;
  onSubmit: (data: CourseFormData) => void | Promise<void>;
  submitLabel?: string;
}

export function CourseForm({
  initialData,
  onSubmit,
  submitLabel = "Create Course",
}: CourseFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [type, setType] = useState<string>(initialData?.type ?? "UserAuthored");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [topicTags, setTopicTags] = useState(
    initialData?.topicTags?.join(", ") ?? "",
  );
  const [difficulty, setDifficulty] = useState<string>(
    initialData?.difficultyDefault ?? "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = courseSchema.safeParse({
      name,
      type,
      description: description || undefined,
      topicTags: topicTags || undefined,
      difficultyDefault: difficulty || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field) fieldErrors[String(field)] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">Course Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., COP3530 - Data Structures"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Course Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Canonical">Canonical</SelectItem>
            <SelectItem value="UserAuthored">User Authored</SelectItem>
            <SelectItem value="Imported">Imported</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the course..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="topicTags">Topic Tags (comma-separated)</Label>
        <Input
          id="topicTags"
          value={topicTags}
          onChange={(e) => setTopicTags(e.target.value)}
          placeholder="e.g., Arrays, Trees, Sorting"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Default Difficulty</Label>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
