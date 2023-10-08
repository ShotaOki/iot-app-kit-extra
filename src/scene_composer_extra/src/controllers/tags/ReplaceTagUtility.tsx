import { ModelParameterBase } from "../../objects/ExtraObjectWrapper";
import { GroupWrapper } from "../../objects/group/GroupWrapper";
import { MeshUiButtonParameter } from "../../objects/three-mesh-ui/MeshUiButtonWrapper";
import { SearchTagsCallback } from "../../types/DataType";
import { ReplaceTagPluginConstructor } from "./ReplaceTagBase";

// タグ名を定義する
const TAG_NAME_CONTENTS = "Contents";
const TAG_NAME_BUTTON = "Button";
// アニメーションの実行時間を定義する
const DEFAULT_ANIMATION_DURATION = 0.4;

/**
 * 対象のクラスにアニメーションを設定するMixin
 */
export function ReplaceTagUtility<TBase extends ReplaceTagPluginConstructor>(
  Base: TBase
) {
  return class UtilityTags extends Base {
    /**
     * ボタン押下で表示と非表示を切り替えられるコンテンツを、タグと置き換える
     */
    withSwitchGroup(parameter: {
      group?: ModelParameterBase;
      button: MeshUiButtonParameter;
      contents: SearchTagsCallback;
      animationDuration?: number;
    }) {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        // グループを作成する
        const group = new GroupWrapper(this.parameter(tag))
          .create({
            ...(parameter.group ?? {}),
            children: {
              [TAG_NAME_BUTTON]: (replace) =>
                replace.toButton?.create(parameter.button).onClickEvent(() => {
                  // イベント: クリックを受けとった
                  if (
                    !group.isShow(TAG_NAME_CONTENTS) &&
                    !group.isScaleAnimating
                  ) {
                    // コンテンツ非表示、かつアニメーション実施中でないのなら
                    // コンテンツを表示する
                    group.startScaleAnimation(() => {
                      group.showSingleChild(TAG_NAME_CONTENTS);
                    }, parameter.animationDuration ?? DEFAULT_ANIMATION_DURATION);
                  }
                }),
              [TAG_NAME_CONTENTS]: parameter.contents,
            },
          })
          .onMoveCamera(() => {
            // イベント: カメラの移動を受け取った
            // ボタン非表示、かつアニメーション実施中でないのなら、
            // ボタンの表示中に戻す
            if (!group.isShow(TAG_NAME_BUTTON) && !group.isScaleAnimating) {
              group.startScaleAnimation(() => {
                group.showSingleChild(TAG_NAME_BUTTON);
              }, parameter.animationDuration ?? DEFAULT_ANIMATION_DURATION);
            }
          });
        // 初期設定: ボタンを表示中にする
        group.showSingleChild(TAG_NAME_BUTTON);
        return group;
      }
      return undefined;
    }
  };
}
