export class ResourceNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceNotFoundException';
  }
}

export class StockInsuficienteException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StockInsuficienteException';
  }
}

export class IllegalStateException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IllegalStateException';
  }
}

export class IllegalArgumentException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IllegalArgumentException';
  }
}
