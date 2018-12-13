import React, { Component } from "react";

//router
// eslint-disable-next-line
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

//redux
import { Provider } from "react-redux"; //provides store
import store from "./store";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";

//Import private route component
import PrivateRoute from "./components/common/PrivateRoute";

//components
//navbar
import Navbar from "./components/layout/Navbar";
//footer
import Footer from "./components/layout/Footer";
//landing
import Landing from "./components/layout/Landing";
//register
import Register from "./components/auth/Register";
//login
import Login from "./components/auth/Login";
//dashboard
import Dashboard from "./components/dashboard/Dashboard";
//create profile
import CreateProfile from "./components/create-profile/CreateProfile";

import "./App.css";
import { clearCurrentProfile } from "./actions/profileActions";

//check for token
if (localStorage.jwtToken) {
  //set auth token header auth
  setAuthToken(localStorage.jwtToken);
  //decode token and get user info and expiration
  const decoded = jwt_decode(localStorage.jwtToken);
  //call setCurrentUser action and isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  //check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    //logout user
    store.dispatch(logoutUser());

    store.dispatch(clearCurrentProfile());
    //REDIRECT TO LOGIN
    window.location.href = "/login";
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />

            <Route exact path="/" component={Landing} />
            <div className="container">
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Switch>
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
              </Switch>
              <Switch>
                <PrivateRoute
                  exact
                  path="/create-profile"
                  component={CreateProfile}
                />
              </Switch>
            </div>
            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
