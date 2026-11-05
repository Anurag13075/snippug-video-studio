/**
 * Browser-only Zero-Cost Media Storage Layer
 * Uses Origin Private File System (OPFS) with IndexedDB fallback.
 * Video bytes NEVER hit any server or paid cloud bucket.
 */

export interface StoredProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  type?: "reaction" | "clips";
  layout?: "split-top-bottom" | "split-bottom-top" | "pip-bottom-right" | "pip-bottom-left" | "side-by-side";
  sourceName?: string;
  reactionName?: string;
  sourceVolume?: number;
  reactionVolume?: number;
  fileName: string;
  fileSize: number;
  fileHash: string;
  duration: number;
  aspect: "9:16" | "1:1" | "16:9";
  captionSettings: {
    style: string;
    fontSize: number;
    color: string;
    position: string;
    fontFamily: string;
  };
  transcript?: {
    text: string;
    words: Array<{ word: string; start: number; end: number }>;
  };
  clips?: Array<{
    id: string;
    start: number;
    end: number;
    title: string;
    score: number;
    hook: string;
    reason: string;
    topic?: string;
    badge?: string;
    subscores?: {
      hook: number;
      story: number;
      payoff: number;
      clarity: number;
      ending: number;
    };
    duration?: number;
    selected?: boolean;
  }>;
  generationSettings?: {
    clipLength?: string;
    clipCount?: string;
    language?: string;
    instructions?: string;
  };
  status?: "processing" | "ready" | "error";
}

const DB_NAME = "snippug_browser_db";
const DB_VERSION = 1;
const STORE_PROJECTS = "projects";
const STORE_MEDIA_FALLBACK = "media_blobs";

let dbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_MEDIA_FALLBACK)) {
          db.createObjectStore(STORE_MEDIA_FALLBACK, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

/**
 * Check if Origin Private File System (OPFS) is available
 */
async function getOPFSRoot(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof navigator !== "undefined" && navigator.storage?.getDirectory) {
    try {
      return await navigator.storage.getDirectory();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Compute SHA-256 hash of a file or blob slice for content addressing
 */
export async function computeFileHash(blob: Blob): Promise<string> {
  // Read first 2MB and last 2MB for fast hash of large videos
  const size = blob.size;
  const chunkLen = Math.min(size, 2 * 1024 * 1024);
  const head = await blob.slice(0, chunkLen).arrayBuffer();
  const tail = size > chunkLen ? await blob.slice(Math.max(0, size - chunkLen), size).arrayBuffer() : new ArrayBuffer(0);

  const combined = new Uint8Array(head.byteLength + tail.byteLength);
  combined.set(new Uint8Array(head), 0);
  combined.set(new Uint8Array(tail), head.byteLength);

  const hashBuf = await crypto.subtle.digest("SHA-256", combined);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Save video media file in browser storage (OPFS or IndexedDB)
 */
export async function saveMediaFile(mediaId: string, file: Blob): Promise<void> {
  const root = await getOPFSRoot();
  if (root) {
    try {
      const fileHandle = await root.getFileHandle(`video_${mediaId}`, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();
      return;
    } catch (e) {
      console.warn("OPFS write failed, falling back to IndexedDB:", e);
    }
  }

  // Fallback to IndexedDB
  const db = await getIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEDIA_FALLBACK, "readwrite");
    tx.objectStore(STORE_MEDIA_FALLBACK).put({ id: mediaId, blob: file });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieve video media file from browser storage
 */
export async function getMediaFile(mediaId: string): Promise<Blob | null> {
  const root = await getOPFSRoot();
  if (root) {
    try {
      const fileHandle = await root.getFileHandle(`video_${mediaId}`);
      return await fileHandle.getFile();
    } catch {
      // not in OPFS, check IDB
    }
  }

  const db = await getIDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_MEDIA_FALLBACK, "readonly");
    const req = tx.objectStore(STORE_MEDIA_FALLBACK).get(mediaId);
    req.onsuccess = () => resolve(req.result?.blob ?? null);
    req.onerror = () => resolve(null);
  });
}

/**
 * Delete a media file from browser storage
 */
export async function deleteMediaFile(mediaId: string): Promise<void> {
  const root = await getOPFSRoot();
  if (root) {
    try {
      await root.removeEntry(`video_${mediaId}`);
    } catch {
      /* ignore */
    }
  }

  const db = await getIDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_MEDIA_FALLBACK, "readwrite");
    tx.objectStore(STORE_MEDIA_FALLBACK).delete(mediaId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

/**
 * Save Project Metadata in IndexedDB
 */
export async function saveProject(project: StoredProject): Promise<void> {
  const db = await getIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, "readwrite");
    tx.objectStore(STORE_PROJECTS).put(project);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get single project by ID
 */
export async function getProject(id: string): Promise<StoredProject | null> {
  const db = await getIDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_PROJECTS, "readonly");
    const req = tx.objectStore(STORE_PROJECTS).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => resolve(null);
  });
}

/**
 * Get all saved projects
 */
export async function getAllProjects(): Promise<StoredProject[]> {
  const db = await getIDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_PROJECTS, "readonly");
    const req = tx.objectStore(STORE_PROJECTS).getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => resolve([]);
  });
}

/**
 * Get storage estimate (usage and quota)
 */
export async function getStorageEstimate(): Promise<{
  usageMb: number;
  quotaMb: number;
  percentUsed: number;
}> {
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate();
      const usageMb = Math.round((est.usage || 0) / (1024 * 1024));
      const quotaMb = Math.round((est.quota || 1024 * 1024 * 1024) / (1024 * 1024));
      const percentUsed = quotaMb > 0 ? Math.round((usageMb / quotaMb) * 100) : 0;
      return { usageMb, quotaMb, percentUsed };
    } catch {
      /* ignore */
    }
  }
  return { usageMb: 0, quotaMb: 5000, percentUsed: 0 };
}
