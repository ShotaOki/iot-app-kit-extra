import { Color } from "three/src/Three";

export namespace ButtonStyle {
  /** 無彩色のボタンスタイル */
  export const Standard = {
    hovered: {
      backgroundColor: new Color(0x999999),
      fontColor: new Color(0xffffff),
    },
    idle: {
      backgroundColor: new Color(0x666666),
      fontColor: new Color(0xffffff),
    },
    selected: {
      backgroundColor: new Color(0x777777),
      fontColor: new Color(0x222222),
    },
  };
}
