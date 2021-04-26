import React from "react";

export const Button: React.FC<
  Pick<
    React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    "onClick" | "className" | "type"
  >
> = (props) => (
  <button
    {...props}
    className={`${
      props.className ?? ""
    } bg-indigo-700 text-white px-10 py-3 rounded-md text-lg`}
  />
);
