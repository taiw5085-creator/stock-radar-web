import type { SpotlightTag } from "@/lib/stock-radar/types";

const tagStyles: Record<SpotlightTag, string> = {
  剛突破: "bg-red-100 text-red-700 ring-red-200",
  量先出來: "bg-blue-100 text-blue-700 ring-blue-200",
  吸籌觀察: "bg-purple-100 text-purple-700 ring-purple-200",
};

interface SpotlightTagsProps {
  tags: SpotlightTag[];
  className?: string;
}

export function SpotlightTags({ tags, className = "" }: SpotlightTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${tagStyles[tag]}`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
