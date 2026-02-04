"use client";

import { useEffect, useState } from "react";
import { RatingStars } from "./RatingStars";

interface Rating {
  id: string;
  stars: number;
  comment: string | null;
  createdAt: string;
  fromUser: {
    id: string;
    email: string;
  };
  listing: {
    id: string;
    title: string;
  } | null;
}

interface UserRatingsProps {
  userId: string;
}

export function UserRatings({ userId }: UserRatingsProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ratings?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ratings) {
          setRatings(data.ratings);
          setAverage(data.average || 0);
          setCount(data.count || 0);
        }
      })
      .catch((error) => {
        console.error("Error fetching ratings:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return <div className="text-sm text-slate-500">Chargement des évaluations...</div>;
  }

  if (count === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/75 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Évaluations</h3>
        <p className="text-sm text-slate-500">Aucune évaluation pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/75 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Évaluations</h3>
        <div className="flex items-center gap-2">
          <RatingStars value={Math.round(average)} readonly size="md" />
          <span className="text-sm font-medium text-slate-700">
            {average.toFixed(1)} ({count})
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="border-t border-slate-200 pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <RatingStars value={rating.stars} readonly size="sm" />
                  <span className="text-sm font-medium text-slate-700">
                    {rating.fromUser.email.split("@")[0]}
                  </span>
                  {rating.listing && (
                    <span className="text-xs text-slate-500">
                      • {rating.listing.title}
                    </span>
                  )}
                </div>
                {rating.comment && (
                  <p className="text-sm text-slate-600 mt-1">{rating.comment}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(rating.createdAt).toLocaleDateString("fr-BE")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
