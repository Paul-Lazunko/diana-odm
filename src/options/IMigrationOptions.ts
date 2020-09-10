export interface IMigrationOptions {
  name: string,
  up: () => Promise<void>,
  down: () => Promise<void>,
}
