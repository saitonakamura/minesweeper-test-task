import React from "react";

export const Input: React.FC<
  Pick<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "onChange" | "className" | "type" | "value" | "min" | "max"
  >
> = (props) => (
  <input
    {...props}
    className={`${props.className ?? ""} border-gray-500 border-2`}
  />
);
