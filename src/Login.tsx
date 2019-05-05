import React from 'react';
import firebase from './firebase';
import './login.css';

interface State {
  user: string;
  pass: string;
}

interface Props {}

class Login extends React.PureComponent<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = { user: '', pass: '' };
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.login = this.login.bind(this);
  }

  handleUsernameChange = (e: any) => {
    this.setState({ user: e.target.value });
  };

  handlePasswordChange = (e: any) => {
    this.setState({ pass: e.target.value });
  };

  login() {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.user, this.state.pass)
      .catch(error => {
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
