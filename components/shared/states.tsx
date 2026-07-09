import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ label = "Something went wrong" }: { label?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 py-8 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        {label}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm font-medium">{title}</div>
        {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
