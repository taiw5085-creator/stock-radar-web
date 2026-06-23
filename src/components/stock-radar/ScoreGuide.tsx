export function ScoreGuide() {
  const groups = [
    {
      title: "基礎條件（各 25 分）",
      rules: [
        "成交量 > 20 日均量 1.5 倍",
        "突破 20 日高點",
        "收盤 > 5 日 > 10 日 > 20 日線",
        "漲幅 > 3%",
      ],
    },
    {
      title: "主力籌碼（各 20 分）",
      rules: ["外資連買 3 天", "投信連買 3 天"],
    },
    {
      title: "爆量轉強（各 15 分）",
      rules: ["今日量 > 昨日量 1.8 倍", "今日漲幅 > 4%"],
    },
    {
      title: "突破整理 / 均線（各 20 分）",
      rules: ["近 10 日橫盤後突破", "5 > 10 > 20 > 60 均線結構"],
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
      <h2 className="text-base font-bold text-zinc-900">分數怎麼來？</h2>
      <p className="mt-2 text-sm text-zinc-600">v2 綜合評分，滿分 210 分</p>
      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold text-zinc-700">{group.title}</p>
            <ul className="mt-2 space-y-1.5">
              {group.rules.map((rule) => (
                <li
                  key={rule}
                  className="flex items-start gap-2 text-sm text-zinc-600"
                >
                  <span className="mt-0.5 text-emerald-500">●</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
