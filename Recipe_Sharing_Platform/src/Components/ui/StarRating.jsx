import { Star } from "lucide-react";

/**
 * Affiche une note en étoiles.
 * @param {number} rating - Valeur entre 0 et 5
 * @param {number} size - Taille des étoiles en px (défaut 16)
 * @param {boolean} interactive - Si true, les étoiles sont cliquables
 * @param {function} onRate - Callback quand on clique sur une étoile
 */
export default function StarRating({
  rating = 0,
  size = 16,
  interactive = false,
  onRate = null,
  className = "",
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {stars.map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            className={`${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : "cursor-default"
            }`}
            disabled={!interactive}
          >
            <Star
              size={size}
              className={filled ? "text-orange-400 fill-orange-400" : "text-gray-300 fill-gray-300"}
            />
          </button>
        );
      })}
    </div>
  );
}
