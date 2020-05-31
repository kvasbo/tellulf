import React from 'react';
import firebase from './firebase';
import { GenericProps } from './types/generic';
import './login.css';

interface State {
  user: string;
  pass: string;
}

class Login extends React.PureComponent<GenericProps, State> {
  public state: State;

  public constructor(props: GenericProps) {
    super(props);
    this.state = { user: '', pass: '' };
    this.login = this.login.bind(this);
  }

  private handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ user: e.target.value });
  };

  private handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ pass: e.target.value });
  };

  private login() {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.user, this.state.pass)
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // eslint-disable-next-line no-console
        console.log('Login error', errorCode, errorMessage);
      });
  }

  public render(): React.ReactNode {
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
