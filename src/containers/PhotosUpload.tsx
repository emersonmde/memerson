import React, {useState} from "react";
import {Authenticator} from "@aws-amplify/ui-react";
import {Box, Button, Card, Grid} from "@material-ui/core";
import {Storage} from "aws-amplify";
import FileUploadEntry from "../components/FileUploadEntry";
import {v4 as uuidv4} from 'uuid';


interface fileUploadState {
  name: string;
  progress: number;
}

function PhotosUpload() {
  const [files, setFiles] = useState<fileUploadState[]>([]);

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    Array.from(e.target.files).forEach((file, i) => {
      setFiles((oldFiles) => {
        return oldFiles.concat({name: file.name, progress: 0});
      });
      console.log(`Starting upload of file ${file.name} of type: ${file.type}`);
      Storage.put(`${file.lastModified}-${uuidv4()}.${file.name.split('.').pop()}`, file, {
        contentType: file.type,
        progressCallback(progress) {
          setFiles((oldFiles) => {
            oldFiles[i].progress = (progress.loaded / progress.total) * 100;
            return [...oldFiles];
          });
        }
      })
        .then(result => console.log('Finished uploading file:', result))
        .catch(err => console.log('Error uploading file:', err));
    });
  }

  const listPhotos = () => {
    Storage.list('')
      .then(result => console.log(result))
      .catch(err => console.log(err));
  }

  const textStyle = {
    marginLeft: '10px',
    paddingTop: '20px'
  }


  return (
    <Authenticator>
      {({signOut, user}) => (
        <div style={textStyle}>
          <Grid container justifyContent="center" alignContent="center">
            <Grid item xs={8}>
              <Card>
                <Box p={2}>
                  {files.map(file => (
                    <FileUploadEntry fileName={file.name} progress={file.progress}/>
                  ))}
                </Box>
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
          <Button variant="outlined" onClick={() => listPhotos()}>List</Button>
        </div>
      )}
    </Authenticator>
  );
}

export default PhotosUpload;
