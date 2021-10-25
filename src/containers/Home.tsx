import { Typography } from "@material-ui/core";
import { Storage } from 'aws-amplify';
import React from "react";
import Gallery from "react-photo-gallery";


// export function PhotosList() {
//   const photos = Storage.list('emersom-photos')
//     .then(result => console.log(result))
//     .catch(err => console.log(err));
//   return (
//     <ul>
//     </ul>
//   );
// }

// export default function Home() {
//   return (
//     <Typography variant="h5">
//       <PhotosList />
//       Hello
//     </Typography>
//   )
// }

export default class Home extends React.Component<{}, {photos: Array<any>}> {
  constructor(props: {}) {
    super(props);
    this.state = {
      photos: []
    }
  }

  componentDidMount() {
    let urls: Array<any> = [];
    Storage.list('', { level: "public" })
      .then(result => {
        console.log(`RESULT: ${result}`)
        result.forEach(item => {
          console.log(`ITEM KEY: ${JSON.stringify(item)}`)
          if(item.key) {
            Storage.get(item.key).then(url => {
              urls.push({
                src: url,
                height: 3648,
                width: 5472
              });
              this.setState({photos: urls});
            });
          }
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <Typography variant="h5">
        <Gallery photos={this.state.photos} />;
        {/* {this.state.photos.map(url => (
          <img src={url}></img>
        ))} */}
      </Typography>
    );
  }
}