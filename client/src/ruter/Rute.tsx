import React from 'react';
import { GenericProps } from '../types/generic';
import { ExtendedTrainData, TransportType } from '../types/trains';

interface Props {
  trains: ExtendedTrainData[];
  rutenummer: string;
  type: TransportType;
}

class Rute extends React.PureComponent<Props, GenericProps> {
  private getAvganger(): JSX.Element[] {
    // Filter
    const forMe = this.props.trains.filter((t) => {
      return t.linje === this.props.rutenummer;
    });

    // Sort and cap
    const sorted = forMe
      .sort((a, b) => {
        return a.fromNow - b.fromNow;
      })
      .slice(0, 10);

    const html = sorted.map((t) => {
      const time = t.fromNowM < 15 ? `${t.fromNowM} m` : t.faktiskTid.format('HH:mm');
      return (
        <div key={t.id} className="avgang">
          {time}
        </div>
      );
    });

    return html;
  }

  public render(): JSX.Element | null {
    // eslint-disable-next-line no-console
    const icon = this.props.type === 'Bane' ? '/subway-outline.svg' : '/bus-outline.svg';
    const avganger = this.getAvganger();

    if (avganger.length === 0) {
      return null;
    }

    return (
      <div className="ruterGroup">
        <div className="header">
          <img src={icon} />
        </div>
        <div className="avganger">{this.getAvganger()}</div>
      </div>
    );
  }
}

export default Rute;
