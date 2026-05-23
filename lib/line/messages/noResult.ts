// 検索結果が0件だったときの Flex
const noResultFlex = {
  type: "flex",
  altText: "お店が見つかりませんでした",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: "😢 お店が見つかりませんでした",
          weight: "bold",
          size: "md",
          wrap: true,
        },
        {
          type: "text",
          text: "同じ条件でもう一度探すか、\n最初から条件を選び直せます",
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
            label: "もう一度探す",
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

export default noResultFlex;
