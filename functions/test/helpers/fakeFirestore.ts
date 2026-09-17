/**
 * Minimal in-memory Firestore stand-in for unit tests — not a rules test
 * (those live in tests/rules/ against the real emulator + rules file). This
 * only needs to support the handful of operations the Cloud Functions in
 * src/ actually call: doc get/set/update, collection add/where/get, batch,
 * and runTransaction.
 */
type DocData = Record<string, unknown>;

class FakeDocRef {
  constructor(
    private store: Map<string, DocData>,
    public id: string,
    public path: string,
  ) {}

  async get() {
    const data = this.store.get(this.path);
    return { exists: data !== undefined, data: () => data, id: this.id, ref: this };
  }

  async set(data: DocData, opts?: { merge?: boolean }) {
    const existing = this.store.get(this.path) ?? {};
    this.store.set(this.path, opts?.merge ? { ...existing, ...data } : data);
  }

  async update(data: DocData) {
    const existing = this.store.get(this.path);
    if (existing === undefined) {
      throw new Error('NOT_FOUND: ' + this.path);
    }
    this.store.set(this.path, { ...existing, ...data });
  }
}

class FakeQuery {
  constructor(
    private store: Map<string, DocData>,
    private name: string,
    private filters: Array<[string, unknown]> = [],
  ) {}

  where(field: string, _op: string, value: unknown) {
    return new FakeQuery(this.store, this.name, [...this.filters, [field, value]]);
  }

  async get() {
    const docs = [...this.store.entries()]
      .filter(([path]) => path.startsWith(`${this.name}/`))
      .filter(([, data]) => this.filters.every(([field, value]) => data[field] === value))
      .map(([path, data]) => ({ id: path.slice(this.name.length + 1), data: () => data }));
    return { docs, empty: docs.length === 0 };
  }
}

class FakeCollectionRef extends FakeQuery {
  constructor(
    private storeRef: Map<string, DocData>,
    private collectionName: string,
  ) {
    super(storeRef, collectionName);
  }

  doc(id?: string): FakeDocRef {
    const docId = id ?? `auto-${Math.random().toString(36).slice(2)}`;
    return new FakeDocRef(this.storeRef, docId, `${this.collectionName}/${docId}`);
  }

  async add(data: DocData) {
    const ref = this.doc();
    await ref.set(data);
    return ref;
  }
}

class FakeTransaction {
  constructor(private store: Map<string, DocData>) {}
  get(ref: FakeDocRef) {
    return ref.get();
  }
  set(ref: FakeDocRef, data: DocData, opts?: { merge?: boolean }) {
    const existing = this.store.get(ref.path) ?? {};
    this.store.set(ref.path, opts?.merge ? { ...existing, ...data } : data);
  }
  update(ref: FakeDocRef, data: DocData) {
    const existing = this.store.get(ref.path);
    if (existing === undefined) {
      throw new Error('NOT_FOUND: ' + ref.path);
    }
    this.store.set(ref.path, { ...existing, ...data });
  }
}

class FakeFirestore {
  store = new Map<string, DocData>();

  collection(name: string) {
    return new FakeCollectionRef(this.store, name);
  }

  batch() {
    const ops: Array<() => void> = [];
    return {
      set: (ref: FakeDocRef, data: DocData) => ops.push(() => this.store.set(ref.path, data)),
      update: (ref: FakeDocRef, data: DocData) =>
        ops.push(() => {
          const existing = this.store.get(ref.path) ?? {};
          this.store.set(ref.path, { ...existing, ...data });
        }),
      commit: async () => ops.forEach((op) => op()),
    };
  }

  async runTransaction<T>(fn: (tx: FakeTransaction) => Promise<T>): Promise<T> {
    return fn(new FakeTransaction(this.store));
  }
}

let instance: FakeFirestore | null = null;

export function getFirestore() {
  instance ??= new FakeFirestore();
  return instance;
}

export function __resetFakeFirestore() {
  instance = null;
}

export const FieldValue = { serverTimestamp: () => 'SERVER_TIMESTAMP' };
export const Timestamp = { now: () => ({ toDate: () => new Date('2026-09-16T00:00:00.000Z') }) };
