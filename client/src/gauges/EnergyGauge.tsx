import * as React from 'react';
import * as d3 from 'd3';
import { GenericProps } from '../types/generic';

interface Props {
  value: number;
  max: number;
  title?: string;
  average: number;
}

const arc = d3.arc();

interface Angles {
  startAngle: number;
  endAngle: number;
  averageAngle: number;
  totalAngle: number;
}

class EnergyGauge extends React.PureComponent<Props, GenericProps> {
  public constructor(props: Props) {
    super(props);
  }

  private getAngles(): Angles {
    const percentFilled = Math.abs(this.props.value) / this.props.max;
    const percentAverage = Math.abs(this.props.average) / this.props.max;

    const startAngle = 1.5 * Math.PI;
    const totalAngle = startAngle + Math.PI;
    // If it's full it's full.
    const endAngle = Math.min(startAngle + Math.PI * percentFilled, startAngle + Math.PI);
    const averageAngle = Math.min(startAngle + Math.PI * percentAverage, startAngle + Math.PI);

    return { startAngle, endAngle, averageAngle, totalAngle };
  }

  public render(): React.ReactNode {
    const { startAngle, endAngle, averageAngle, totalAngle } = this.getAngles();

    const bg = arc({
      innerRadius: 40,
      outerRadius: 48,
      startAngle,
      endAngle: totalAngle,
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
