"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToDefaultAnchorStatus = void 0;
const scene_composer_1 = require("@iot-app-kit/scene-composer");
/**
 * ステータス文字列をDefaultAnchorStatusに変換して返す
 * @param tagName TwinMakerから受け取ったステータス文字列
 * @returns DefaultAnchorStatusの定数
 */
function stringToDefaultAnchorStatus(tagName) {
    // TwinMakerから受け取る値にはプレフィックスがあるため、それを頭につける
    const prefix = "iottwinmaker.common.icon";
    const icons = [
        scene_composer_1.DefaultAnchorStatus.Error,
        scene_composer_1.DefaultAnchorStatus.Info,
        scene_composer_1.DefaultAnchorStatus.Video,
        scene_composer_1.DefaultAnchorStatus.Warning,
    ];
    // 一致するアイコンを参照する
    const acceptIcon = icons.filter((icon) => tagName === `${prefix}:${icon}`);
    if (acceptIcon.length >= 1) {
        return acceptIcon[0];
    }
    // 一致するアイコンがなければInfoを返す
    return scene_composer_1.DefaultAnchorStatus.Info;
}
exports.stringToDefaultAnchorStatus = stringToDefaultAnchorStatus;
//# sourceMappingURL=TwinMakerTagNames.js.map