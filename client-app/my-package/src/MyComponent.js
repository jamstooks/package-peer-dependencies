import React, { useState } from "react";

// Component shows a button that changes to a random
// number when clicked
export const MyComponent = props => {
  const [display, setDisplay] = useState("Click Me");

  const onClick = () =>
    setDisplay(Math.floor(Math.random() * Math.floor(1000)));

  return <button onClick={onClick}>{display}</button>;
};
