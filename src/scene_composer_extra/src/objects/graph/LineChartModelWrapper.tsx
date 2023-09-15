import React from "react";
import { HTMLModelWrapper } from "../html/HTMLModelWrapper";
import { ModelParameterBase } from "../ExtraObjectWrapper";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

export interface LineChartModelParameter extends ModelParameterBase {
  data?: any[];
  graph?: JSX.Element;
}
export class LineChartModelWrapper extends HTMLModelWrapper {
  create(parameter: LineChartModelParameter) {
    const graph: JSX.Element = parameter.graph ?? (
      <>
        <XAxis dataKey="x" />
        <YAxis />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="y" stroke="#8884d8" />
      </>
    );
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
          <LineChart width={300} height={200} data={parameter.data}>
            {graph}
          </LineChart>
        </div>
      ),
    });
    return this;
  }
}
