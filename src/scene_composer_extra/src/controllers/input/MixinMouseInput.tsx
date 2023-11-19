import { Raycaster, Vector2 } from "three/src/Three";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";
import { HTMLModelWrapper } from "../../objects/html/HTMLModelWrapper";
import { Constructor } from "../../mixin/MixinBase";

// イベント名を定義する
const EVENT_POINTER_MOVE = "pointermove";
const EVENT_POINTER_DOWN = "pointerdown";
const EVENT_POINTER_UP = "pointerup";
const EVENT_TOUCH_START = "touchstart";
const EVENT_TOUCH_END = "touchend";

/** マウス操作イベントを入力する */
export interface MouseInputEvent {
  active: boolean;
  mouse: Vector2 | null;
}

/** マウス操作結果を返却する */
export interface MouseResultEvent {
  mouse: Vector2 | null;
  isSelect: boolean;
  raycaster: Raycaster;
}

/**
 * マウスイベント
 */
class MouseEvent {
  // 操作の開始
  start: MouseInputEvent;
  // ドラッグ中
  move: MouseInputEvent;
  // ドラッグの終了
  moveEnd: MouseInputEvent;
  // 操作の終了
  end: MouseInputEvent;
  // フラグ
  pressing: boolean = false;
  // レイキャスト
  _raycaster: Raycaster;

  constructor() {
    // レイキャストの初期化
    this._raycaster = new Raycaster();
    // 押下中フラグの初期化
    this.pressing = false;
    // 各イベントの初期化
    this.start = {
      active: false,
      mouse: null,
    };
    this.move = {
      active: false,
      mouse: null,
    };
    this.moveEnd = {
      active: false,
      mouse: null,
    };
    this.end = {
      active: false,
      mouse: null,
    };
  }

  /**
   * 次のマウスイベントを読み取る
   */
  get currentEvent(): MouseResultEvent {
    // 開始時操作を返却する
    if (this.start.active) {
      return {
        mouse: this.start.mouse,
        isSelect: true,
        raycaster: this._raycaster,
      };
    }
    // ドラッグ終了時操作を返却する
    if (this.moveEnd.active) {
      return {
        mouse: this.moveEnd.mouse,
        isSelect: true,
        raycaster: this._raycaster,
      };
    }
    // 終了時操作を返却する
    if (this.end.active) {
      return {
        mouse: this.end.mouse,
        isSelect: false,
        raycaster: this._raycaster,
      };
    }
    // ポインタ移動時の操作を返却する
    return {
      mouse: this.move.mouse,
      isSelect: this.move.active,
      raycaster: this._raycaster,
    };
  }

  /**
   * ループ終了時に実行
   * このループのマウスイベントの読み取り処理の終了を宣言する
   */
  next() {
    // 開始時操作が登録されていれば、開始時操作を解除する
    if (this.start.active) {
      this.start = {
        active: false,
        mouse: null,
      };
      return;
    }
    // 終了時操作が登録されていれば、終了時操作を解除する
    if (this.moveEnd.active) {
      this.moveEnd = {
        active: false,
        mouse: null,
      };
      return;
    }
    // 終了時操作が登録されていれば、終了時操作を解除する
    if (this.end.active) {
      this.end = {
        active: false,
        mouse: null,
      };
      return;
    }
  }

  /**
   * マウスの操作イベントを登録する
   */
  putEvent(
    eventName: string,
    windowWidth: number,
    windowHeight: number,
    x?: number,
    y?: number
  ) {
    // マウスの座標をThree.js上の座標に変換する
    const mouseX = ((x ?? 0) / windowWidth) * 2 - 1;
    const mouseY = -((y ?? 0) / windowHeight) * 2 + 1;

    // マウス操作
    if (eventName === EVENT_POINTER_DOWN) {
      // 押下開始を設定する
      this.pressing = true;
      // 開始時操作を登録する
      this.start.active = true;
      this.start.mouse = new Vector2(mouseX, mouseY);
    }
    if (eventName === EVENT_POINTER_UP) {
      // 押下終了を設定する
      this.pressing = false;
      // ドラッグ終了時操作を登録する
      this.moveEnd.active = true;
      this.moveEnd.mouse = new Vector2(
        this.move.mouse?.x ?? 0,
        this.move.mouse?.y ?? 0
      );
      // 終了時操作を登録する
      this.end.active = true;
      this.end.mouse = new Vector2(
        this.move.mouse?.x ?? 0,
        this.move.mouse?.y ?? 0
      );
    }
    // タッチ操作
    if (eventName === EVENT_TOUCH_START) {
      // 押下開始を設定する
      this.pressing = true;
      // 開始時操作を登録する
      this.start.active = true;
      this.start.mouse = new Vector2(mouseX, mouseY);
    }
    if (eventName === EVENT_TOUCH_END) {
      // 押下終了を設定する
      this.pressing = false;
      // ドラッグ終了時操作を登録する
      this.moveEnd.active = true;
      this.moveEnd.mouse = new Vector2(
        this.move.mouse?.x ?? 0,
        this.move.mouse?.y ?? 0
      );
      // 終了時操作を登録する
      this.end.active = true;
      this.end.mouse = new Vector2(
        this.move.mouse?.x ?? 0,
        this.move.mouse?.y ?? 0
      );
    }

    // マウスの移動に反映する(全イベントで共通)
    // nullを入れたときに参照全体が消されるため、
    // Vectorの変数はマウスイベントごとに確保する
    this.move.active = this.pressing;
    if (x !== undefined && y !== undefined) {
      this.move.mouse = new Vector2(mouseX, mouseY);
    }
  }
}

export function MixinMouseInput<TBase extends Constructor>(Base: TBase) {
  return class MouseInput extends Base {
    // ハードプライベートな変数を確保する
    // マウスクリック位置
    #_mouseEvent?: MouseEvent;
    // ウィンドウの幅と高さ
    #_windowWidth: number = 0;
    #_windowHeight: number = 0;
    #_windowTop: number = 0;
    #_windowLeft: number = 0;
    // CSS3DRenderer
    #_css3DRenderer?: CSS3DRenderer;

    /** Mixinを初期化する */
    initiate() {
      this.#_mouseEvent = new MouseEvent();
      this.#_windowWidth = window.innerWidth;
      this.#_windowHeight = window.innerHeight;
      this.#_windowTop = 0;
      this.#_windowLeft = 0;
      this.#_css3DRenderer = new CSS3DRenderer();
    }

    /** クリックさせるベースのエレメントを取得する */
    #baseElement(): HTMLCanvasElement | undefined {
      const canvasList = document.querySelectorAll("canvas");
      for (const index in canvasList) {
        const item = canvasList[index];
        if (item.dataset.engine && item.dataset.engine.startsWith("three.js")) {
          return item;
        }
      }
      return undefined;
    }

    /** 画面サイズの登録、画面サイズ変更イベントの受け取りを設定する */
    setupCanvas() {
      // レンダラを取得する
      const css3dRendrer = this.#_css3DRenderer ?? new CSS3DRenderer();
      this.#_css3DRenderer = css3dRendrer;
      // 3Dキャンバスの表示位置を参照する
      const item = this.#baseElement();
      if (item === undefined) {
        // ベースエレメントが取得できないのならそのまま返却する
        return HTMLModelWrapper.initiate(
          css3dRendrer,
          window.innerWidth,
          window.innerHeight,
          0,
          0
        );
      }
      // 画面サイズを取得する
      const rect = item.getBoundingClientRect();
      const top = rect.top;
      const left = rect.left;
      const width = rect.width;
      const height = rect.height;
      // リサイズを監視する
      const observer = new ResizeObserver((_) => {
        // リサイズ後の画面サイズを再取得する
        const contentRect = item.getBoundingClientRect();
        this.#_windowTop = contentRect.top;
        this.#_windowLeft = contentRect.left;
        this.#_windowWidth = contentRect.width;
        this.#_windowHeight = contentRect.height;
        HTMLModelWrapper.updateSize(
          css3dRendrer,
          contentRect.width,
          contentRect.height,
          contentRect.top,
          contentRect.left
        );
      });
      observer.observe(item);
      this.#_windowTop = top;
      this.#_windowLeft = left;
      this.#_windowWidth = width;
      this.#_windowHeight = height;
      // CSS3 HTMLのレンダラを参照する
      return HTMLModelWrapper.initiate(css3dRendrer, width, height, top, left);
    }

    /**
     * イベントの読み取りを実行する
     */
    get currentEvent(): MouseResultEvent {
      return (
        this.#_mouseEvent?.currentEvent ?? {
          mouse: null,
          isSelect: false,
          raycaster: new Raycaster(),
        }
      );
    }

    /**
     * ループ終了時に実行
     * このループのマウスイベントの読み取り処理の終了を宣言する
     */
    next() {
      this.#_mouseEvent?.next();
    }

    /**
     * ポインターイベントを登録する
     */
    setupPointerEvent() {
      // マウス移動時の処理
      window.addEventListener(EVENT_POINTER_MOVE, (event) => {
        const x = event.clientX - this.#_windowLeft;
        const y = event.clientY - this.#_windowTop;
        this.#_mouseEvent?.putEvent(
          EVENT_POINTER_MOVE,
          this.#_windowWidth,
          this.#_windowHeight,
          x,
          y
        );
      });
      // マウスクリック開始の処理
      window.addEventListener(EVENT_POINTER_DOWN, (event) => {
        const x = event.clientX - this.#_windowLeft;
        const y = event.clientY - this.#_windowTop;
        this.#_mouseEvent?.putEvent(
          EVENT_POINTER_DOWN,
          this.#_windowWidth,
          this.#_windowHeight,
          x,
          y
        );
      });
      // マウスクリック終了の処理
      window.addEventListener(EVENT_POINTER_UP, () => {
        this.#_mouseEvent?.putEvent(
          EVENT_POINTER_UP,
          this.#_windowWidth,
          this.#_windowHeight
        );
      });
      // タッチ開始の処理
      window.addEventListener(EVENT_TOUCH_START, (event) => {
        if (event.touches && event.touches.length >= 1) {
          const x = event.touches[0].clientX - this.#_windowLeft;
          const y = event.touches[0].clientY - this.#_windowTop;
          this.#_mouseEvent?.putEvent(
            EVENT_TOUCH_START,
            this.#_windowWidth,
            this.#_windowHeight,
            x,
            y
          );
        }
      });
      // タッチ終了の処理
      window.addEventListener(EVENT_TOUCH_END, () => {
        this.#_mouseEvent?.putEvent(
          EVENT_TOUCH_END,
          this.#_windowWidth,
          this.#_windowHeight
        );
      });
    }
  };
}
