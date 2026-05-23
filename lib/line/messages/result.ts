// shopBubble定義
const shopBubble = (
  name: string,
  area: string,
  price: string, // 表示用（例: "平均 2,000円"）
  url: string,
  photoUrl?: string, // HotPepperの画像URL（あれば）
) => ({
  type: "bubble",
  ...(photoUrl && {
    // heroブロック（HotPepperの画像URL）
    hero: {
      type: "image",
      url: photoUrl,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    },
  }),
  //bodyブロック
  body: {
    type: "box",
    layout: "vertical",
    spacing: "md",
    contents: [
      // 店名（太文字）
      {
        type: "text",
        text: name,
        weight: "bold",
        size: "md",
        wrap: true,
      },
      //   場所説明
      {
        type: "text",
        text: `📍 ${area}`,
        size: "sm",
        color: "#555555",
        wrap: true,
      },
      //   金額説明
      {
        type: "text",
        text: price ? `💰 ${price}` : "💰 価格情報なし",
        size: "sm",
        color: "#555555",
      },
    ],
  },
  //   footerブロック
  footer: {
    type: "box",
    layout: "vertical",
    spacing: "sm",
    contents: [
      {
        type: "button",
        style: "primary",
        action: {
          type: "uri",
          label: "お店の詳細を見る",
          uri: url,
        },
      },
    ],
  },
});
// 定型文
export const fixedIntroText = {
  type: "text",
  text: "✨ ご希望をもとにおすすめします！",
};

// AI生成文　FIXME：要修正？
export const aiSelectionPointText = (text: string) => ({
  type: "text",
  text,
  size: "sm",
  wrap: true,
});

// カルーセル部分
export const buildResultCarousel = (shops: any[]) => ({
  type: "flex",
  altText: "おすすめのお店",
  contents: {
    type: "carousel",
    contents: shops
      .slice(0, 3)
      .map((s) =>
        shopBubble(
          s.name,
          s.access,
          s.budget || "予算情報なし",
          s.url,
          s.photo,
        ),
      ),
  },
});

// ----------------
// image（仮）
// ----------------
// ✨ ご希望をもとにおすすめします
// openAI API(LLM)による文章

// ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
// │ [ 写真 ]       │  │ [ 写真 ]       │  │               │
// │ Bistro Nagoya │  │ Italian Cafe  │  │ French Dining │
// │ 📍 名駅5分     │  │ 📍 栄3分       │  │ 📍 伏見6分      │
// │ 💰 平均2000円  │  │ 💰 平均3000円   │  │ 💰 平均4000円  │
// │ [詳細を見る]    │  │ [詳細を見る]    │  │ [詳細を見る]   │
// └───────────────┘  └───────────────┘  └───────────────┘
