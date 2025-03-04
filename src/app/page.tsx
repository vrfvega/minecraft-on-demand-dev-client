import ServerInfo from "@/components/server-info";
import ServerStartForm from "@/components/server-start-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QueryProvider from "@/lib/query-provider";
import { Server } from "lucide-react";

export default function Page() {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-t-4 border-primary shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              <CardTitle>Minecraft Server Admin</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your Minecraft server instance
            </p>
          </CardHeader>
          <CardContent>
            <ServerInfo />
            <ServerStartForm />
          </CardContent>
        </Card>
      </div>
    </QueryProvider>
  );
}
