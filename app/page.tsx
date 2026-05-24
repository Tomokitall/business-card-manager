"use client";

import { useEffect, useMemo, useState } from "react";

type BusinessCard = {
  id: number;
  name: string;
  company: string;
  position: string;
  officePhone: string;
  mobilePhone: string;
  email: string;
  createdAt: string;
};

const defaultCards: BusinessCard[] = [
  {
    id: 1,
    name: "山田 太郎",
    company: "Green Tech株式会社",
    position: "営業部長",
    officePhone: "06-1234-5678",
    mobilePhone: "090-1234-5678",
    email: "yamada@example.com",
    createdAt: "2026-05-24",
  },
];

export default function Page() {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("date");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [copied, setCopied] = useState("");

  const [form, setForm] = useState({
    name: "",
    company: "",
    position: "",
    officePhone: "",
    mobilePhone: "",
    email: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("business-cards");
    setCards(saved ? JSON.parse(saved) : defaultCards);
  }, []);

  useEffect(() => {
    localStorage.setItem("business-cards", JSON.stringify(cards));
  }, [cards]);

  const formatPhone = (value: string) => {
    const n = value.replace(/[^0-9]/g, "");

    if (n.startsWith("070") || n.startsWith("080") || n.startsWith("090")) {
      if (n.length <= 3) return n;
      if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
      return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`;
    }

    if (n.startsWith("06")) {
      if (n.length <= 2) return n;
      if (n.length <= 6) return `${n.slice(0, 2)}-${n.slice(2)}`;
      return `${n.slice(0, 2)}-${n.slice(2, 6)}-${n.slice(6, 10)}`;
    }

    if (n.length <= 3) return n;
    if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
    return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6, 10)}`;
  };

  const sortedCards = useMemo(() => {
    const result = cards.filter((card) => {
      const text = `${card.name} ${card.company} ${card.position} ${card.email}`;
      return text.toLowerCase().includes(search.toLowerCase());
    });

    const collator = new Intl.Collator("ja", {
      numeric: true,
      sensitivity: "base",
    });

    return result.sort((a, b) => {
      const isAlphabet = (text: string) => /^[a-zA-Z]/.test(text);

      if (sortType === "name") {
        const aAlpha = isAlphabet(a.name);
        const bAlpha = isAlphabet(b.name);
        if (!aAlpha && bAlpha) return -1;
        if (aAlpha && !bAlpha) return 1;
        return collator.compare(a.name, b.name);
      }

      if (sortType === "company") {
        const aAlpha = isAlphabet(a.company);
        const bAlpha = isAlphabet(b.company);
        if (!aAlpha && bAlpha) return -1;
        if (aAlpha && !bAlpha) return 1;
        return collator.compare(a.company, b.company);
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [cards, search, sortType]);

  const addCard = () => {
    if (!form.name || !form.company) return;

    setCards([
      {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...form,
      },
      ...cards,
    ]);

    setForm({
      name: "",
      company: "",
      position: "",
      officePhone: "",
      mobilePhone: "",
      email: "",
    });

    setShowForm(false);
  };

  const copyEmail = (email: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = email;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    setCopied(email);
    setTimeout(() => setCopied(""), 1500);
  };

  const deleteCard = () => {
    setCards(cards.filter((card) => card.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-bold text-slate-800">名刺管理</h1>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="名前・会社名で検索"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2"
            />

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2"
            >
              <option value="date">登録年月日</option>
              <option value="name">名前順</option>
              <option value="company">会社順</option>
            </select>
          </div>
        </header>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 rounded-xl bg-slate-800 px-5 py-3 text-white hover:bg-slate-700"
        >
          {showForm ? "追加フォームを閉じる" : "名刺を追加"}
        </button>

        {showForm && (
          <section className="mb-8 rounded-2xl bg-white p-6 shadow">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="名前"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl border border-slate-300 px-4 py-2"
              />

              <input
                placeholder="会社名"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="rounded-xl border border-slate-300 px-4 py-2"
              />

              <input
                placeholder="役職"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="rounded-xl border border-slate-300 px-4 py-2"
              />

              <input
                placeholder="会社電話番号"
                value={form.officePhone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    officePhone: formatPhone(e.target.value),
                  })
                }
                className="rounded-xl border border-slate-300 px-4 py-2"
              />

              <input
                placeholder="携帯電話番号"
                value={form.mobilePhone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mobilePhone: formatPhone(e.target.value),
                  })
                }
                className="rounded-xl border border-slate-300 px-4 py-2"
              />

              <input
                placeholder="メールアドレス"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-xl border border-slate-300 px-4 py-2"
              />
            </div>

            <button
              onClick={addCard}
              className="mt-4 rounded-xl bg-slate-800 px-5 py-3 text-white hover:bg-slate-700"
            >
              登録する
            </button>
          </section>
        )}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedCards.map((card) => (
            <div key={card.id} className="rounded-2xl bg-white p-6 shadow">
              <div className="mb-4 flex justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {card.name}
                  </h2>
                  <p className="mt-2 text-slate-600">{card.company}</p>
                  <p className="text-sm text-slate-500">
                    {card.position || "未設定"}
                  </p>
                </div>

                <button
                  onClick={() => setDeleteId(card.id)}
                  className="h-10 rounded-xl bg-black px-3 text-white hover:bg-slate-800"
                >
                  削除
                </button>
              </div>

              <div className="space-y-2 text-slate-700">
                <p>会社: {card.officePhone || "未登録"}</p>
                <p>携帯: {card.mobilePhone || "未登録"}</p>

                <div className="flex items-center justify-between gap-2">
                  <p>{card.email || "未登録"}</p>

                  {card.email && (
                    <button
                      onClick={() => copyEmail(card.email)}
                      className="rounded-lg bg-slate-200 px-3 py-1 text-sm hover:bg-slate-300"
                    >
                      コピー
                    </button>
                  )}
                </div>

                {copied === card.email && (
                  <p className="text-xs text-green-600">コピーしました</p>
                )}
              </div>
            </div>
          ))}
        </section>

        {sortedCards.length === 0 && (
          <p className="py-20 text-center text-slate-500">
            名刺データがありません
          </p>
        )}
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8">
            <h2 className="mb-4 text-2xl font-bold">削除確認</h2>
            <p className="mb-6">本当に削除しますか？</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl bg-slate-200 px-4 py-2 hover:bg-slate-300"
              >
                キャンセル
              </button>

              <button
                onClick={deleteCard}
                className="rounded-xl bg-black px-4 py-2 text-white hover:bg-slate-800"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}