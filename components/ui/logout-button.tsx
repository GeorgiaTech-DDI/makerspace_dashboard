'use client';

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <Button 
      onClick={handleLogout}
      variant="outline"
    >
      Logout
    </Button>
  );
}