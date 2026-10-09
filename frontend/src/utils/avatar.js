// Curated modern Tailwind gradients with high contrast for white text
export const AVATAR_GRADIENTS = [
  "bg-gradient-to-tr from-indigo-500 to-purple-600",
  "bg-gradient-to-tr from-blue-500 to-cyan-500",
  "bg-gradient-to-tr from-emerald-500 to-teal-600",
  "bg-gradient-to-tr from-rose-500 to-pink-600",
  "bg-gradient-to-tr from-amber-500 to-orange-600",
  "bg-gradient-to-tr from-violet-600 to-fuchsia-600",
  "bg-gradient-to-tr from-cyan-600 to-blue-600",
  "bg-gradient-to-tr from-fuchsia-600 to-rose-500",
  "bg-gradient-to-tr from-teal-500 to-emerald-600",
  "bg-gradient-to-tr from-sky-500 to-blue-600",
];

export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const parts = trimmed.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getAvatarGradient = (str = "") => {
  if (!str) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
};
