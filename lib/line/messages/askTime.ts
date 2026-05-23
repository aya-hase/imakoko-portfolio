// いつ行くか聞く
const askTime = {
  type: "flex",
  altText: "いつ行く予定ですか？",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "⏰ いつ行く予定ですか？",
          weight: "bold",
          size: "lg",
          wrap: true,
        },
        {
          type: "text",
          text: "利用シーンに近いものを選んでください",
          size: "sm",
          color: "#888888",
          wrap: true,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "モーニング",
            data: JSON.stringify({
              action: "set",
              step: "time",
              value: "morning",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "ランチ",
            data: JSON.stringify({
              action: "set",
              step: "time",
              value: "lunch",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "カフェ",
            data: JSON.stringify({
              action: "set",
              step: "time",
              value: "cafe",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "ディナー",
            data: JSON.stringify({
              action: "set",
              step: "time",
              value: "dinner",
            }),
          },
        },
      ],
    },
  },
};

export default askTime;

// ----------------
// image
// ----------------

// ┌────────────────────────┐
// │ ⏰ いつ行く予定ですか？ │  ← 太字・大きめ
// │                        │
// │ [ モーニング ]          │
// │ [ ランチ ]              │
// │ [ カフェ ]              │
// │ [ ディナー ]            │
// └────────────────────────┘
