import { IAnchorComponent } from "@iot-app-kit/scene-composer";
import { ExtraObjectWrapper } from "../objects/ExtraObjectWrapper";
import { Vector2, Raycaster } from "three/src/Three";

export type SearchTagsCallback = (
  ref: string,
  anchor: IAnchorComponent
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
}
