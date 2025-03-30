
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import ApiKeyInput from '@/components/ApiKeyInput';
import { MAPBOX_CONFIG } from '@/config/mapbox';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsPage = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Map Configuration</CardTitle>
            <CardDescription>
              Configure your map settings and API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="mapbox-key">Mapbox API Key</Label>
                <div className="flex mt-1">
                  <Input
                    id="mapbox-key"
                    value={MAPBOX_CONFIG.mapboxApiAccessToken.substring(0, 8) + '...'}
                    disabled
                    className="flex-1 mr-2"
                  />
                  <ApiKeyInput />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Mapbox API key is used to display maps and calculate geofences
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About GeoFence Nanny</CardTitle>
            <CardDescription>
              Information about this application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This app helps you automatically disable your camera and microphone when entering sensitive areas.
              Create geofences around sensitive locations like museums, government buildings, or private areas where
              recording is not allowed.
            </p>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Instructions:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Create geofences by clicking "Add Geofence" on the map</li>
                <li>Your device will be monitored when inside active geofences</li>
                <li>Camera and microphone will be disabled automatically</li>
                <li>You can customize each geofence's name, radius, and restrictions</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Version 1.0.0 • Built with React and Tailwind CSS
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
