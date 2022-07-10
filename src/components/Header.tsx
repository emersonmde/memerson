import {AppBar, Button, Toolbar, Typography} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import {Link} from "react-router-dom";
import {useAuthenticator} from "@aws-amplify/ui-react";


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
  const { user, signOut } = useAuthenticator((context) => [context.user]);

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
          {user &&
              <>
                  <Button variant="text" color="inherit" component={Link} to="/server_dashboard">
                      Server Dashboard
                  </Button>
                  <Button variant="text" color="inherit" component={Link} to="/create_post">
                      Create Post
                  </Button>
                  <Button variant="text" color="inherit" onClick={() => signOut()}>
                      Sign Out
                  </Button>
              </>
          }
        </div>
      </Toolbar>
    </AppBar>
  )
}
