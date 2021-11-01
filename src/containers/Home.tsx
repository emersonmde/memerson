import { Typography } from "@material-ui/core";
import React from "react";

export default class Home extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <p>
        <pre>Unfortunately, this is probably not what you're looking for.</pre>
      </p>
    );
  }
}