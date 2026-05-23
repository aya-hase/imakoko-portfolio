// 予算を聞く
const askPrice = {
  type: "flex",
  altText: "予算はどれぐらいですか？",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "💰 予算はどれぐらいですか？",
          weight: "bold",
          size: "lg",
          wrap: true,
        },

        {
          type: "text",
          text: "だいたいの目安で大丈夫です",
          size: "sm",
          color: "#888888",
          wrap: true,
        },

        {
          type: "button",
          action: {
            type: "postback",
            label: "〜1,000円",
            data: JSON.stringify({
              action: "set",
              step: "budget",
              value: "0-1000",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "1,000〜3,000円",
            data: JSON.stringify({
              action: "set",
              step: "budget",
              value: "1000-3000",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "3,000〜5,000円",
            data: JSON.stringify({
              action: "set",
              step: "budget",
              value: "3000-5000",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "5,000円〜",
            data: JSON.stringify({
              action: "set",
              step: "budget",
              value: "5000+",
            }),
          },
        },
        {
          type: "button",
          action: {
            type: "postback",
            // FIXME: 前回履歴がある場合は
            // label: 前回と同じにする（${lastBudgetLabel}） に差し替え想定
            label: "前回と同じにする",
            data: JSON.stringify({
              action: "previous",
              step: "budget",
            }),
          },
        },
      ],
    },
  },
};

export default askPrice;

// ----------------
// image
// ----------------

// ┌────────────────────────┐
// │ 💰 予算はどれぐらいですか？ │  ← 太字・大きめ
// │                        │
// │ [ 〜1,000円 ]           │
// │ [ 1,000〜3,000円 ]     │
// │ [ 3,000〜5,000円 ]     │
// │ [ 5,000円〜 ]           │
// │ [ 前回と同じにする ()]    │
// └────────────────────────┘
