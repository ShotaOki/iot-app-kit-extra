import { ReplaceTagPluginConstructor } from "./ReplaceTagBase";
import { RechartsModelWrapper } from "../../objects/graph/RechartsModelWrapper";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import React from "react";

/**
 * 対象のクラスにアニメーションを設定するMixin
 */
export function ReplaceTagGraph<TBase extends ReplaceTagPluginConstructor>(
  Base: TBase
) {
  return class GraphTags extends Base {
    /**
     * TwinMakerのタグオブジェクトを線グラフに置き換える
     */
    get toLineChart() {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        return new RechartsModelWrapper(
          this.parameter(tag)
        ).updateRachartsComponent(LineChart, () => (
          <>
            <XAxis dataKey="x" />
            <YAxis />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#8884d8"
              isAnimationActive={false}
            />
          </>
        ));
      }
      return undefined;
    }

    /**
     * TwinMakerのタグオブジェクトを棒グラフに置き換える
     */
    get toBarChart() {
      const tag = this._tag;
      if (tag) {
        tag.visible = false;
        return new RechartsModelWrapper(
          this.parameter(tag)
        ).updateRachartsComponent(BarChart, () => (
          <>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="x" />
            <YAxis />
            <Bar
              type="monotone"
              dataKey="y"
              fill="#8884d8"
              isAnimationActive={false}
            />
          </>
        ));
      }
      return undefined;
    }
  };
}
