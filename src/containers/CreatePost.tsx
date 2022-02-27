import React, {useState} from "react";
import {Authenticator, useAuthenticator} from "@aws-amplify/ui-react";
import {Button, Typography} from "@material-ui/core";
import {API} from "aws-amplify";

function CreatePost() {
  const [response, setResponse] = useState();

  const authEcho = () => {
    const apiName = 'MemersonApi';
    const path = 'auth_echo';
    const params = {
      queryStringParameters: {},
    }

    API
      .get(apiName, path, params)
      .then(response => {
        setResponse(response);
      })
      .catch(error => {
        console.error(error.response);
      });
  }

  const textStyle = {
    marginLeft: '10px'
  }

  return (
    <Authenticator>
      {({signOut, user}) => (
        <div style={textStyle}>
          <pre>Wake up, {user?.attributes?.email}...</pre>
          <Button variant="outlined" onClick={() => authEcho()}>Auth Echo</Button>
          {response &&
            <>
              <Typography variant="h3">Response</Typography>
              <pre>{JSON.stringify(response)}</pre>
            </>
          }
        </div>
      )}
    </Authenticator>
  );
}
export default CreatePost;
