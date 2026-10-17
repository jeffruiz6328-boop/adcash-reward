"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import { Play, CheckCircle, Loader2, X, Volume2, VolumeX } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  reward: number;
  imageUrl: string | null;
  videoUrl: string | null;
}

export default function WatchPage() {
  const { status } = useSession();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState<Ad | null>(null);
  const [progress, setProgress] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(true);
  const [usingTimer, setUsingTimer] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/ads")
      .then((r) => r.json())
      .then((data) => {
        setAds(data.ads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startFallbackTimer(duration: number) {
    setUsingTimer(true);
    clearTimer();
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 0.25;
      const percent = Math.min((elapsed / duration) * 100, 100);
      setProgress(percent);
      if (percent >= 100) {
        setCanClaim(true);
        clearTimer();
      }
    }, 250);
  }

  function startWatching(ad: Ad) {
    setWatching(ad);
    setProgress(0);
    setCanClaim(false);
    setMessage("");
    setMuted(true);
    setUsingTimer(false);
    clearTimer();

    // Give video a moment to load; if no videoUrl use timer immediately
    if (!ad.videoUrl) {
      startFallbackTimer(ad.duration || 30);
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) return;
    const percent = Math.min((video.currentTime / video.duration) * 100, 100);
    setProgress(percent);
    if (percent >= 98) setCanClaim(true);
  }

  function handleVideoEnded() {
    setProgress(100);
    setCanClaim(true);
  }

  function handleVideoError() {
    // Real video failed — fall back to timer so user can still earn
    if (watching && !usingTimer) {
      startFallbackTimer(watching.duration || 30);
    }
  }

  function handleVideoCanPlay() {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay blocked — still try muted play
        if (video) {
          video.muted = true;
          setMuted(true);
          video.play().catch(() => {
            if (watching) startFallbackTimer(watching.duration || 30);
          });
        }
      });
    }
  }

  async function claimReward() {
    if (!watching || !canClaim) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId: watching.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("+" + formatCurrency(data.reward) + " added to your balance!");
        closePlayer();
      } else {
        setMessage(data.error || "Failed to claim");
      }
    } catch {
      setMessage("Something went wrong");
    }
    setClaiming(false);
  }

  function closePlayer() {
    clearTimer();
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
    setWatching(null);
    setCanClaim(false);
    setProgress(0);
    setUsingTimer(false);
  }

  function toggleMute() {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setMuted(video.muted);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Watch Ads & Earn</h1>
          <p className="text-zinc-400 mt-1">Watch the full ad to claim your reward.</p>
        </div>

        {message && (
          <div
            className={
              "mb-6 rounded-xl border px-4 py-3 text-sm " +
              (message.startsWith("+")
                ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
                : "border-red-500/30 bg-red-500/10 text-red-400")
            }
          >
            {message}
          </div>
        )}

        {watching && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="relative w-full max-w-lg">
              <button
                onClick={closePlayer}
                className="absolute -top-12 right-0 text-white/70 hover:text-white"
              >
                <X className="h-7 w-7" />
              </button>

              <div className="overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
                <div className="relative aspect-video bg-black">
                  {watching.videoUrl && !usingTimer ? (
                    <>
                      <video
                        ref={videoRef}
                        src={watching.videoUrl}
                        className="h-full w-full object-contain"
                        playsInline
                        muted={muted}
                        autoPlay
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnded}
                        onError={handleVideoError}
                        onCanPlay={handleVideoCanPlay}
                      />
                      <button
                        onClick={toggleMute}
                        className="absolute bottom-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                      >
                        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                    </>
                  ) : (
                    <>
                      {watching.imageUrl ? (
                        <img
                          src={watching.imageUrl}
                          alt={watching.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600">Ad</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {!canClaim && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          Playing
                        </div>
                      )}
                    </>
                  )}

                  {canClaim && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500 text-black">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{watching.title}</h3>
                    <span className="text-brand-400 font-bold">{formatCurrency(watching.reward)}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">{watching.description}</p>

                  <div className="mb-1 flex justify-between text-xs text-zinc-500">
                    <span>Watch progress · {Math.round(progress)}%</span>
                    <span>{watching.duration}s</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-800 mb-5 overflow-hidden">
                    <div
                      className="h-full bg-brand-500 transition-all duration-200 ease-linear"
                      style={{ width: progress + "%" }}
                    />
                  </div>

                  {canClaim ? (
                    <button
                      onClick={claimReward}
                      disabled={claiming}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 font-semibold text-black hover:bg-brand-400 disabled:opacity-50"
                    >
                      {claiming ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                      Claim {formatCurrency(watching.reward)}
                    </button>
                  ) : (
                    <div className="rounded-xl bg-zinc-800 py-3.5 text-center text-sm text-zinc-400">
                      Keep watching… Claim appears when finished
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-colors"
            >
              <div className="relative">
                {ad.imageUrl && (
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-44 object-cover" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-black shadow-lg">
                    <Play className="h-6 w-6 fill-current ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                  {ad.duration}s
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-1 line-clamp-1">{ad.title}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{ad.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-brand-400 font-semibold">{formatCurrency(ad.reward)}</span>
                  <button
                    onClick={() => startWatching(ad)}
                    disabled={!!watching}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-black hover:bg-brand-400 disabled:opacity-40"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Watch
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
