
import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, RefreshCw, Loader2 } from 'lucide-react';

interface CameraViewProps {
    onCapture: (base64: string) => void;
    onClose: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const startCamera = async () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode },
                audio: false
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("无法启动相机:", err);
            setError("无法访问相机，请确保已授予权限。");
        }
    };

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [facingMode]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const base64 = canvas.toDataURL('image/jpeg', 0.8);
                const cleanBase64 = base64.split(',')[1];
                onCapture(cleanBase64);
            }
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    return (
        <div className="fixed inset-0 bg-black z-[110] flex flex-col">
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                {error ? (
                    <div className="text-white text-center px-6">
                        <p className="mb-4">{error}</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-white text-black rounded-full font-bold"
                        >
                            关闭
                        </button>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {!stream && (
                            <div className="absolute inset-0 flex flex-center items-center justify-center bg-black/50">
                                <Loader2 className="animate-spin text-white" size={48} />
                            </div>
                        )}
                    </>
                )}

                {/* Top Controls */}
                <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pb-10">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20"
                    >
                        <X size={24} />
                    </button>

                    <button
                        onClick={toggleCamera}
                        className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="h-32 bg-zinc-900 flex items-center justify-center px-10">
                <button
                    onClick={handleCapture}
                    disabled={!stream}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:bg-gray-600"
                >
                    <div className="w-16 h-16 border-2 border-zinc-900 rounded-full flex items-center justify-center">
                        <Camera size={32} className="text-zinc-900" />
                    </div>
                </button>
            </div>

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default CameraView;
