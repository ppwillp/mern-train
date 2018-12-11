import React, { Component } from "react";

//router
// eslint-disable-next-line
import { BrowserRouter as Router, Route } from "react-router-dom";

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

import "./App.css";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />

          <Route exact path="/" component={Landing} />
          <div className="container">
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
          </div>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
