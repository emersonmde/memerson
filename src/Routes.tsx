import About from "containers/About";
import Home from "containers/Home";
import Photos from "containers/Photos";
import {Route, Switch} from "react-router-dom";
import Secret from "./containers/Secret";
import SignIn from "./containers/SignIn";


export default function Routes() {
  return (
    <Switch>
      <Route path="/" exact>
        <Home/>
      </Route>
      <Route path="/about">
        <About/>
      </Route>
      <Route path="/photos">
        <Photos/>
      </Route>
      <Route path="/secret">
        <Secret/>
      </Route>
      <Route path="/sign_in">
        <SignIn/>
      </Route>
    </Switch>
  )
}