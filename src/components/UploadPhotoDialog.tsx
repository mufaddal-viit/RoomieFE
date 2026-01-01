import { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';

type UploadPhotoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: string;
  onSave: (dataUrl: string) => void;
};

const UploadPhotoDialog = ({ open, onOpenChange, initial = '?', onSave }: UploadPhotoDialogProps) => {
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const showInitial = useMemo(() => initial?.[0]?.toUpperCase() ?? '?', [initial]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPendingPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPendingPreview(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    if (!pendingPreview) return;
    onSave(pendingPreview);
    setPendingPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Photo</DialogTitle>
          <DialogDescription>Choose a profile photo to use in your menu avatar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          {pendingPreview && (
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage alt="Preview" src={pendingPreview} />
                <AvatarFallback>{showInitial}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">Preview</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!pendingPreview}>
            Save Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPhotoDialog;
