import React, {useState} from "react";
import {Authenticator} from "@aws-amplify/ui-react";
import {Box, Button, Card, Grid, Typography} from "@material-ui/core";
import {API, Storage} from "aws-amplify";


function PhotosUpload() {
  const [response, setResponse] = useState();

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    // handle the input...
    console.log(e.target.files);
    Array.from(e.target.files).forEach((file) => {
      console.log(`Starting upload of file ${file.name} of type: ${file.type}`);
      Storage.put(file.name, file, {
        contentType: file.type,
        progressCallback(progress) {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
        }
      })
        .then(result => console.log(result))
        .catch(err => console.log(err));
    });
  }

  const idk = () => {
    Storage.list('')
      .then(result => console.log(result))
      .catch(err => console.log(err));
  }

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
          <Button variant="outlined" onClick={() => idk()}>List</Button>
          {response &&
              <>
                  <Typography variant="h3">Response</Typography>
                  <pre>{JSON.stringify(response)}</pre>
              </>
          }
          <Grid container justifyContent="center" alignContent="center">
            <Grid item xs={8}>
              <Card>
                <Box p={2}>
                  <label htmlFor="upload-photos">
                    <input
                      style={{display: 'none'}}
                      id="upload-photos"
                      name="upload-photo"
                      type="file"
                      accept="image/*"
                      onChange={uploadFiles}
                      multiple
                    />

                    <Button color="primary" variant="contained" component="span">
                      Upload Photos
                    </Button>
                  </label>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </div>
      )}
    </Authenticator>
  );
}

export default PhotosUpload;
