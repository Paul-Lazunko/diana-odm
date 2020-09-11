import { IGeo } from './IGeo';

interface ICircleOptions {
  center: IGeo,
  radius: number
}

interface ILinesOptions {
  lines: IGeo[][],
  distance: number
}

export interface IGeoQuery {
  $insideCircle?: ICircleOptions,
  $outsideCircle?: ICircleOptions,
  $nearLines?: ILinesOptions,
  $farFromLines?: ILinesOptions,
  $insidePolygon?: IGeo[],
  $outsidePolygon?: IGeo[],
}
