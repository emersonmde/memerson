import React from "react";
import {Grid, LinearProgress, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import DeleteIcon from '@material-ui/icons/Delete';


interface FileUploadEntryProps {
  fileName: string;
  progress?: number;
}

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: 'center',
  },
  marginAuto: {
    margin: "auto"
  }
}));

function FileUploadEntry(props: FileUploadEntryProps) {
  const classes = useStyles();

  return (
    <Grid container spacing={4}>
      <Grid item xs={3} className={classes.marginAuto}>
        <Typography className={classes.root}>{props.fileName}</Typography>
      </Grid>
      <Grid item xs={8} className={classes.marginAuto}>
        <LinearProgress variant="determinate" value={props.progress} />
      </Grid>
      <Grid item xs={1} className={classes.marginAuto}>
        <DeleteIcon color="error" />
      </Grid>
    </Grid>
  )
}

export default FileUploadEntry;