export function ScoreGuide() {
  const rules = [
    "成交量放大（超過 20 日均量 1.5 倍）",
    "突破 20 日高點",
    "均線多頭排列",
    "漲幅超過 3%",
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
      <h2 className="text-base font-bold text-zinc-900">分數怎麼來？</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        每符合一項加 <span className="font-semibold text-zinc-800">25 分</span>
        ，滿分 100 分：
      </p>
      <ul className="mt-3 space-y-2">
        {rules.map((rule) => (
          <li
            key={rule}
            className="flex items-start gap-2 text-sm text-zinc-700"
          >
            <span className="mt-0.5 text-emerald-500">●</span>
            {rule}
          </li>
        ))}
      </ul>
    </section>
  );
}
