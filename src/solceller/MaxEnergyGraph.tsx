import React from 'react';
import { Style } from '../types/generic';
import Moment from 'moment';

interface Props {
  day: number;
  month: number;
  year: number;
  ever: number;
}

const insideTextThreshold = 45;

const energyBarHolder: Style = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
};

const energyBar: Style = {
  alignItems: 'center',
  flexDirection: 'row',
  display: 'flex',
  transition: 'width 1s',
  justifyContent: 'flex-end',
  padding: '0.5vw',
};

const restBar: Style = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  transition: 'width 1s',
  justifyContent: 'flex-start',
  padding: '0.5vw',
  backgroundColor: '#00000033',
};

class MaxEnergyGraph extends React.PureComponent<Props, {}> {
  public static defaultProps = {
    day: 0,
    month: 0,
    year: 0,
    ever: 4500,
  };
  public render() {
    const now = Moment();
    const dayName = now.format('dddd:');
    const monthName = now.format('MMM:');
    const yearName = now.format('YYYY:');
    const dayWidth = (this.props.day / this.props.ever) * 100;
    const monthWidth = (this.props.month / this.props.ever) * 100;
    const yearWidth = (this.props.year / this.props.ever) * 100;
    const dayWidthString = `${dayWidth}%`;
    const monthWidthString = `${monthWidth}%`;
    const yearWidthString = `${yearWidth}%`;
    const dayString = `${dayName} ${this.props.day} W`;
    const monthString = `${monthName} ${this.props.month} W`;
    const yearString = `${yearName} ${this.props.year} W`;
    const dayMainText = dayWidth > insideTextThreshold ? dayString : '';
    const dayOutsideText = dayWidth > insideTextThreshold ? '' : dayString;
    const monthMainText = monthWidth > insideTextThreshold ? monthString : '';
    const monthOutsideText = monthWidth > insideTextThreshold ? '' : monthString;
    const yearMainText = yearWidth > insideTextThreshold ? yearString : '';
    const yearOutsideText = yearWidth > insideTextThreshold ? '' : yearString;
    return (
      <div
        style={{
          height: '7vh',
          width: '90%',
          padding: '0 5% 0 5%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          marginTop: '1vh',
        }}
      >
        <div style={{ ...energyBarHolder }}>
          <div style={{ ...energyBar, backgroundColor: '#00FF0055', width: dayWidthString }}>
            {dayMainText}
          </div>
          <div style={restBar}>{dayOutsideText}</div>
        </div>
        <div style={{ ...energyBarHolder }}>
          <div style={{ ...energyBar, backgroundColor: '#00FF0044', width: monthWidthString }}>
            {monthMainText}
          </div>
          <div style={restBar}>{monthOutsideText}</div>
        </div>
        <div style={{ ...energyBarHolder }}>
          <div style={{ ...energyBar, backgroundColor: '#00FF0033', width: yearWidthString }}>
            {yearMainText}
          </div>
          <div style={restBar}>{yearOutsideText}</div>
        </div>
        <div style={{ ...energyBarHolder }}>
          <div style={{ ...energyBar, backgroundColor: '#00FF0022', width: '100%' }}>
            max: {this.props.ever} W
          </div>
        </div>
      </div>
    );
  }
}

export default MaxEnergyGraph;
