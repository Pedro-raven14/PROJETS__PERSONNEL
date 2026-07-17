/**
 * Avatar utilisateur : photo ou initiale colorée.
 */
export default function Avatar({ user, size = "md", className = "" }) {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-4xl",
  };

  const colors = [
    "bg-orange-400",
    "bg-teal-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-pink-500",
    "bg-yellow-500",
  ];

  const name = user?.fullName || user?.username || "?";
  const initial = name.charAt(0).toUpperCase();
  const colorIdx =
    name.charCodeAt(0) % colors.length;

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
}
