import { useEffect, useRef } from 'react';

interface BoomerangVideoBgProps {
  src: string;
}

const MAX_WIDTH = 960;
const PLAYBACK_FPS = 30;

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback: (callback: () => void) => number;
  cancelVideoFrameCallback: (handle: number) => void;
};

// requestVideoFrameCallback aún no está en el lib.dom.d.ts que trae esta
// versión de TypeScript como método garantizado -- se comprueba en tiempo de
// ejecución en vez de declararlo global, para no chocar con el tipado nativo.
function supportsVideoFrameCallback(video: HTMLVideoElement): video is VideoWithFrameCallback {
  return typeof (video as Partial<VideoWithFrameCallback>).requestVideoFrameCallback === 'function';
}

function scaledSize(videoWidth: number, videoHeight: number) {
  if (!videoWidth || !videoHeight) return { width: MAX_WIDTH, height: Math.round(MAX_WIDTH * 0.5625) };
  const width = Math.min(MAX_WIDTH, videoWidth);
  const height = Math.round((videoHeight / videoWidth) * width);
  return { width, height };
}

/**
 * Reproduce `src` una única vez (silenciado, sin controles) mientras captura
 * cada fotograma -- escalado a un ancho máximo de 960px -- en bitmaps fuera
 * de pantalla. Al terminar el vídeo, lo oculta y reproduce los fotogramas
 * capturados en bucle ping-pong (adelante, atrás, adelante...) a 30fps para
 * siempre: el efecto "boomerang".
 */
export default function BoomerangVideoBg({ src }: BoomerangVideoBgProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frames: ImageBitmap[] = [];
    let cancelled = false;
    let rvfcHandle: number | undefined;
    let rafHandle: number | undefined;
    let playbackTimer: number | undefined;

    async function captureFrame(currentVideo: HTMLVideoElement) {
      if (cancelled) return;
      const { width, height } = scaledSize(currentVideo.videoWidth, currentVideo.videoHeight);
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;
      offCtx.drawImage(currentVideo, 0, 0, width, height);
      try {
        const bitmap = await createImageBitmap(offscreen);
        if (!cancelled) frames.push(bitmap);
        else bitmap.close();
      } catch {
        // Un fotograma perdido no rompe el resto de la captura.
      }
    }

    function scheduleNextCapture(currentVideo: HTMLVideoElement) {
      if (cancelled) return;
      if (supportsVideoFrameCallback(currentVideo)) {
        rvfcHandle = currentVideo.requestVideoFrameCallback(() => {
          captureFrame(currentVideo).then(() => scheduleNextCapture(currentVideo));
        });
      } else {
        rafHandle = requestAnimationFrame(() => {
          captureFrame(currentVideo).then(() => scheduleNextCapture(currentVideo));
        });
      }
    }

    function startPingPongPlayback(currentVideo: HTMLVideoElement, currentCanvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
      currentVideo.style.display = 'none';
      if (!frames.length || cancelled) return;

      currentCanvas.width = frames[0].width;
      currentCanvas.height = frames[0].height;

      let index = 0;
      let direction = 1;
      const frameDurationMs = 1000 / PLAYBACK_FPS;

      function drawNextFrame() {
        if (cancelled) return;
        const frame = frames[index];
        if (frame) context.drawImage(frame, 0, 0, currentCanvas.width, currentCanvas.height);
        if (frames.length > 1) {
          if (index >= frames.length - 1) direction = -1;
          else if (index <= 0) direction = 1;
          index += direction;
        }
        playbackTimer = window.setTimeout(drawNextFrame, frameDurationMs);
      }
      drawNextFrame();
    }

    function stopCapture(currentVideo: HTMLVideoElement) {
      if (rvfcHandle !== undefined && supportsVideoFrameCallback(currentVideo)) {
        currentVideo.cancelVideoFrameCallback(rvfcHandle);
      }
      if (rafHandle !== undefined) cancelAnimationFrame(rafHandle);
    }

    function handlePlay() {
      scheduleNextCapture(video!);
    }
    function handleEnded() {
      stopCapture(video!);
      startPingPongPlayback(video!, canvas!, ctx!);
    }

    video.addEventListener('play', handlePlay, { once: true });
    video.addEventListener('ended', handleEnded);
    video.play().catch(() => {
      // Si el navegador bloquea el autoplay, el primer fotograma se queda
      // visible como imagen estática -- no hay nada más que hacer aquí.
    });

    return () => {
      cancelled = true;
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ended', handleEnded);
      stopCapture(video);
      if (playbackTimer !== undefined) window.clearTimeout(playbackTimer);
      frames.forEach((frame) => frame.close());
      frames = [];
    };
  }, [src]);

  return (
    <div className="absolute inset-0 z-0 scale-[1.08] origin-center overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        autoPlay
        crossOrigin="anonymous"
        className="h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}
