// 목록 화면의 상태를 컴포넌트 밖(모듈)에 보관하는 저장소.
// 목록 화면을 떠났다가 돌아와도 보던 목록과 스크롤 위치가 그대로 유지되고,
// 서버 요청은 모두 백그라운드에서 조용히 진행됨 (로딩 표시 없음)
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { LocalClip, onLocalClipsChange } from "./localStore";
import {
  getClips,
  listPendingClips,
  onClipsSynced,
  onClipUpdated,
} from "./repository";
import { IClip } from "./types";

export const PAGE_SIZE = 30;
const CACHE_KEY = "myc:recentClips";

interface State {
  // 마지막으로 확인된 사용자 uid. undefined면 아직 확인 전 (캐시 기준으로 표시 중)
  uid: string | null | undefined;
  // 서버 클립. 오래된 것부터 정렬
  serverClips: IClip[];
  // 브라우저에만 있고 아직 서버에 올라가지 않은 클립
  localClips: IClip[];
  // 더 오래된 클립이 서버에 남아 있을 수 있는지
  hasMore: boolean;
  // 화면에 보여줄 목록 (서버 + 로컬, 오래된 것부터)
  clips: IClip[];
}

const byDate = (a: IClip, b: IClip) => (a.createDatetime ?? 0) - (b.createDatetime ?? 0);

const merge = (serverClips: IClip[], localClips: IClip[]) => {
  // 같은 id가 양쪽에 있으면(업로드 직후 등) 로컬 쪽을 우선
  const localIds = new Set(localClips.map((clip) => clip.id));
  return [...serverClips.filter((clip) => !localIds.has(clip.id)), ...localClips].sort(byDate);
};

// 최근 페이지를 브라우저에 저장해 두었다가, 앱을 열면 서버 응답을 기다리지 않고 바로 보여줌
const readCache = (): { uid: string; clips: IClip[] } | undefined => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

const writeCache = (uid: string, serverClips: IClip[]) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ uid, clips: serverClips.slice(-PAGE_SIZE) })
    );
  } catch {
    // 저장 공간 부족 등은 무시 (캐시는 있으면 좋은 정도)
  }
};

const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {}
};

const cached = readCache();
let state: State = {
  uid: undefined,
  serverClips: cached?.clips ?? [],
  localClips: [],
  hasMore: true,
  clips: cached?.clips ?? [],
};
// 캐시가 어느 계정의 것인지. 인증이 확인되면 실제 계정과 비교함
let cachedUid = cached?.uid;

const listeners = new Set<() => void>();

const setState = (next: Partial<State>) => {
  const serverClips = next.serverClips ?? state.serverClips;
  const localClips = next.localClips ?? state.localClips;
  state = { ...state, ...next, clips: merge(serverClips, localClips) };
  listeners.forEach((listener) => listener());
};

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getState = () => state;

// 목록 화면의 스크롤 위치. undefined면 아직 목록 화면을 연 적 없음 → 맨 아래(최신)부터 보여줌.
// 맨 아래를 보고 있었다면 돌아왔을 때도 맨 아래로 (그 사이 새로 저장한 클립이 보이도록)
type ScrollPosition = { y: number; atBottom: boolean };
let savedScroll: ScrollPosition | undefined;
export const getSavedScroll = () => savedScroll;
export const saveScroll = (position: ScrollPosition) => {
  savedScroll = position;
};

/**
 * 최신 페이지를 다시 가져와 목록에 합침. 이미 불러온 오래된 클립은 그대로 두고,
 * 최신 페이지 범위 안에서 서버에 없는 클립(다른 기기에서 삭제 등)은 빠짐
 */
export const refreshLatest = async () => {
  const uid = state.uid;
  if (!uid) return;
  let latest: IClip[];
  try {
    latest = (await getClips(PAGE_SIZE)).reverse();
  } catch (e) {
    // 오프라인 등. 지금 보이는 목록을 그대로 유지
    console.error(e);
    return;
  }
  if (state.uid !== uid) return;

  const isFullPage = latest.length === PAGE_SIZE;
  const rangeStart = isFullPage ? latest[0].createDatetime ?? 0 : -Infinity;
  const latestIds = new Set(latest.map((clip) => clip.id));
  const older = state.serverClips.filter(
    (clip) => (clip.createDatetime ?? 0) < rangeStart && !latestIds.has(clip.id)
  );
  const serverClips = [...older, ...latest];
  // 처음 불러오는 경우에만 hasMore를 새로 정함. 이미 더 불러온 상태면 유지
  const hasMore = older.length === 0 ? isFullPage : state.hasMore;
  setState({ serverClips, hasMore });
  writeCache(uid, serverClips);
};

let loadingOlder = false;

// 지금 목록의 가장 오래된 클립보다 이전 클립을 가져와 앞에 붙임
export const loadOlder = async () => {
  const uid = state.uid;
  if (!uid || loadingOlder || !state.hasMore) return;
  const oldest = state.serverClips[0]?.createDatetime;
  loadingOlder = true;
  try {
    const older = (await getClips(PAGE_SIZE, oldest)).reverse();
    if (state.uid !== uid) return;
    const ids = new Set(state.serverClips.map((clip) => clip.id));
    setState({
      serverClips: [...older.filter((clip) => !ids.has(clip.id)), ...state.serverClips],
      hasMore: older.length === PAGE_SIZE,
    });
  } catch (e) {
    console.error(e);
  } finally {
    loadingOlder = false;
  }
};

export const removeClip = (id: string) => {
  const serverClips = state.serverClips.filter((clip) => clip.id !== id);
  setState({
    serverClips,
    localClips: state.localClips.filter((clip) => clip.id !== id),
  });
  if (state.uid) writeCache(state.uid, serverClips);
};

let objectUrls: string[] = [];

const toClip = (record: LocalClip): IClip => {
  let imageUrl: string | undefined;
  if (record.file) {
    imageUrl = URL.createObjectURL(record.file);
    objectUrls.push(imageUrl);
  }
  return {
    id: record.id,
    userId: record.ownerUid ?? "",
    username: "",
    createDatetime: record.createDatetime,
    type: record.type,
    text: record.text,
    imageUrl,
    pending: true,
  };
};

const loadLocalClips = async () => {
  try {
    const records = await listPendingClips();
    const previousUrls = objectUrls;
    objectUrls = [];
    setState({ localClips: records.map(toClip) });
    previousUrls.forEach((url) => URL.revokeObjectURL(url));
  } catch (e) {
    console.error(e);
  }
};

// 로그인/로그아웃(최초 확인 포함) 시 계정에 맞게 목록을 다시 구성
onAuthStateChanged(auth, (user) => {
  const uid = user?.uid ?? null;
  if (uid !== state.uid) {
    // 캐시가 같은 계정 것이면 그대로 두고 백그라운드로 갱신, 다른 계정이면 비움
    const keep = state.uid === undefined && uid !== null && cachedUid === uid;
    if (!keep) {
      savedScroll = undefined;
      if (uid === null) clearCache();
    }
    cachedUid = uid ?? undefined;
    setState({
      uid,
      serverClips: keep ? state.serverClips : [],
      hasMore: true,
    });
  }
  loadLocalClips();
  refreshLatest();
});

onLocalClipsChange(loadLocalClips);

// 동기화로 서버에 올라간 클립은 서버 목록에 추가 (로컬 목록에서는 change 이벤트로 빠짐)
onClipsSynced((synced) => {
  const ids = new Set(state.serverClips.map((clip) => clip.id));
  const serverClips = [...state.serverClips, ...synced.filter((clip) => !ids.has(clip.id))].sort(
    byDate
  );
  setState({ serverClips });
  if (state.uid) writeCache(state.uid, serverClips);
});

// 수정 화면에서 고친 내용을 목록에 반영 (목록으로 돌아왔을 때 바로 보이도록)
onClipUpdated(({ id, text }) => {
  if (!state.serverClips.some((clip) => clip.id === id)) return;
  const serverClips = state.serverClips.map((clip) => (clip.id === id ? { ...clip, text } : clip));
  setState({ serverClips });
  if (state.uid) writeCache(state.uid, serverClips);
});
