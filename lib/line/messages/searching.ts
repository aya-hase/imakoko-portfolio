// 検索中Flex
const searchingFlex = {
  type: "flex",
  altText: "お店を探しています…",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "🔍 お店を探しています…",
          weight: "bold",
          size: "md",
          wrap: true,
        },
        {
          type: "text",
          text: "少々お待ちください",
          size: "sm",
          color: "#888888",
          wrap: true,
        },
      ],
    },
  },
};

export default searchingFlex;
