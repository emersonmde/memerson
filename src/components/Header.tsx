import { AppBar, IconButton, Toolbar, Typography, Button } from "@material-ui/core";
import { Menu, PlayCircleFilledTwoTone } from "@material-ui/icons"
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";



const useStyles = makeStyles(theme => ({
    root: {
        background: theme.palette.background.default
    },
  }));


export default function Header() {
    const classes = useStyles();

    return (
        <AppBar position="static" className={classes.root}>
            <Toolbar className="header">
                <IconButton edge="start" color="inherit" aria-label="menu">
                    <Menu />
                </IconButton>
                <Typography variant="h5">
                    Matthew Emerson
                </Typography>

                <Button variant="text" color="inherit" component={Link} to="/">
                    Home
                </Button>
                <Button variant="text" color="inherit" component={Link} to="/about">
                    About
                </Button>
            </Toolbar>
        </AppBar>
    )
}
