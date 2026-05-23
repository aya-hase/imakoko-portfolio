// 通信エラー・想定外エラー時の Flex Message
const errorFlex = {
  type: "flex",
  altText: "エラーが発生しました",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "⚠️ エラーが発生しました",
          weight: "bold",
          size: "md",
          wrap: true,
        },
        {
          type: "text",
          text: "通信の問題が起きた可能性があります。\nもう一度試すか、最初からやり直してください。",
          size: "sm",
          color: "#666666",
          wrap: true,
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "primary",
          action: {
            type: "postback",
            label: "もう一度試す",
            data: JSON.stringify({
              action: "retry",
            }),
          },
        },
        {
          type: "button",
          style: "secondary",
          action: {
            type: "postback",
            label: "最初からやり直す",
            data: JSON.stringify({
              action: "reset",
            }),
          },
        },
      ],
    },
  },
};

export default errorFlex;
