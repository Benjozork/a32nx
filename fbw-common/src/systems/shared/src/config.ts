/** Mapping from FBW config weather providers to FBW API weather sources. */
export enum ConfigWeatherMap {
  FAA = 'faa',
  IVAO = 'ivao',
  MSFS = 'ms',
  NOAA = 'aviationweather',
  PILOTEDGE = 'pilotedge',
  VATSIM = 'vatsim',
}

export type MetarSource = 'MSFS' | 'NOAA' | 'PILOTEDGE' | 'VATSIM';
