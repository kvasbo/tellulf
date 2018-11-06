import React from 'react';

import './login.css';

class Login extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { user: '', pass: '' };
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.login = this.login.bind(this);
  }

  handleUsernameChange = (e) => {
    this.setState({ user: e.target.value });
  }

  handlePasswordChange = (e) => {
    this.setState({ pass: e.target.value });
  }

  login() {
    window.firebase.auth().signInWithEmailAndPassword(this.state.user, this.state.pass).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('Login error', errorCode, errorMessage);
    });
  }

  render() {
    return (
      <div className="App" id="container">
        <div id="login">
          <p>Tellulf.</p>
          <input type="text" value={this.state.user} onChange={this.handleUsernameChange} />
          <input type="password" value={this.state.pass} onChange={this.handlePasswordChange} />
          <input type="button" value="Logg inn" onClick={this.login} />
        </div>
      </div>

    );
  }
}

export default Login;
