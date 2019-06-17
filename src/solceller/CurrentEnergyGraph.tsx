import React from 'react';
import { XAxis, YAxis, Bar, ComposedChart, ResponsiveContainer } from 'recharts';

interface Props {
  power: number;
  currentProduction: number;
  currentNetConsumption: number;
}

class CurrentEnergyGraph extends React.PureComponent<Props, {}> {
  private getData() {
    return [
      {
        name: 'now',
        currentNetConsumption: this.props.currentNetConsumption * -1,
        currentProduction: this.props.currentProduction,
        power: this.props.power,
      },
    ];
  }

  public render() {
    return (
      <div
        style={{
          height: '3vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <ResponsiveContainer width="50%" height="100%">
          <ComposedChart
            layout="vertical"
            margin={{
              top: 0,
              right: 0,
              left: 10,
              bottom: 0,
            }}
            data={this.getData()}
          >
            <XAxis type="number" hide domain={[-5000, 0]} />
            <YAxis dataKey="name" type="category" hide />
            <Bar dataKey="currentNetConsumption" fill="#8e0909" />
          </ComposedChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="50%" height="100%">
          <ComposedChart
            layout="vertical"
            margin={{
              top: 0,
              right: 10,
              left: 0,
              bottom: 0,
            }}
            data={this.getData()}
          >
            <XAxis type="number" hide domain={[0, 5000]} />
            <YAxis dataKey="name" type="category" hide />
            <Bar dataKey="currentProduction" fill="#088e25" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default CurrentEnergyGraph;
