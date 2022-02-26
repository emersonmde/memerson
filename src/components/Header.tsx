import {AppBar, Button, Toolbar, Typography} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import {Link} from "react-router-dom";


const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.background.default
  },
  menuButton: {
    marginLeft: 'auto',
    marginRight: theme.spacing(1)
  }
}));


export default function Header() {
  const classes = useStyles();

  return (
    <AppBar position="static" className={classes.root}>
      <Toolbar className="header">
        <Typography variant="h5">
          M. Emerson
        </Typography>

        <div className={classes.menuButton}>
          <Button variant="text" color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button variant="text" color="inherit" component={Link} to="/about">
            About
          </Button>
          <Button variant="text" color="inherit" component={Link} to="/photos">
            Photography
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  )
}
