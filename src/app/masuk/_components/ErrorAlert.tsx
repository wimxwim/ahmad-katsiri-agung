import { AlertCircle } from "lucide-react";

export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
      <p className="text-xs text-red-600">{message}</p>
    </div>
  );
}
