import { ExtraObjectWrapper } from "../objects/ExtraObjectWrapper";
import { Vector2, Raycaster } from "three/src/Three";
import { ReplaceTag } from "../controllers/TagController";

export type SearchTagsCallback = (
  replaceTag: ReplaceTag
) => ExtraObjectWrapper | undefined;

export type OverrideTagsParameter = { [key: string]: SearchTagsCallback };

export namespace SystemLoadingStatus {
  export const Init: string = "init";
  export const UndefinedState: string = "undefined";
}

export interface AnimationParameter {
  mouse: Vector2 | null;
  isSelect: boolean;
  raycaster: Raycaster;
  cameraState: string;
}
