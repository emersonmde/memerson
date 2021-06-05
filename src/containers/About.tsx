import { Container, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: 30
  },
}));

export default function About() {
  const classes = useStyles();
  return (
    <Container maxWidth='md' className={classes.root}>
      <Typography variant='body1'>
        <Typography paragraph>
          The missile knows where it is at all times. It knows this because it knows where it isn't !
        </Typography>

        <Typography paragraph>
          By subracting where it is from where it isn't, or where it isn't from where it is (whichever is greater), it obtains a difference or deviation.
        </Typography>

        <Typography paragraph>
          The guidance system uses deviations to generate corrective commands to drive the missile from a position where it wasn't to where it now is. Consequently, the position where it was is now the position where it isn't.
        </Typography>

        <Typography paragraph>
          In the event that the position where it is now is not the position where it wasn't, the system has acquired a variation (variations are caused by external factors, and the discussions of these factors are not considered to be within the scope of this report). The variation being the difference between where the missile is and where the missile wasn't. If variations are considered to be a significant factor, it, too, may be corrected for by the use of another system. However, for this to take place, the missile must now where it was, also.
        </Typography>

        <Typography paragraph>
          The "thought process" of the missile is as follows: because a variation has modified some of the information which the missile has obtained, it is not sure where it is. However, it is sure where it isn't ! (within reason) and it knows DAMN sure where it was and also where it wasn't. It now subtracts where it should be from where it wasn't (or vice versa) and by differentiating this with the algebraic difference between where it shouldn't be and where it was, it is able to obtain the difference between its deviations and its variations....which is called the ERROR SIGNAL.
        </Typography>
      </Typography>
    </Container>
  )
}