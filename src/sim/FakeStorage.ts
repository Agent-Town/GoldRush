export class FakeStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null {
    const scoped = this.scopedKey(key);
    return this.data.get(scoped) ?? this.data.get(key) ?? null;
  }
  key(index: number): string | null { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string): void {
    this.data.delete(this.scopedKey(key));
    this.data.delete(key);
  }
  setItem(key: string, value: string): void { this.data.set(this.scopedKey(key), String(value)); }

  private scopedKey(key: string): string {
    if (!key.startsWith('gr.') || key === 'gr.profile.v2' || key.startsWith('gr.profile.v2.')) return key;
    try {
      const state = JSON.parse(this.data.get('gr.profile.v2') ?? 'null');
      return typeof state?.activeId === 'string' ? `gr.profile.v2.${state.activeId}.${key}` : key;
    } catch {
      return key;
    }
  }
}
