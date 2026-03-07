export class RingBuffer<T> {
  protected buffer: T[] = [];
  protected size: number;
  protected pos = 0;

  constructor(size: number) {
    if (size < 0) {
      throw new RangeError("Invalid size.");
    }
    this.size = size;
  }

  public getSize(): number {
    return this.size;
  }

  public add(...items: T[]): void {
    items.forEach((item) => {
      this.buffer[this.pos] = item;
      this.pos = (this.pos + 1) % this.size;
    });
  }

  public get(index: number): T | undefined {
    if (index < 0) {
      index += this.buffer.length;
    }

    if (index < 0 || index > this.buffer.length) {
      return undefined;
    }

    if (this.buffer.length < this.size) {
      return this.buffer[index];
    }

    return this.buffer[(this.pos + index) % this.size];
  }

  public toArray(): T[] {
    return this.buffer.slice(this.pos).concat(this.buffer.slice(0, this.pos));
  }
}
