import About from "containers/About";
import Home from "containers/Home";
import Photos from "containers/Photos";
import { Route, Switch } from "react-router-dom";


export default function Routes() {
    return (
        <Switch>
            <Route path="/" exact>
                <Home />
            </Route>
            <Route path="/about">
                <About />
            </Route>
            <Route path="/photos">
                <Photos />
            </Route>
        </Switch>
    )
}