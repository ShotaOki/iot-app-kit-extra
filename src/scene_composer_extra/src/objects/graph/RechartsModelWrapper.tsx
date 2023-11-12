import React from "react";
import {
  HTMLModelParameterBaseInterface,
  HTMLModelWrapper,
} from "../html/HTMLModelWrapper";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

/** TagControllerから実体にする際に呼び出すパラメータ: Elementの外からの上書きは禁止する */
export interface RechartsModelParameter
  extends HTMLModelParameterBaseInterface {
  data?: any[];
  graph?: JSX.Element;
  width?: number;
  height?: number;
}
/** グラフの可視化クラス */
export class RechartsModelWrapper extends HTMLModelWrapper {
  private _componentName?: any;
  private _jsxDefault?: JSX.Element;
  private _data?: any[];
  /**
   * グラフの表示種別を設定する
   */
  updateRachartsComponent(componentName: any, jsxDefault: JSX.Element) {
    this._componentName = componentName;
    this._jsxDefault = jsxDefault;
    return this;
  }
  /**
   * グラフの表示データを参照する
   */
  get data() {
    // データの指定がないのなら、空配列を返す
    if (this._data === undefined || this._data.length == 0) {
      return [];
    }
    // 数値の配列ならラベルを付けて返す
    if (typeof this._data[0] === "number") {
      return this._data.map((value, index) => ({
        x: index + 1,
        y: value,
      }));
    }
    // オブジェクトの配列ならそのまま返す
    return this._data;
  }
  create(parameter: RechartsModelParameter) {
    // コンポーネントクラス（Rechartsライブラリのクラス）
    const componentName: any = this._componentName ?? LineChart;
    // グラフの表示幅
    const width = parameter.width ?? 300;
    // グラフの表示高さ
    const height = parameter.height ?? 200;
    // グラフのデータ定義
    const graph: JSX.Element = parameter.graph ?? this._jsxDefault ?? (
      <>
        <XAxis dataKey="x" />
        <YAxis />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="y" stroke="#8884d8" />
      </>
    );
    // グラフの表示データを参照
    this._data = parameter.data;
    // グラフをHTMLとして作成、表示する
    super.create({
      ...parameter,
      element: (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "white",
            borderRadius: "1rem",
          }}
        >
          {React.createElement(
            componentName,
            {
              width: width,
              height: height,
              data: this.data,
            },
            graph
          )}
        </div>
      ),
    });
    return this;
  }
}
