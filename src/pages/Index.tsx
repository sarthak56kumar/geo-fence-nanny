
import React, { useEffect } from 'react';
import Map from '@/components/Map';
import GeofenceList from '@/components/GeofenceList';
import Header from '@/components/Header';
import { GeofenceProvider } from '@/context/GeofenceContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { MapPin, Settings } from 'lucide-react';

const Index = () => {
  return (
    <GeofenceProvider>
      <div className="flex flex-col h-screen bg-background">
        <Header />
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Main content - Map and Geofence List */}
          <div className="flex-1 md:flex-[2] overflow-hidden h-[60vh] md:h-auto">
            <Map />
          </div>
          
          {/* Mobile-friendly tabs for bottom panel */}
          <div className="md:hidden border-t border-border">
            <Tabs defaultValue="geofences" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="geofences" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Geofences
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="geofences" className="h-72 overflow-y-auto">
                <GeofenceList />
              </TabsContent>
              
              <TabsContent value="settings" className="p-4">
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-2">About GeoFence Nanny</h3>
                  <p className="text-sm text-muted-foreground">
                    This app helps you automatically disable your camera and microphone 
                    when entering sensitive areas.
                  </p>
                  <div className="mt-4">
                    <h4 className="font-medium">Instructions:</h4>
                    <ul className="text-sm list-disc list-inside space-y-1 mt-2">
                      <li>Create geofences by clicking "Add Geofence"</li>
                      <li>Your device will be monitored when inside active geofences</li>
                      <li>Camera and microphone will be disabled automatically</li>
                    </ul>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Desktop sidebar */}
          <div className="hidden md:block border-l border-border w-80 h-full overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">My Geofences</h2>
              <GeofenceList />
            </div>
          </div>
        </div>
        
        {/* Location tracking notification */}
        <div className="bg-muted p-2 text-xs text-center text-muted-foreground">
          Your location is only stored locally on your device and is used to check if you're inside a geofence.
        </div>
      </div>
    </GeofenceProvider>
  );
};

export default Index;
