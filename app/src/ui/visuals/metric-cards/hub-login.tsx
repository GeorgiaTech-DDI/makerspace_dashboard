// components/HubLogin.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HubLoginData {
  hubLoginCount: number;
}

const HubLogin: React.FC = () => {
  const [hubLoginCount, setHubLoginCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHubLoginCount = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/SUMS/hub_login');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch hub login data');
        }

        const data: HubLoginData = await response.json();
        setHubLoginCount(data.hubLoginCount);
      } catch (error: any) {
        console.error('Error fetching hub login data:', error);
        setError('Failed to load hub login data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHubLoginCount();

    // Optionally, refresh data every hour
    const interval = setInterval(fetchHubLoginCount, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hub Logins</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {hubLoginCount !== null && !loading && !error && (
          <p>{`Number of Hub Logins: ${hubLoginCount}`}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default HubLogin;
