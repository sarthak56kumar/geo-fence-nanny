
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MAPBOX_CONFIG } from '@/config/mapbox';

const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    // In a real app, you'd store this securely and update the config
    // This is just a demo implementation
    if (apiKey.trim()) {
      localStorage.setItem('mapbox-api-key', apiKey);
      window.location.reload(); // Reload to apply the new API key
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Change API Key
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Mapbox API Key</DialogTitle>
          <DialogDescription>
            Enter your Mapbox API key to use for maps and geolocation.
            You can get a key from the Mapbox dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              placeholder="Enter your Mapbox API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyInput;
