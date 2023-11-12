import { Constructor } from "./MixinBase";

/** 読み込み完了状態の保持クラス */
class LoadObserverObject {
  // 読み込み完了フラグ
  public loadedParameter: string[];
  // 読み込みが必要なパラメータの一覧
  public requiredParameter: string[];
  // onload関数の完了済みフラグ
  public isOnLoadCalled: boolean;

  constructor(requiredParameters: string[]) {
    this.loadedParameter = [];
    this.requiredParameter = requiredParameters;
    this.isOnLoadCalled = false;
  }
}

// 外部に公開するMixinの関数
export interface LoadObserverMixinInterface {
  _loadObserverAwake(): void;
  progressObserver(key: string): void;
  sendMessageToLoadObserver(key: string): void;
}

// Mixinの継承判定
export function isLoadObserverMixinObject(
  object: any
): object is LoadObserverMixinInterface {
  if (
    "progressObserver" in object &&
    "sendMessageToLoadObserver" in object &&
    "_loadObserverAwake" in object
  ) {
    return true;
  }
  return false;
}

// LoadObserverの初期化情報
export interface MixinLoadObserverParameter {
  requiredParameter: string[];
}

/**
 * 読み込みの完了オブザーバを実装するMixin
 */
export function MixinLoadObserver<TBase extends Constructor>(Base: TBase) {
  return class LoadObserver extends Base implements LoadObserverMixinInterface {
    // メッシュの読み込み完了状態の保持フラグ
    public _loadObserverStatus: LoadObserverObject = new LoadObserverObject([]);

    /**
     * このMixinの初期化処理
     * @param parameter
     */
    _loadObserverInitiate(parameter: MixinLoadObserverParameter) {
      const that = this as any;
      // 読み込みの完了を検知するオブザーバ
      this._loadObserverStatus = new Proxy(
        new LoadObserverObject(parameter.requiredParameter),
        {
          set(obj, prop, newval) {
            // sendMessageToLoadObserverで読み込み完了通知が更新されたのなら、この関数が呼ばれる
            // requiredで設定されたすべての処理が実行されたのなら、onLoad通知を実施する
            if (
              prop == "loadedParameter" &&
              newval.length == obj.requiredParameter.length &&
              !obj.isOnLoadCalled
            ) {
              if (that._onLoadFunction) {
                // onLoad通知関数の実行済みフラグを立てる
                obj.isOnLoadCalled = true;
                // 完了を通知する
                that._onLoadFunction();
              }
            }
            //@ts-ignore
            return Reflect.set(...arguments);
          },
        }
      );
    }

    /**
     * awake関数が実行されたときの初期化処理
     */
    _loadObserverAwake() {
      const that = this as any;
      // Meshの読み込みが完了しているのなら、完了通知関数を実行する
      if (
        this._loadObserverStatus.requiredParameter.length ==
        this._loadObserverStatus.loadedParameter.length
      ) {
        if (that._onLoadFunction) {
          // onLoad通知関数の実行済みフラグを立てる
          this._loadObserverStatus.isOnLoadCalled = true;
          that._onLoadFunction();
        }
      }
    }

    /**
     * 登録が完了したパラメータの情報を通知する
     * @param key パラメータの名称
     */
    public sendMessageToLoadObserver(key: string) {
      // Requiredで要求されたパラメータで、重複のないリストを作成する
      const currentList = [
        ...this._loadObserverStatus.loadedParameter,
        key,
      ].filter((item) =>
        this._loadObserverStatus.requiredParameter.includes(item)
      );
      // 重複のないリストを適用する
      this._loadObserverStatus.loadedParameter = Array.from(
        new Set(currentList)
      );
    }

    /**
     * 登録が完了したときに完了通知を返すProgress関数を返す
     * @param key パラメータの名称
     * @returns Progress関数
     */
    public progressObserver(key: string) {
      const that = this;
      return (progress: ProgressEvent<EventTarget>) => {
        if (progress.loaded == progress.total) {
          // 読み込み完了フラグを立てる
          // Proxyで監視しているため、未実行であればOnLoadFunctionが実行される
          that.sendMessageToLoadObserver(key);
        }
      };
    }
  };
}
