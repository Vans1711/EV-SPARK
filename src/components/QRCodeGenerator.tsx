import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Share } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  payeeVpa: string;
  payeeName: string;
  amount: number;
  message?: string;
}

const QRCodeGenerator = ({ payeeVpa, payeeName, amount, message }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current) return;

      try {
        // Construct UPI URL
        const upiUrl = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(message || 'EV Charging Payment')}`;
        
        // Generate QR code
        await QRCode.toCanvas(canvasRef.current, upiUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#ffffff',
            light: '#1a1a1a'
          }
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [payeeVpa, payeeName, amount, message]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL();
    link.download = `ev-spark-payment-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded');
  };

  const handleShare = async () => {
    if (navigator.share && canvasRef.current) {
      try {
        const response = await fetch(canvasRef.current.toDataURL());
        const blob = await response.blob();
        const file = new File([blob], 'payment-qr.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'EV Spark Payment QR Code',
          text: `Scan to pay ₹${amount} to ${payeeName}`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback for browsers that support clipboard but not share
        try {
          await navigator.clipboard.writeText(canvasRef.current.toDataURL());
          toast.success('UPI payment link copied to clipboard');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          toast.error('Could not share QR code');
        }
      }
    } else {
      // Fallback for browsers without share API
      try {
        await navigator.clipboard.writeText(canvasRef.current.toDataURL());
        toast.success('UPI payment link copied to clipboard');
      } catch (error) {
        console.error('Clipboard error:', error);
        toast.error('Could not copy payment link');
      }
    }
  };

  return (
    <Card className="neo-card border-white/5 shadow-lg w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-white">UPI Payment QR Code</CardTitle>
        <CardDescription className="text-white/60">
          Scan with any UPI app to pay
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          className="w-64 h-64 rounded-lg"
          aria-label="UPI Payment QR Code"
        />
        
        <div className="w-full mt-4 space-y-2">
          <div className="flex justify-between text-white">
            <span>Payment to:</span>
            <span className="font-medium">{payeeName}</span>
          </div>
          
          <div className="flex justify-between text-white">
            <span>UPI ID:</span>
            <span className="font-medium">{payeeVpa}</span>
          </div>
          
          <div className="text-white/60 text-sm mt-4">
            Open your UPI app, scan this QR code, and confirm the payment
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          onClick={handleDownload} 
          className="w-full sm:w-1/2"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button 
          variant="outline" 
          onClick={handleShare}
          className="w-full sm:w-1/2"
        >
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QRCodeGenerator; 