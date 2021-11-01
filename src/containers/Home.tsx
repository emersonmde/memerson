import { Typography } from "@material-ui/core";
import { Storage, API } from 'aws-amplify';
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

export default class Home extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <Typography variant='h5'>Hey</Typography>
    );
  }
}