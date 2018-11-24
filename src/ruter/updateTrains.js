import axios from 'axios';

export default async function getTrains(station, direction) {
  const trainData = await getRuterData(station, direction);
  return trainData;
}

async function getRuterData(station, direction) {
  const trains = {};

  try {
    const url = `https://reisapi.ruter.no/StopVisit/GetDepartures/${station}?json=true`;
    const result = await axios.get(url);
    const jsonData = result.data;

    if (result.status !== 200) throw Error('Couldnt fetch ruter data');

    jsonData.forEach((t) => {
      if (t.MonitoredVehicleJourney.MonitoredCall.DeparturePlatformName === direction) {
        const d = t.MonitoredVehicleJourney.MonitoredCall;
        const out = {};
        out.ruteTid = new Date(d.AimedArrivalTime);
        out.faktiskTid = new Date(d.ExpectedArrivalTime);
        out.id = `${t.MonitoredVehicleJourney.FramedVehicleJourneyRef.DataFrameRef}_${t.MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef}`;
        out.linje = t.MonitoredVehicleJourney.PublishedLineName;
        out.Endestasjon = t.MonitoredVehicleJourney.DestinationName;
        trains[out.id] = out;
      }
    });
  } catch (err) {
    console.log(err);
  }
  return trains;
}
