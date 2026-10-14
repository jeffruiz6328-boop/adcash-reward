"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [reward, setReward] = useState(0.25);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/admin/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        duration,
        reward,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
      }),
    });
    if (res.ok) {
      setMsg("Ad created!");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setVideoUrl("");
      router.refresh();
    } else {
      setMsg("Failed to create");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4"
    >
      <h2 className="font-semibold">Add New Video Ad</h2>
      {msg && <p className="text-sm text-brand-400">{msg}</p>}
      <div>
        <label className="text-xs text-zinc-400">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-zinc-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-400">Duration (sec)</label>
          <input
            type="number"
            min={10}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400">Reward ($)</label>
          <input
            type="number"
            step="0.01"
            min={0.10}
            max={8}
            value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-zinc-400">Thumbnail Image URL</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-zinc-400">Video URL (MP4)</label>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://.../video.mp4"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Direct link to an MP4 file. User must watch to the end to claim.
        </p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold text-black hover:bg-brand-400 disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create Video Ad"}
      </button>
    </form>
  );
}
