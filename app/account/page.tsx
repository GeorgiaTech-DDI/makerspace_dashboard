'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, LogOut } from "lucide-react";

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Set default bypass behavior: true in production, false in dev
// Override with NEXT_PUBLIC_BYPASS_CAS env var if it exists
const BYPASS_CAS = process.env.NEXT_PUBLIC_BYPASS_CAS !== undefined 
  ? process.env.NEXT_PUBLIC_BYPASS_CAS === 'true'
  : isProduction;

const CAS_CONFIG = {
  protocol: 'https',
  hostname: 'sso.gatech.edu',
  port: 443,
  uri: '/cas'
};

console.log('Account page module loaded');

const AccountPage = () => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        console.log('Session data:', data);
        
        if (data.user !== user) {
          setUser(data.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setLoading(false);
      }
    }
    
    // Initial check
    checkSession();
    
    // Set up interval for continuous checking
    const interval = setInterval(checkSession, 5000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = () => {
    console.log('Login clicked');
    const baseUrl = window.location.origin;
    const serviceUrl = `${baseUrl}/account`;
    
    if (BYPASS_CAS) {
      const mockTicket = `ST-MOCK-${Date.now()}-gburdell3`;
      window.location.href = `${serviceUrl}?ticket=${mockTicket}`;
    } else {
      window.location.href = `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}${CAS_CONFIG.uri}/login?service=${encodeURIComponent(serviceUrl)}`;
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    const baseUrl = window.location.origin;
    const serviceUrl = `${baseUrl}/account`;
    window.location.href = `/api/auth/logout?service=${encodeURIComponent(serviceUrl)}`;
  };

  console.log('Rendering with state:', { user, loading });

  if (loading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
                <div className="flex items-center justify-between">
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
};

export default AccountPage;