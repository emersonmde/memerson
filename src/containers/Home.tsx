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
      <Typography variant='h5'>Hey</Typography>
    );
  }
}