import { X, Maximize2, Play, Pause, Volume2, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
    url: string;
    title: string;
    onClose: () => void;
}

export default function VideoPlayer({ url, title, onClose }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(current);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
                {/* Header Info */}
                <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center">
                    <h2 className="text-white font-display font-bold text-lg md:text-xl truncate pr-10">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/10 hover:bg-red-500 text-white rounded-2xl transition-all active:scale-95 border border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Video Element */}
                <video
                    ref={videoRef}
                    src={url}
                    className="w-full h-full cursor-pointer"
                    onTimeUpdate={handleTimeUpdate}
                    onClick={togglePlay}
                    autoPlay
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />

                {/* Custom Controls (Simplified for Premium Look) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 overflow-hidden group cursor-pointer">
                        <div
                            className="h-full bg-primary relative transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                            </button>
                            <button className="text-white/80 hover:text-white transition-colors">
                                <Volume2 className="w-5 h-5" />
                            </button>
                            <span className="text-white/60 text-xs font-bold tracking-widest uppercase">HD 1080p</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <button className="text-white/80 hover:text-white transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                            <button className="text-white/80 hover:text-white transition-colors">
                                <Maximize2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
