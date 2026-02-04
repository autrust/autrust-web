"use client";

import { useState } from "react";
import { RatingStars } from "./RatingStars";
import { useRouter } from "next/navigation";

interface CreateRatingProps {
  toUserId: string;
  toUserName: string;
  listingId?: string;
  listingTitle?: string;
  onSuccess?: () => void;
}

export function CreateRating({
  toUserId,
  toUserName,
  listingId,
  listingTitle,
  onSuccess,
}: CreateRatingProps) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (stars === 0) {
      setError("Veuillez sélectionner une note");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId,
          stars,
          comment: comment.trim() || undefined,
          listingId: listingId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "CANNOT_RATE_SELF") {
          setError("Tu ne peux pas te noter toi-même");
        } else {
          setError("Erreur lors de l'évaluation");
        }
        setLoading(false);
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating rating:", error);
      setError("Erreur lors de l'évaluation");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white/75 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Évaluer {toUserName}
        {listingTitle && (
          <span className="text-sm font-normal text-slate-500">
            {" "}pour &quot;{listingTitle}&quot;
          </span>
        )}
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Note sur 5 étoiles
        </label>
        <RatingStars value={stars} onChange={setStars} size="lg" />
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-2">
          Commentaire (optionnel)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Partage ton expérience..."
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
        <p className="mt-1 text-xs text-slate-500">{comment.length}/500</p>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || stars === 0}
        className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Envoi..." : "Envoyer l'évaluation"}
      </button>
    </form>
  );
}
