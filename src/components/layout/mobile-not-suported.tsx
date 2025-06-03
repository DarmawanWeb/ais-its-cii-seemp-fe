import { Card, CardContent, CardHeader } from "../ui/card";
import { AlertTriangle } from "lucide-react";

export default function NotSupported() {
  return (
    <main
      className="flex items-center justify-center min-h-screen w-screen bg-muted px-4"
      role="alert"
      aria-label="Unsupported Device Message"
    >
      <Card className="max-w-md w-full text-center border-red-500 border-2 shadow-md rounded-2xl bg-background">
        <CardHeader className="flex flex-col items-center gap-3 py-6">
          <AlertTriangle className="text-red-500 w-10 h-10" />
          <p className="text-xl font-semibold text-red-600">
            Only supported on desktop
          </p>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground pb-6 px-4">
          This application is not available on mobile or tablet devices. Please
          access it using a desktop browser for the best experience.
        </CardContent>
      </Card>
    </main>
  );
}
