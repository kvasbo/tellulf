import React from 'react';
import { Style } from '../types/generic';
import Moment from 'moment';

interface Props {
  day: number;
  month: number;
  year: number;
  ever: number;
  currentProduction: number;
}

const insideTextThreshold = 50;

const energyText: Style = {
  padding: '8px 0px 8px 0px',
  fontSize: '12px',
  alignSelf: 'center',
};

const energyBarHolder: Style = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
};

const energyBar: Style = {
  alignItems: 'center',
  flexDirection: 'row',
  display: 'flex',
  transition: 'width 3s',
  justifyContent: 'center',
};

const restBar: Style = {
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  transition: 'width 1s',
  justifyContent: 'flex-start',
  backgroundColor: '#00000033',
};

class MaxEnergyGraph extends React.PureComponent<Props, Record<string, unknown>> {
  public static defaultProps = {
    day: 0,
    month: 0,
    year: 0,
    ever: 4500,
  };
  public render(): React.ReactNode {
    const now = Moment();
    const dayName = now.format('dddd:');
    const monthName = now.format('MMM:');
    const yearName = now.format('YYYY:');
    const ever = this.props.ever ? this.props.ever : 4254;
    const currentWidth = (this.props.currentProduction / ever) * 100;
    const dayWidth = (this.props.day / ever) * 100;
    const monthWidth = (this.props.month / ever) * 100;
    const yearWidth = (this.props.year / ever) * 100;
    const everWidth = 1 * 100;
    const currentWidthString = `${currentWidth}%`;
    const dayWidthString = `${dayWidth}%`;
    const monthWidthString = `${monthWidth}%`;
    const yearWidthString = `${yearWidth}%`;
    const everWidthString = `${everWidth}%`;
    const nowString = `nå: ${this.props.currentProduction} W`;
    const dayString = `${dayName} ${this.props.day} W`;
    const monthString = `${monthName} ${this.props.month} W`;
    const yearString = `${yearName} ${this.props.year} W`;
    const nowMainText = currentWidth > insideTextThreshold ? nowString : '';
    const nowOutsideText = currentWidth > insideTextThreshold ? '' : nowString;
    const dayMainText = dayWidth > insideTextThreshold ? dayString : '';
    const dayOutsideText = dayWidth > insideTextThreshold ? '' : dayString;
    const monthMainText = monthWidth > insideTextThreshold ? monthString : '';
    const monthOutsideText = monthWidth > insideTextThreshold ? '' : monthString;
    const yearMainText = yearWidth > insideTextThreshold ? yearString : '';
    const yearOutsideText = yearWidth > insideTextThreshold ? '' : yearString;

    return (
      <div
        style={{
          height: '12vh',
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
          <div style={{ ...energyBar, backgroundColor: '#00FF0055', width: currentWidthString }}>
            <span style={energyText}>{nowMainText}</span>
          </div>
          <div style={restBar}>
            <span style={energyText}>{nowOutsideText}</span>
          </div>
        </div>
        <div style={{ ...energyBarHolder }}>
          <div style={{ ...energyBar, backgroundColor: '#00FF0055', width: dayWidthString }}>
            <span style={energyText}>{dayMainText}</span>
          </div>
          <div style={restBar}>
            <span style={energyText}>{dayOutsideText}</span>
          </div>
        </div>
        <div style={{ ...energyBarHolder }}>
          <div style={{ ...energyBar, backgroundColor: '#00FF0044', width: monthWidthString }}>
            <span style={energyText}>{monthMainText}</span>
          </div>
          <div style={restBar}>
            <span style={energyText}>{monthOutsideText}</span>
          </div>
        </div>
        <div style={{ ...energyBarHolder }}>
          <div style={{ ...energyBar, backgroundColor: '#00FF0033', width: yearWidthString }}>
            <span style={energyText}>{yearMainText}</span>
          </div>
          <div style={restBar}>
            <span style={energyText}>{yearOutsideText}</span>
          </div>
        </div>
        <div style={{ ...energyBarHolder }}>
          <div style={{ ...energyBar, backgroundColor: '#00FF0022', width: everWidthString }}>
            <span style={energyText}>max: {ever} W</span>
          </div>
          <div style={restBar}>
            <span style={energyText}>{yearOutsideText}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default MaxEnergyGraph;
