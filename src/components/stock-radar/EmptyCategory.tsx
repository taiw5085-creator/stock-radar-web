interface EmptyCategoryProps {
  categoryLabel: string;
}

export function EmptyCategory({ categoryLabel }: EmptyCategoryProps) {
  return (
    <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-zinc-100">
      <p className="text-3xl">📭</p>
      <p className="mt-3 text-base font-semibold text-zinc-700">
        目前沒有符合條件的股票
      </p>
      <p className="mt-1 text-sm text-zinc-500">{categoryLabel} 類別暫無標的</p>
    </div>
  );
}
