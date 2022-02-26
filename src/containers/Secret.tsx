import React from "react";
import {Authenticator} from "@aws-amplify/ui-react";
import {Button, Typography} from "@material-ui/core";
import {API} from "aws-amplify";

export default class Secret extends React.Component<{}, {}> {
  readonly textStyle: any;

  constructor(props: {}) {
    super(props);
    this.state = {}

    this.textStyle = {
      marginLeft: '10px'
    };
  }

  async authEcho() {
    const apiName = 'MemersonApi';
    const path = 'auth_echo';
    const params = {
      queryStringParameters: {},
    }
    const output = await API.get(apiName, path, params);
    return output;
  }


  render() {
    return (
      <Authenticator>
        {({signOut, user}) => (
          <div style={this.textStyle}>
            <Typography variant="h3">Hello {user?.attributes?.email}</Typography>
            <Button variant="outlined" onClick={signOut}>Sign Out</Button>
            <pre>Super secreth. Shhh...</pre>
            <Button variant="outlined" onClick={() => this.authEcho()}>Auth Echo</Button>

          </div>
        )}
      </Authenticator>
    );
  }
}