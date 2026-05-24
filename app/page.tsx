"use client";

import { useEffect, useMemo, useState } from "react";

type BusinessCard = {
  id: number;
  name: string;
  kana: string;
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
    kana: "やまだ たろう",
    company: "Green Tech株式会社",
    position: "営業部長",
    officePhone: "06-1234-5678",
    mobilePhone: "090-1234-5678",
    email: "yamada@example.com",
    createdAt: "2026-05-24",
  },
  {
    id: 2,
    name: "佐藤 花子",
    kana: "さとう はなこ",
    company: "アオイ商事",
    position: "デザイナー",
    officePhone: "03-1111-2222",
    mobilePhone: "080-1111-2222",
    email: "sato@example.com",
    createdAt: "2026-05-23",
  },
  {
    id: 3,
    name: "John Smith",
    kana: "john smith",
    company: "Future Design",
    position: "Manager",
    officePhone: "052-333-4444",
    mobilePhone: "070-3333-4444",
    email: "john@example.com",
    createdAt: "2026-05-22",
  },
];

const guessKana = (name: string) => {
  const map: Record<string, string> = {
    "山田 太郎": "やまだ たろう",
    "佐藤 花子": "さとう はなこ",
    "鈴木 一郎": "すずき いちろう",
    "高橋 美咲": "たかはし みさき",
    "中村 健太": "なかむら けんた",
  };

  return map[name] || name;
};

export default function Page() {
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("date");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [copied, setCopied] = useState("");

  const [form, setForm] = useState({
    name: "",
    kana: "",
    company: "",
    position: "",
    officePhone: "",
    mobilePhone: "",
    email: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("business-cards");

    if (!saved) {
      setCards(defaultCards);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      const fixed = parsed.map((card: Partial<BusinessCard>) => ({
        id: card.id || Date.now(),
        name: card.name || "",
        kana: card.kana || guessKana(card.name || ""),
        company: card.company || "",
        position: card.position || "",
        officePhone: card.officePhone || "",
        mobilePhone: card.mobilePhone || "",
        email: card.email || "",
        createdAt: card.createdAt || new Date().toISOString(),
      }));

      setCards(fixed);
    } catch {
      setCards(defaultCards);
    }
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

  const normalizeKana = (text: string) => {
    return text
      .normalize("NFKC")
      .replace(/\s/g, "")
      .replace(/[ァ-ン]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0x60)
      )
      .toLowerCase();
  };

  const isJapanese = (text: string) => {
    return /[ぁ-んァ-ヶ一-龯]/.test(text);
  };

  const sortedCards = useMemo(() => {
    const result = cards.filter((card) => {
      const text = `${card.name} ${card.kana} ${card.company} ${card.position} ${card.officePhone} ${card.mobilePhone} ${card.email}`;
      return text.toLowerCase().includes(search.toLowerCase());
    });

    const collator = new Intl.Collator("ja", {
      numeric: true,
      sensitivity: "base",
    });

    return [...result].sort((a, b) => {
      if (sortType === "name") {
        const aKana = normalizeKana(a.kana || a.name);
        const bKana = normalizeKana(b.kana || b.name);

        const aJapanese = isJapanese(aKana);
        const bJapanese = isJapanese(bKana);

        if (aJapanese && !bJapanese) return -1;
        if (!aJapanese && bJapanese) return 1;

        return collator.compare(aKana, bKana);
      }

      if (sortType === "company") {
        const aCompany = normalizeKana(a.company);
        const bCompany = normalizeKana(b.company);

        const aJapanese = isJapanese(aCompany);
        const bJapanese = isJapanese(bCompany);

        if (aJapanese && !bJapanese) return -1;
        if (!aJapanese && bJapanese) return 1;

        return collator.compare(aCompany, bCompany);
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [cards, search, sortType]);

  const addCard = () => {
    if (!form.name || !form.company) return;

    const newCard: BusinessCard = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      name: form.name,
      kana: form.kana || guessKana(form.name),
      company: form.company,
      position: form.position,
      officePhone: form.officePhone,
      mobilePhone: form.mobilePhone,
      email: form.email,
    };

    setCards([newCard, ...cards]);

    setForm({
      name: "",
      kana: "",
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
    <main className="min-h-screen bg-slate-100 px-4 py-5 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
              名刺管理
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              名刺を登録・検索・整理できます
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="名前・会社名で検索"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-slate-500 lg:w-72"
            />

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none focus:border-slate-500 lg:w-44"
            >
              <option value="date">登録年月日</option>
              <option value="name">名前順</option>
              <option value="company">会社順</option>
            </select>
          </div>
        </header>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-5 h-12 w-full rounded-xl bg-slate-800 px-5 text-base font-bold text-white hover:bg-slate-700 sm:mb-6 sm:w-auto"
        >
          {showForm ? "追加フォームを閉じる" : "名刺を追加"}
        </button>

        {showForm && (
          <section className="mb-6 rounded-2xl bg-white p-4 shadow sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="名前"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-12 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-slate-500"
              />

              <input
                placeholder="ふりがな（50音順用・表示されません）"
                value={form.kana}
                onChange={(e) => setForm({ ...form, kana: e.target.value })}
                className="h-12 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-slate-500"
              />

              <input
                placeholder="会社名"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="h-12 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-slate-500"
              />

              <input
                placeholder="役職"
                value={form.position}
                onChange={(e) =>
                  setForm({ ...form, position: e.target.value })
                }
                className="h-12 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-slate-500"
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
                className="h-12 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-slate-500"
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
                className="h-12 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-slate-500"
              />

              <input
                placeholder="メールアドレス"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 rounded-xl border border-slate-300 px-4 text-base outline-none focus:border-slate-500 md:col-span-2"
              />
            </div>

            <button
              onClick={addCard}
              className="mt-4 h-12 w-full rounded-xl bg-slate-800 px-5 text-base font-bold text-white hover:bg-slate-700 sm:w-auto"
            >
              登録する
            </button>
          </section>
        )}

        <section className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedCards.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl bg-white p-5 shadow sm:p-6"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-bold text-slate-800">
                    {card.name}
                  </h2>

                  <p className="mt-2 break-words text-slate-600">
                    {card.company}
                  </p>

                  <p className="text-sm text-slate-500">
                    {card.position || "未設定"}
                  </p>
                </div>

                <button
                  onClick={() => setDeleteId(card.id)}
                  className="shrink-0 rounded-xl bg-black px-3 py-2 text-sm text-white hover:bg-slate-800"
                >
                  削除
                </button>
              </div>

              <div className="space-y-3 text-base text-slate-700">
                <p>会社: {card.officePhone || "未登録"}</p>
                <p>携帯: {card.mobilePhone || "未登録"}</p>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="break-all">{card.email || "未登録"}</p>

                  {card.email && (
                    <button
                      onClick={() => copyEmail(card.email)}
                      className="h-10 rounded-lg bg-slate-200 px-4 text-sm hover:bg-slate-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
            <h2 className="mb-4 text-2xl font-bold text-slate-800">
              削除確認
            </h2>

            <p className="mb-6 text-slate-600">本当に削除しますか？</p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="h-11 rounded-xl bg-slate-200 px-4 hover:bg-slate-300"
              >
                キャンセル
              </button>

              <button
                onClick={deleteCard}
                className="h-11 rounded-xl bg-black px-4 text-white hover:bg-slate-800"
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