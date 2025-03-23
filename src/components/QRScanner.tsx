import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Camera, ScanLine } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScanSuccess: (data: any) => void;
  onCancel: () => void;
}

const QRScanner = ({ onScanSuccess, onCancel }: QRScannerProps) => {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);

  // Set up the camera and start scanning
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        
        // Start the scanning process
        requestAnimationFrame(scanQRCode);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please ensure camera permissions are enabled.');
        setScanning(false);
      }
    };

    startCamera();

    return () => {
      // Clean up
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const scanQRCode = () => {
    if (!scanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      animationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      
      if (code) {
        setScanning(false);
        try {
          // Try to parse the QR code data as JSON
          let parsedData;
          try {
            parsedData = JSON.parse(code.data);
          } catch (e) {
            // If not valid JSON, check if it's a UPI URL
            if (code.data.startsWith('upi://')) {
              // Parse UPI URL parameters
              const url = new URL(code.data);
              const pa = url.searchParams.get('pa'); // payee address (VPA)
              const pn = url.searchParams.get('pn'); // payee name
              const am = url.searchParams.get('am'); // amount
              const tn = url.searchParams.get('tn'); // transaction note

              parsedData = {
                payeeVpa: pa,
                payeeName: pn,
                amount: am,
                description: tn
              };
            } else {
              // If not a UPI URL, just use the raw data
              parsedData = { data: code.data };
            }
          }
          onScanSuccess(parsedData);
        } catch (error) {
          console.error('Error processing QR code:', error);
          setError('Invalid QR code format. Please try again.');
          setScanning(true);
        }
      } else {
        // Continue scanning if no QR code found
        animationRef.current = requestAnimationFrame(scanQRCode);
      }
    } else {
      // Video not ready yet, continue scanning
      animationRef.current = requestAnimationFrame(scanQRCode);
    }
  };

  const handleCancel = () => {
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onCancel();
  };

  return (
    <Card className="w-full max-w-md bg-ev-dark-100 border-white/10">
      <CardHeader className="relative">
        <Button 
          variant="ghost" 
          className="absolute right-2 top-2 p-2 text-white hover:bg-white/10 rounded-full"
          onClick={handleCancel}
        >
          <X className="h-5 w-5" />
        </Button>
        <CardTitle className="text-white">Scan QR Code</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-black">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-ev-dark-300/50 text-white p-4 text-center">
              {error}
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                className="absolute inset-0 h-full w-full object-cover"
                muted 
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2/3 h-2/3 border-2 border-ev-green-400 rounded-lg relative">
                  <ScanLine className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 w-full text-ev-green-400 animate-scan" />
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          className="w-full border-white/10 text-white hover:bg-white/5"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QRScanner; 