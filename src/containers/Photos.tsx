import { API } from 'aws-amplify';
import React from "react";
import Gallery from "react-photo-gallery";



export default class Photos extends React.Component<{}, { photos: Array<any>, photosList: Array<any> }> {
  constructor(props: {}) {
    super(props);
    this.state = {
      photos: [],
      photosList: []
    }
  }

  componentDidMount() {
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
        const photos = response.data
          .filter((photo: any) => (photo.filename.includes('-20_')))
          // .filter((photo: any) => (photo.aspect_ratio_width && photo.aspect_ratio_height))
          .map((photo: any) => {
            return {
              src: photo.url,
              height: photo.height,
              width: photo.width
            };
          });
        console.debug(`Found ${photos.length} photos`);
        this.setState({ photosList: photos });
      })
      .catch(error => {
        console.log(error.response);
      });
  }

  render() {
    return (
      <div>
        <Gallery photos={this.state.photosList} />;
      </div>
    );
  }
}