import React from 'react';
import firebase from './firebase';
import './login.css';

interface State {
  user: string;
  pass: string;
}

class Login extends React.PureComponent<{}, State> {
  public state: State;

  public constructor(props: {}) {
    super(props);
    this.state = { user: '', pass: '' };
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.login = this.login.bind(this);
  }

  private handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ user: e.target.value });
  };

  private handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ pass: e.target.value });
  };

  private login() {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.user, this.state.pass)
      .catch(error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // eslint-disable-next-line no-console
        console.log('Login error', errorCode, errorMessage);
      });
  }

  public render() {
    return (
      <div className="App" id="container">
        <div id="login">
          <p>Tellulf.</p>
          <input
            type="text"
            autoCapitalize="off"
            value={this.state.user}
            onChange={this.handleUsernameChange}
          />
          <input
            type="password"
            autoCapitalize="off"
            value={this.state.pass}
            onChange={this.handlePasswordChange}
          />
          <input type="button" value="Logg inn" onClick={this.login} />
        </div>
      </div>
    );
  }
}

export default Login;
