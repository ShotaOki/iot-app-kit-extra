function isPointerEvent(object: any): object is PointerEvent {
  return "clientX" in object && "clientY" in object;
}
function isTouchEvent(object: any): object is TouchEvent {
  return "touches" in object && object.touches.length >= 1;
}

/**
 * 他のライブラリのマウスイベントを抑制する
 */
export class MouseEventInterceptor {
  private _rootTagName: string;
  private _eventNameList: string[];
  private _windowLeft: number;
  private _windowTop: number;
  private _windowWidth: number;
  private _windowHeight: number;
  private _enablePropagation: boolean;
  private _onCheckIntercept: (
    x: number,
    y: number,
    enablePropagation: boolean
  ) => boolean;
  private _checkIntercept: (e: Event) => void;
  constructor(rootTagName: string) {
    this._rootTagName = rootTagName;
    this._eventNameList = ["click", "mousedown", "pointerdown", "touchstart"];
    this._windowLeft = 0;
    this._windowTop = 0;
    this._windowWidth = 1;
    this._windowHeight = 1;
    this._enablePropagation = true;
    //@ts-ignore
    this._onCheckIntercept = (x, y, enablePropagation) => {
      return !enablePropagation;
    };
    // オブジェクトとの衝突判定をする
    this._checkIntercept = (e: Event) => {
      if (this._onCheckIntercept) {
        let clientX: number | undefined = undefined;
        let clientY: number | undefined = undefined;
        if (isPointerEvent(e)) {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        if (isTouchEvent(e)) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        }
        if (clientX !== undefined && clientY !== undefined) {
          const x = clientX - this._windowLeft;
          const y = clientY - this._windowTop;
          const mouseX = ((x ?? 0) / this._windowWidth) * 2 - 1;
          const mouseY = -((y ?? 0) / this._windowHeight) * 2 + 1;
          if (this._onCheckIntercept(mouseX, mouseY, this._enablePropagation)) {
            e.stopPropagation();
          }
        }
      }
    };
    this.awake();
  }

  setEnablePropagation(enablePropagation: boolean) {
    this._enablePropagation = enablePropagation;
  }

  onCheckIntercept(
    callback: (x: number, y: number, enablePropagation: boolean) => boolean
  ) {
    this._onCheckIntercept = callback;
  }

  sync(position: { left: number; top: number; width: number; height: number }) {
    this._windowLeft = position.left;
    this._windowTop = position.top;
    this._windowWidth = position.width;
    this._windowHeight = position.height;
  }

  awake() {
    try {
      const innerDocument = document.querySelector(this._rootTagName);
      this._eventNameList.forEach((targetName) => {
        innerDocument?.addEventListener(targetName, this._checkIntercept, true);
      });
    } catch {}
  }

  remove() {
    try {
      const innerDocument = document.querySelector(this._rootTagName);
      this._eventNameList.forEach((targetName) => {
        innerDocument?.removeEventListener(
          targetName,
          this._checkIntercept,
          true
        );
      });
    } catch {}
  }
}
