const ORIGIN_REGEX = /(.+?:\/\/.+?)\//;
const ROOT_ORIGIN_REGEX = /(.+?:\/\/.+)/;
const WITHOUT_DOMAIN = /^\//;

/**
 * URLにあったオリジンを取得します
 *
 * @param url リクエスト先のURL
 * @returns 置換用のオリジン
 */
function selectRegex(url: string) {
  if (ORIGIN_REGEX.test(url)) {
    // オリジンの末尾にスラッシュを含むURLを置換する
    // e.g. https://www.anydomain.co.jp/anypath
    return ORIGIN_REGEX;
  } else if (ROOT_ORIGIN_REGEX.test(url)) {
    // オリジンの末尾にスラッシュを含まないURLを置換する
    // e.g. https://www.anydomain.co.jp
    return ROOT_ORIGIN_REGEX;
  } else if (WITHOUT_DOMAIN.test(url)) {
    // オリジンを持たないURLはそのまま実行する
    // e.g. /request_url
    return undefined;
  }
  throw new Error("[Failed] Unsupported url");
}

/**
 * fetch互換のHTTP通信関数、ローカル実行時のみ有効
 * プロキシを通して、CORSの制限がかからない形でURLをリクエストをする
 *
 * @param input リクエスト先のURL
 * @param init リクエストパラメータ
 * @returns fetch response
 */
export function proxyFetch(
  input: string | URL,
  init?: RequestInit
): Promise<Response> {
  // 接続先のURLを取得する
  const url = input.toString();
  // URLの変換用正規表現を取得する
  const regex = selectRegex(url);
  if (regex === undefined) {
    return fetch(input, init);
  }
  // URLのオリジン部分を抽出する
  const origin = regex.exec(url) ?? ["", ""];
  const host = encodeURIComponent(origin[1]);
  // オリジン部分をURLエンコードして、パスの中に含める
  // オリジンはsetupProxy.jsで解析、リクエストをdevServerを通して転送する
  return fetch(url.replace(regex, `/proxy/fetch/host=${host}/`), init);
}
