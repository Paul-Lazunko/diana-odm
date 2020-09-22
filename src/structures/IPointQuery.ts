import { IPoint } from './IPoint';

interface ICircleOptions {
  center: IPoint,
  radius: number
}

interface ILinesOptions {
  lines: IPoint[][],
  distance: number
}

export interface IPointQuery {
  $insideCircle?: ICircleOptions,
  $outsideCircle?: ICircleOptions,
  $nearLines?: ILinesOptions,
  $farFromLines?: ILinesOptions,
  $insidePolygon?: IPoint[],
  $outsidePolygon?: IPoint[],
}
