import { Constructor } from "./MixinBase";

/**
 * 常にこちら側に3Dオブジェクトを向けるMixin
 */
export function MixinBillboard<TBase extends Constructor>(Base: TBase) {
  return class Billboard extends Base {};
}
