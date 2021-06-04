import Header from './components/Header';
import theme from './theme';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import Routes from 'Routes';

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
      <div>
        <Header />
      </div>
      <Routes />
    </ThemeProvider>
  );
}

export default App;
