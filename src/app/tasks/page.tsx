"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, Loader2, ClipboardList, Download, Mail, Gift, ShoppingBag, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  type: string;
  reward: number;
  imageUrl: string | null;
}

const typeIcons: Record<string, any> = {
  daily: Gift,
  survey: ClipboardList,
  install: Download,
  signup: Mail,
  offer: ShoppingBag,
};

const typeLabels: Record<string, string> = {
  daily: "Daily",
  survey: "Survey",
  install: "Install",
  signup: "Sign-up",
  offer: "Offer",
};

// Simple survey questions
const SURVEY_QUESTIONS = [
  { q: "How often do you shop online?", options: ["Daily", "Weekly", "Monthly", "Rarely"] },
  { q: "What is your preferred payment method?", options: ["Card", "Cash", "Mobile money", "Crypto"] },
  { q: "How did you hear about us?", options: ["Friend", "Social media", "Google", "Other"] },
];

export default function TasksPage() {
  const { status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [step, setStep] = useState(0); // for survey questions
  const [answers, setAnswers] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function openTask(task: Task) {
    setActiveTask(task);
    setStep(0);
    setAnswers([]);
    setConfirmed(false);
    setMessage("");
  }

  function closeTask() {
    setActiveTask(null);
    setStep(0);
    setAnswers([]);
    setConfirmed(false);
  }

  function selectAnswer(answer: string) {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (step < SURVEY_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Finished survey questions
      setStep(SURVEY_QUESTIONS.length);
    }
  }

  async function completeTask() {
    if (!activeTask) return;
    setCompleting(true);
    try {
      const res = await fetch("/api/complete-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: activeTask.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("+" + formatCurrency(data.reward) + " added to your balance!");
        setTasks((prev) => prev.filter((t) => t.id !== activeTask.id || t.type === "daily"));
        closeTask();
      } else {
        setMessage(data.error || "Failed to complete");
        closeTask();
      }
    } catch {
      setMessage("Something went wrong");
      closeTask();
    }
    setCompleting(false);
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
          <h1 className="text-2xl font-bold">Earn with Tasks</h1>
          <p className="text-zinc-400 mt-1">
            Complete surveys, offers and more. You must finish the steps to earn.
          </p>
        </div>

        {message && (
          <div className={"mb-6 rounded-xl border px-4 py-3 text-sm " + (message.startsWith("+") ? "border-brand-500/30 bg-brand-500/10 text-brand-400" : "border-red-500/30 bg-red-500/10 text-red-400")}>
            {message}
          </div>
        )}

        {/* Task modal */}
        {activeTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">{activeTask.title}</h2>
                  <p className="text-sm text-zinc-400 mt-1">{activeTask.description}</p>
                </div>
                <button onClick={closeTask} className="text-zinc-500 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* SURVEY FLOW */}
              {activeTask.type === "survey" && step < SURVEY_QUESTIONS.length && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">
                    Question {step + 1} of {SURVEY_QUESTIONS.length}
                  </p>
                  <p className="font-medium mb-4">{SURVEY_QUESTIONS[step].q}</p>
                  <div className="space-y-2">
                    {SURVEY_QUESTIONS[step].options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => selectAnswer(opt)}
                        className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-left text-sm hover:border-brand-500 hover:bg-brand-500/10 transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SURVEY DONE */}
              {activeTask.type === "survey" && step >= SURVEY_QUESTIONS.length && (
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-brand-400 mb-3" />
                  <p className="mb-4">Survey completed! Claim your reward.</p>
                  <button
                    onClick={completeTask}
                    disabled={completing}
                    className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-black hover:bg-brand-400 disabled:opacity-50"
                  >
                    {completing ? "Claiming…" : "Claim " + formatCurrency(activeTask.reward)}
                  </button>
                </div>
              )}

              {/* DAILY / INSTALL / SIGNUP / OFFER – require confirmation */}
              {activeTask.type !== "survey" && (
                <div>
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 mb-4 text-sm text-zinc-400">
                    {activeTask.type === "daily" && "Come back every day to claim this bonus. Click the button below to claim."}
                    {activeTask.type === "install" && "1. Download the app from the link\n2. Open it and reach the required level\n3. Come back and confirm below."}
                    {activeTask.type === "signup" && "1. Open the partner link\n2. Create your free account\n3. Confirm your email\n4. Come back and confirm below."}
                    {activeTask.type === "offer" && "1. Visit the partner store\n2. Complete the required action\n3. Come back and confirm below."}
                  </div>
                  <label className="flex items-center gap-3 mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-600"
                    />
                    <span className="text-sm">I have completed this task</span>
                  </label>
                  <button
                    onClick={() => confirmed && completeTask()}
                    disabled={!confirmed || completing}
                    className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-black hover:bg-brand-400 disabled:opacity-40"
                  >
                    {completing ? "Claiming…" : "Claim " + formatCurrency(activeTask.reward)}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Task grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const Icon = typeIcons[task.type] || ClipboardList;
            return (
              <div key={task.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-colors">
                {task.imageUrl && <img src={task.imageUrl} alt={task.title} className="w-full h-36 object-cover" />}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                      <Icon className="h-3 w-3" />
                      {typeLabels[task.type] || task.type}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{task.title}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-400 font-semibold">{formatCurrency(task.reward)}</span>
                    <button
                      onClick={() => openTask(task)}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-500/10 px-3 py-1.5 text-sm font-medium text-brand-400 hover:bg-brand-500/20"
                    >
                      Start
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {tasks.length === 0 && !loading && (
          <p className="text-center text-zinc-500 py-12">No tasks available right now.</p>
        )}
      </main>
    </div>
  );
}
