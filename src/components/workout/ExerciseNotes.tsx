interface ExerciseNotesProps {
  notes: string;
  onChangeNotes: (notes: string) => void;
}

export default function ExerciseNotes({ notes, onChangeNotes }: ExerciseNotesProps) {
  return (
    <div className="bg-[#FFFCFA] border border-[#EAE3DE] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75] block">
        EXERCISE NOTES
      </span>
      <textarea
        value={notes}
        onChange={(e) => onChangeNotes(e.target.value)}
        rows={2}
        className="w-full bg-[#F8F5F2] border border-[#EAE3DE] rounded-2xl p-3 text-xs text-[#4A423E] focus:outline-none focus:border-[#6B2D3A]"
      />
    </div>
  );
}