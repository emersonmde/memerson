import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Routes from 'Routes';
import Header from './components/Header';
import theme from './theme';
import Amplify from 'aws-amplify';
import config from './config';


Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID
  },
  Storage: {
    AWSS3: {
      bucket: 'memerson-photos',
      region: 'us-east-1',
      identityPoolId: config.cognito.IDENTITY_POOL_ID,
    }
  }
});

const useStyles = makeStyles(theme => ({
  root: {
      background: theme.palette.background.default
  },
}));

function App() {
  // const classes = useStyles();
  useStyles();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <Routes />
    </ThemeProvider>
  );
}

export default App;
