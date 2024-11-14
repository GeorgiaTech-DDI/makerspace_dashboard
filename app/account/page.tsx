// app/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut } from "lucide-react";

export default function AccountPage() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Check for GT session cookie
    const gtSession = document.cookie
      .split('; ')
      .find(row => row.startsWith('gt_session='));
    
    if (gtSession) {
      setUser(decodeURIComponent(gtSession.split('=')[1]));
    }
  }, []);

  const handleLogin = () => {
    window.location.href = '/dashboard'; // This will trigger CAS auth
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your GT account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {user ? (
            <>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{user.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user}</h3>
                  <p className="text-sm text-muted-foreground">Georgia Tech Account</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span>{user}@gatech.edu</span>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Sign in with your GT account to access dashboard features
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={handleLogin}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In with GT Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

