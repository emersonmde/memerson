import React from "react";

export default class Home extends React.Component<{}, {}> {
  readonly textStyle: any;
  constructor(props: {}) {
    super(props);
    this.state = {
    }

    this.textStyle = {
      marginLeft: '10px'
    };
  }

  render() {
    return (
      <div style={this.textStyle}>
        <pre>Unfortunately, this is probably not what you're looking for.</pre>
      </div>
    );
  }
}