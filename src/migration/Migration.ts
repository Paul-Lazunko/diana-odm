import { IMigrationOptions } from '../options';

export class Migration {

  protected options: IMigrationOptions;

  constructor(options: IMigrationOptions) {
   this.options = options;
  }

  public get name() {
    return this.options.name;
  }

  public get up() {
    return this.options.up;
  }

  public get down() {
    return this.options.down;
  }

}
