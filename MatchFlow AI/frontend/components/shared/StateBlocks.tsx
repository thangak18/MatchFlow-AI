import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh] min-h-[300px]">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry, retryLabel = "Try Again" }: { error: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh] min-h-[300px]">
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-danger" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">Something went wrong</h3>
      <p className="text-muted-foreground max-w-md mb-6">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl h-[50vh] min-h-[300px] bg-secondary/30">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}
