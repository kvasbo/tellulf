import React, { Component } from 'react';
import jsonp from 'jsonp';

const hooks = {};
hooks.openDoor = { title: 'Åpne dør', url: 'https://maker.ifttt.com/trigger/door_up/with/key/8UBd7SRuyIbBXyH3ANX-m' };
hooks.closeDoor = { title: 'Lukk dør', url: 'https://maker.ifttt.com/trigger/door_close/with/key/8UBd7SRuyIbBXyH3ANX-m' };
// hooks.openAll = 

export default class Ruter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.ifr = null;
    this.performAction = this.performAction.bind(this);
  }

  async performAction(key) {
    try {
      const url = hooks[key].url;
      await jsonp(url, null);
    } catch (err) {
      console.log("error in jsonp");
    }
  }

  render() {
    return (
      <div>
        <div onClick={() => this.performAction('openDoor')}>Åpne dør</div>
        <div onClick={() => this.performAction('closeDoor')}>Lukk dør</div>
      </div>
    );
  }
}
