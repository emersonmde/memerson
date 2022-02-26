import React from "react";
import {Authenticator} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import {Typography} from "@material-ui/core";


export default class SignIn extends React.Component<{}, {}> {
  readonly textStyle: any;

  constructor(props: {}) {
    super(props);
    this.state = {}

    this.textStyle = {
      marginLeft: '10px'
    };
  }


  render() {
    return (
      <>
        <Authenticator>
          {({signOut, user}) => (
            <main>
              <Typography variant="h3">Hello {user?.attributes?.email}</Typography>
              <button onClick={signOut}>Sign out</button>
            </main>
          )}
        </Authenticator>
      </>
    );
  }
}