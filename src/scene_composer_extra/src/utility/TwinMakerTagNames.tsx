import { DefaultAnchorStatus } from "@iot-app-kit/scene-composer";

/**
 * ステータス文字列をDefaultAnchorStatusに変換して返す
 * @param tagName TwinMakerから受け取ったステータス文字列
 * @returns DefaultAnchorStatusの定数
 */
export function stringToDefaultAnchorStatus(tagName: string | number) {
  // TwinMakerから受け取る値にはプレフィックスがあるため、それを頭につける
  const prefix = "iottwinmaker.common.icon";
  const icons = [
    DefaultAnchorStatus.Error,
    DefaultAnchorStatus.Info,
    DefaultAnchorStatus.Video,
    DefaultAnchorStatus.Warning,
  ];
  // 一致するアイコンを参照する
  const acceptIcon = icons.filter((icon) => tagName === `${prefix}:${icon}`);
  if (acceptIcon.length >= 1) {
    return acceptIcon[0];
  }
  // 一致するアイコンがなければInfoを返す
  return DefaultAnchorStatus.Info;
}
