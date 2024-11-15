// app/unauthorized/page.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            <CardTitle>Unauthorized Access</CardTitle>
          </div>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This page requires specific permissions. If you believe you should
            have access, please contact your administrator or return to the
            dashboard.
          </p>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="default">Return to Home</Button>
            </Link>
            <Link href="/account">
              <Button variant="outline">Switch Account</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
