// components/BookCard.tsx
interface BookCardProps {
  emoji: string;
  title: string;
  author: string;
  bgColor: string;
}

export default function BookCard({ emoji, title, author, bgColor }: BookCardProps) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:-translate-y-1 transition duration-300">
      <div className={`h-44 flex items-center justify-center text-5xl ${bgColor}`}>{emoji}</div>
      <div className="p-6">
        <h4 className="text-lg font-bold text-slate-800 mb-1">{title}</h4>
        <p className="text-sm text-slate-500">글/그림: {author}</p>
      </div>
    </div>
  );
}

