// components/Ingredient.tsx
'use client';

interface IngredientProps {
  emoji: string;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function Ingredient({ emoji, name, isSelected, onSelect }: IngredientProps) {
  return (
    <div 
      onClick={onSelect}
      className={`border-2 rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 bg-white
        ${isSelected ? 'border-purple-600 bg-purple-50' : 'border-slate-100 hover:border-slate-300 hover:-translate-y-0.5'}`}
    >
      <span className="text-3xl block mb-2">{emoji}</span>
      <span className="text-sm font-bold text-slate-700">{name}</span>
    </div>
  );
}
