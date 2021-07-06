export class MarkdownTable<T extends string> {
  constructor(
    public tableName: string,
    public headers: readonly T[],
    public rows: Record<T, unknown>[] = [],
  ) {}

  addRow(row: Record<T, unknown>) {
    this.rows.push(row)
  }

  toString() {
    return [
      `# ${this.tableName}`,
      '',
      this.headers.join('|'),
      this.headers.map(() => '---').join('|'),
      ...this.rows.map((row) => this.headers.map((header) => row[header]).join('|')),
    ].join('\n')
  }
}
