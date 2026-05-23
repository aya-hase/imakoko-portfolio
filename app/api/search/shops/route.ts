import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Location =
  | { type: "text"; value: string }
  | { type: "geo"; lat: number; lng: number };

type Body = {
  location?: Location;
  genre?: string;
  budget?: string;
};

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// genre（英）→ HotPepper向けの日本語キーワードに寄せる
function mapGenreKeyword(genre?: string) {
  const g = (genre ?? "").trim().toLowerCase();
  if (!g) return "";
  if (g === "any") return "";
  if (g === "japanese") return "和食";
  if (g === "western") return "洋食";
  if (g === "chinese") return "中華";
  return genre ?? "";
}

// 予算ラベル → HotPepper budgetコード（ざっくり。必要なら後で調整）
function mapBudgetCode(budget?: string) {
  const b = (budget ?? "").trim();
  if (!b) return undefined;

  if (b === "0-1000") return "B009";
  if (b === "1000-3000") return "B010";
  if (b === "3000-5000") return "B011";
  if (b === "5000+") return "B012"; // 必要なければ消してOK

  return undefined;
}


function json(data: any, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  try {
    const key = mustEnv("HOTPEPPER_API_KEY");

    // ✅ 安全パース（壊れたJSONで500にしない）
    const raw = await req.text();
    let body: Body;
    try {
      body = JSON.parse(raw) as Body;
    } catch {
      return json({ ok: false, error: "Invalid JSON body", raw }, { status: 400 });
    }

    const loc = body.location;
    const genreKeyword = mapGenreKeyword(body.genre);
    const budgetCode = mapBudgetCode(body.budget);

    const params = new URLSearchParams({
      key,
      format: "json",
      count: "10",
    });

    if (loc && loc.type === "geo") {
      // 位置情報検索（緯度経度）
      params.set("lat", String(loc.lat));
      params.set("lng", String(loc.lng));
      params.set("range", "3"); // 1:300m 2:500m 3:1000m 4:2000m 5:3000m

      // geoのときは keyword にジャンル（日本語寄せ）だけ入れる
      if (genreKeyword) params.set("keyword", genreKeyword);
    } else {
      // 文字検索（駅名や地名）
      const keyword = loc && loc.type === "text" ? loc.value.trim() : "";
      const merged = [keyword || "名古屋駅", genreKeyword].filter(Boolean).join(" ");
      params.set("keyword", merged);
    }

    //if (budgetCode) params.set("budget", budgetCode);

    const url = `https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?${params.toString()}`;
    console.log("[hotpepper url]", url);

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const t = await res.text();
      return json(
        { ok: false, error: `HotPepper error: ${res.status}`, detail: t },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawShops = data?.results?.shop ?? [];

    const shops = rawShops.map((s: any) => ({
      id: s.id,
      name: s.name,
      url: s.urls?.pc ?? "",
      access: s.access ?? "",
      photo: s.photo?.pc?.l ?? s.photo?.pc?.m ?? "",
      budget: s.budget?.name ?? "",
      genre: s.genre?.name ?? "",
    }));

    return json({ ok: true, count: shops.length, shops });
  } catch (e: any) {
    return json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}
