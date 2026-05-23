// 場所を聞く
const askLocation = {
  type: "text",
  text: "📍どちらでお探しですか？\n\n地図から場所を選んでください👇",
  quickReply: {
    items: [
      {
        type: "action",
        action: {
          type: "location",
          label: "📍 場所を選ぶ",
        },
      },
    ],
  },
};

export default askLocation;

// ----------------
// image
// ----------------

// 📍どちらでお探しですか？

// 地図から場所を選んでください👇

// [ 📍 場所を選ぶ ]
