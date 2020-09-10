export class ErrorFactory {

  protected static construct(message: string) {
    return new Error(message);
  }

  public static collectionError(message: string) {
    return ErrorFactory.construct(`Collection Error: ${message}`);
  }

  public static databaseError(message: string) {
    return ErrorFactory.construct(`Database Error: ${message}`);
  }

  public static configurationError(message: string) {
    return ErrorFactory.construct(`Configuration Error: ${message}`);
  }

  public static optionsError(message: string) {
    return ErrorFactory.construct(`Options Error: ${message}`);
  }

  public static transactionError(message: string) {
    return ErrorFactory.construct(`Transaction Error: ${message}`);
  }

  public static filtrationError(message: string) {
    return ErrorFactory.construct(`Filtration Error: ${message}`);
  }

  public static transformError(message: string) {
    return ErrorFactory.construct(`Transform Error: ${message}`);
  }

  public static restoreError(message: string) {
    return ErrorFactory.construct(`Restore Error: ${message}`);
  }


}
