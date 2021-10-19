import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
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
});

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
      {/* <div>
        <AmplifySignOut />
      </div> */}
    </ThemeProvider>
  );
}

export default App;
