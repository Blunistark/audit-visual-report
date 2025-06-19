
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Canvas as FabricCanvas, Rect, FabricImage } from 'fabric';
import { Square, Pen, Eraser, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface AnnotationCanvasProps {
  screenshot: File | null;
  onAnnotatedImage: (dataUrl: string) => void;
}

export const AnnotationCanvas = ({ screenshot, onAnnotatedImage }: AnnotationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'rectangle' | 'draw' | 'eraser'>('select');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  useEffect(() => {
    if (!canvasRef.current || !screenshot) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    // Initialize the freeDrawingBrush with proper null checks
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = '#ef4444';
      canvas.freeDrawingBrush.width = 3;
    }

    setFabricCanvas(canvas);

    // Load the screenshot as background
    const img = new Image();
    img.crossOrigin = 'anonymous';
      img.onload = () => {
      console.log('Image loaded:', img.width, 'x', img.height);
      
      const aspectRatio = img.width / img.height;
      let newWidth = 800;
      let newHeight = 600;

      if (aspectRatio > 800 / 600) {
        newHeight = 800 / aspectRatio;
      } else {
        newWidth = 600 * aspectRatio;
      }

      console.log('Canvas dimensions:', newWidth, 'x', newHeight);
      canvas.setDimensions({ width: newWidth, height: newHeight });
        // Create fabric image from the loaded image
      const fabricImg = new FabricImage(img, {
        scaleX: newWidth / img.width,
        scaleY: newHeight / img.height,
        selectable: false,
        evented: false,
        left: 0,
        top: 0,
      });
      
      console.log('Fabric image created with scale:', newWidth / img.width, newHeight / img.height);
      
      // Set as background image
      canvas.backgroundImage = fabricImg;
      canvas.renderAll();
      setIsImageLoaded(true);
      toast.success('Image loaded! Start annotating.');
    };
    
    img.onerror = (error) => {
      console.error('Failed to load image:', error);
      toast.error('Failed to load image for annotation');
    };
    
    img.src = URL.createObjectURL(screenshot);

    return () => {
      canvas.dispose();
      URL.revokeObjectURL(img.src);
    };
  }, [screenshot]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = '#ef4444';
      fabricCanvas.freeDrawingBrush.width = 3;
    }
  }, [activeTool, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (tool === 'rectangle' && fabricCanvas) {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: '#ef4444',
        strokeWidth: 3,
        width: 150,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    }
  };
  const handleClear = () => {
    if (!fabricCanvas) return;
    
    // Remove all objects except background image
    const objects = fabricCanvas.getObjects();
    const objectsToRemove = objects.filter(obj => obj !== fabricCanvas.backgroundImage);
    objectsToRemove.forEach(obj => fabricCanvas.remove(obj));
    
    fabricCanvas.renderAll();
    toast.success('Annotations cleared!');
  };

  const handleSave = () => {
    if (!fabricCanvas) return;
    
    const dataUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    onAnnotatedImage(dataUrl);
    toast.success('Annotations saved!');
  };

  if (!screenshot) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <Square className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Upload a screenshot to start annotating</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => handleToolClick('select')}
            variant={activeTool === 'select' ? 'default' : 'outline'}
            size="sm"
          >
            Select
          </Button>
          <Button
            onClick={() => handleToolClick('rectangle')}
            variant={activeTool === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1"
          >
            <Square className="h-4 w-4" />
            Rectangle
          </Button>
          <Button
            onClick={() => handleToolClick('draw')}
            variant={activeTool === 'draw' ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1"
          >
            <Pen className="h-4 w-4" />
            Draw
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded shadow-sm bg-white max-w-full"
        />
      </div>

      {isImageLoaded && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Instructions:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Use <strong>Rectangle</strong> to highlight specific areas</li>
            <li>• Use <strong>Draw</strong> to freehand annotate</li>
            <li>• Click <strong>Save</strong> to include annotations in your report</li>
          </ul>
        </div>
      )}
    </div>
  );
};
