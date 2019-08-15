import React from "react";
import { shallow } from "enzyme";

import { MyComponent } from "my-package";

describe("MyComponent", () => {
  it("Renders w/out errors", () => {
    const wrapper = shallow(<MyComponent />);
    expect(wrapper.find("button").text()).toEqual("Click Me");
  });
  it("Clicking changes text", () => {
    const wrapper = shallow(<MyComponent />);
    const button = wrapper.find("button");
    button.simulate("click");
    expect(wrapper.find("button").text()).not.toEqual("Click Me");
  });
});
