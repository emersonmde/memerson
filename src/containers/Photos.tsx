import {Button, Grid} from '@material-ui/core';
import {API} from 'aws-amplify';
import React, {useEffect, useState} from "react";
import Loader from 'react-loader-spinner';
import Gallery, {PhotoProps} from "react-photo-gallery";
import "./Photos.css";

interface asdf {
  index: number
  next: PhotoProps | null
  photo: PhotoProps
  previous: PhotoProps | null
}

function Photos() {
  const [photosList, setPhotosList] = useState([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<asdf>();

  useEffect(() => {
    const apiName = 'MemersonApi';
    const path = '/photos';
    const params = {
      headers: {},
      response: true, // return the entire Axios response object
      queryStringParameters: {
      },
    };

    API
      .get(apiName, path, params)
      .then(response => {
        const photos = response.data.sort((a: any, b: any) => a.src > b.src ? -1 : 1);
        console.debug(`Found ${photos.length} photos`);
        setPhotosList(photos);
      })
      .catch(error => {
        console.error('Error', error);
      });
  }, []);


  const onClickHandler = (event: React.MouseEvent, photos: any) => {
    console.log(event);
    console.log(`Photos: ${JSON.stringify(photos, null, 2)}`);
    setLightboxPhoto(photos);
  }
  const srcSet = Array.isArray(lightboxPhoto?.photo?.srcSet) ? lightboxPhoto!.photo!.srcSet!.join(', ') : '';



  let src = '';
  if (Array.isArray(lightboxPhoto?.photo?.srcSet)) {
    const srcArray = lightboxPhoto!.photo!.srcSet!.map((src) => src.split(' '));
    const sortedSrcArray = srcArray.sort((a, b) => (a[1] > b[1] ? -1 : 1));
    src = sortedSrcArray[0][0];
    console.log('SortedSrcArray', sortedSrcArray);
  }


  if (lightboxPhoto) {
    console.log("Photo", lightboxPhoto);
  }

  const onDownload = () => {
    const link = document.createElement("a");
    link.download = src ?? '';
    link.href = src ?? '';
    link.click();
  };

  return (
    <Grid container justifyContent="center">
      {lightboxPhoto &&
          <div className="modal">
              <span className="close" onClick={() => setLightboxPhoto(undefined)}>&times;</span>
              <img alt="F" className="modal-content" src={src} srcSet={srcSet} />
              <Grid container justify="center">
                  <Button onClick={onDownload} variant="contained">Download</Button>
              </Grid>
          </div>
      }
      {photosList && photosList.length > 0
        ? <Gallery photos={photosList} onClick={onClickHandler} />
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