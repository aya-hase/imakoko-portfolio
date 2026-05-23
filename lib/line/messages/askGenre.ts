// ジャンルを聞く
const askGenre = {
  type: "flex",
  altText: "どんな料理がいいですか？",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "🍚 どんな料理がいいですか？",
          weight: "bold",
          size: "lg",
          wrap: true,
        },
        {
          type: "text",
          text: "今の気分に近いものを選んでください",
          size: "sm",
          color: "#888888",
          wrap: true,
        },

        {
          type: "button",
          action: {
            type: "postback",
            label: "和食",
            data: JSON.stringify({
              action: "set",
              step: "genre",
              value: "japanese",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "洋食",
            data: JSON.stringify({
              action: "set",
              step: "genre",
              value: "western",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "中華",
            data: JSON.stringify({
              action: "set",
              step: "genre",
              value: "chinese",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "どれでもいい",
            data: JSON.stringify({
              action: "set",
              step: "genre",
              value: "any",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            // FIXME: 前回履歴がある場合は
            // label: 前回と同じにする（${lastGenreLabel}） に差し替え想定
            label: "前回と同じにする",
            data: JSON.stringify({
              action: "set",
              step: "genre",
              value: "previous",
            }),
          },
        },
      ],
    },
  },
};

export default askGenre;

// ----------------
// image
// ----------------

// ┌────────────────────────┐
// │ 🍚 どんな料理がいいですか？ │  ← 太字・大きめ
// │                        │
// │ [ 和食 ]               │
// │ [ 洋食 ]               │
// │ [ 中華 ]               │
// │ [ どれでもいい ]        │
// │ [ 前回と同じにする ()]    │
// └────────────────────────┘
