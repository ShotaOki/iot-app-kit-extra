import { DefaultAnchorStatus } from "@iot-app-kit/scene-composer";
/**
 * ステータス文字列をDefaultAnchorStatusに変換して返す
 * @param tagName TwinMakerから受け取ったステータス文字列
 * @returns DefaultAnchorStatusの定数
 */
export declare function stringToDefaultAnchorStatus(tagName: string | number): DefaultAnchorStatus;
