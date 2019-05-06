import React from 'react';
import { connect } from 'react-redux';
import { fetchWeather } from '../redux/actions';
import GraphLong from './GraphLong';
import './yr.css';

const steder = {
  oslo: { lat: 59.9409, long: 10.6991 },
  sandefjord: { lat: 59.1347624, long: 10.3250789 },
};

interface Props {
  dispatch: Function;
}

interface State {
  sted: string;
}

class Yr extends React.PureComponent<Props, State> {
  public state: State;

  public constructor(props: Props) {
    super(props);
    this.state = { sted: 'oslo' };
  }

  public componentDidMount() {
    setTimeout(() => {
      this.updateWeather();
    }, 1500);
  }

  private updateWeather() {
    const { lat, long } = steder[this.state.sted];
    this.props.dispatch(fetchWeather(lat, long));
  }

  private stedEndra(e: React.ChangeEvent<HTMLInputElement>) {
    if (e !== null && e.currentTarget !== null && e.currentTarget.value !== null) {
      this.setState({ sted: e.currentTarget.value });
      const { lat, long } = steder[e.currentTarget.value];
      this.props.dispatch(fetchWeather(lat, long));
    }
  }

  // Stays on
  public render() {
    return (
      <div className="yr-container">
        <GraphLong />
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
          }}
        >
          <label htmlFor="oslo">
            <input
              style={{ margin: 10 }}
              type="radio"
              id="oslo"
              name="sted"
              value="oslo"
              checked={this.state.sted === 'oslo'}
              onChange={e => this.stedEndra(e)}
            />
            Hjemme
          </label>
          <label htmlFor="sandefjord">
            <input
              style={{ margin: 10 }}
              type="radio"
              id="sandefjord"
              name="sted"
              value="sandefjord"
              checked={this.state.sted === 'sandefjord'}
              onChange={e => this.stedEndra(e)}
            />
            Hytta
          </label>
        </div>
      </div>
    );
  }
}

export default connect()(Yr);
