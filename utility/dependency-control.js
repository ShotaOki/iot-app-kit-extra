// 引数の数が想定と異なるのなら処理を終了する
if (process.argv.length != 5) {
  console.error("required 3 parameters");
  return;
}

// ファイルを扱う
const fs = require("node:fs").promises;

const [_a, _b, proc_name, from_json, input_argment] = process.argv;

// packageファイルの依存関係を、引数2のファイルの設定値を元に更新する
async function apply_main() {
  // 更新対象のpackage
  const raw = await fs.readFile(from_json, "utf8");
  // 引数2のファイル
  const overrides_raw = await fs.readFile(input_argment, "utf8");

  // JSON形式で読み込む
  const data = JSON.parse(raw);
  const overrides = JSON.parse(overrides_raw);

  // 依存関係を更新する
  Object.keys(overrides).forEach((key) => {
    const replacement = overrides[key];
    Object.keys(replacement).forEach((replacement_key) => {
      if (replacement_key in data[key]) {
        data[key][replacement_key] = replacement[replacement_key];
      }
    });
  });

  // ファイルを出力する
  fs.writeFile(from_json, JSON.stringify(data, undefined, 2), "utf8");
}

// packageファイルの依存関係を、引数2の文字列に変換する
async function replacement_main(process_type, process_key) {
  // 更新対象のpackage
  const raw = await fs.readFile(from_json, "utf8");
  // 引数2の文字列
  const [input_key, input_arg] = input_argment.split("=");

  // JSON形式で読み込む
  const data = JSON.parse(raw);

  // 依存関係を更新する
  if (process_type == "replace") {
    const replacement = data[process_key];
    Object.keys(replacement).forEach((replacement_key) => {
      if (replacement_key == input_key) {
        data[process_key][replacement_key] = input_arg;
      }
    });
  }
  // メタ情報を追記する
  if (process_type == "append") {
    data[process_key] = data[process_key] || {};
    data[process_key][input_key] = input_arg;
  }

  // ファイルを出力する
  fs.writeFile(from_json, JSON.stringify(data, undefined, 2), "utf8");
}

if (proc_name == "apply") {
  apply_main().then(() => {});
}
if (proc_name == "replace") {
  replacement_main("replace", "dependencies").then(() => {});
}
if (proc_name == "append") {
  replacement_main("append", "@meta").then(() => {});
}
