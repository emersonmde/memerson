import {Grid} from '@material-ui/core';
import {API} from 'aws-amplify';
import React, {useEffect, useState} from "react";
import Loader from 'react-loader-spinner';
import Gallery from "react-photo-gallery";


function Photos() {
  const [photosList, setPhotosList] = useState([]);

  useEffect(() => {
    const apiName = 'MemersonApi';
    const path = '/photos';
    const params = { // OPTIONAL
      headers: {}, // OPTIONAL
      response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
      queryStringParameters: {  // OPTIONAL
        // name: 'param',
      },
    };

    API
      .get(apiName, path, params)
      .then(response => {
        console.debug('ListPhotos API Response: ', JSON.stringify(response, undefined, 2));
        const photos = response.data.sort((photo: any) => photo.src);
        console.debug(`Found ${photos.length} photos`);
        console.debug('Photos:', photos);
        setPhotosList(photos);
        console.debug('PhotoList:', photosList);
      })
      .catch(error => {
        console.error('Error', error);
      });
  }, []);

  return (
    <Grid container justifyContent="center">
      <p>photos</p>
      {photosList && photosList.length > 0
        ? <Gallery photos={photosList}/>
        : <Loader
          type="Audio"
          color="#202124"
          height={100}
          width={100}
          timeout={3000} // 3 seconds
        />}
    </Grid>
  );
}

export default Photos;