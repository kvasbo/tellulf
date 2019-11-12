import * as React from 'react';
import d3 from './d3Importer';

interface Props {
  value: number;
  max: number;
  title?: string;
  average: number;
}

const arc = d3.arc();

class EnergyGauge extends React.PureComponent<Props, {}> {
  public constructor(props: Props) {
    super(props);
  }

  public render() {
    const percentFilled = Math.abs(this.props.value) / this.props.max;
    const percentAverage = Math.abs(this.props.average) / this.props.max;

    const startAngle = 1.5 * Math.PI;
    // If it's full it's full.
    const endAngle = Math.min(startAngle + Math.PI * percentFilled, startAngle + Math.PI);
    const averageAngle = Math.min(startAngle + Math.PI * percentAverage, startAngle + Math.PI);

    const bg = arc({
      innerRadius: 40,
      outerRadius: 48,
      startAngle,
      endAngle: startAngle + Math.PI,
    });

    const p = arc({
      innerRadius: 40,
      outerRadius: 48,
      startAngle,
      endAngle,
    });

    const avg = arc({
      innerRadius: 40,
      outerRadius: 48,
      startAngle,
      endAngle: averageAngle,
    });

    // Yeah yeah yeah
    if (!p || !bg || !avg) return null;

    const fillColor = this.props.value > 0 ? 'red' : 'green';

    return (
      <div style={{ height: '100%', width: '100%', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '8pt', color: '#FFFFFF99' }}>
            {this.props.title ? this.props.title : ''}
          </span>
          <span>{this.props.value}</span>
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          style={{ transition: 'all 500ms' }}
        >
          {/* Background */}
          <path
            d={bg}
            transform={`translate(50, 50)`}
            stroke="white"
            fill="none"
            strokeWidth="1"
            strokeLinecap="butt"
          />
          {/* Current */}
          <path
            d={p}
            transform={`translate(50, 50)`}
            stroke="white"
            fill={fillColor}
            strokeWidth="1"
            strokeLinecap="butt"
          />
          {/* Average */}
          <path
            d={avg}
            transform={`translate(50, 50)`}
            stroke="white"
            fill="none"
            strokeWidth="1"
            strokeLinecap="butt"
          />
        </svg>
      </div>
    );
  }
}

export default EnergyGauge;
