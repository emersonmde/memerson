import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Routes from 'Routes';
import Header from './components/Header';
import theme from './theme';

const useStyles = makeStyles(theme => ({
  root: {
      background: theme.palette.background.default
  },
}));

function App() {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Routes />
    </ThemeProvider>
  );
}

export default App;
