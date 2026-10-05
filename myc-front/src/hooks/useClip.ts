import { useSyncExternalStore } from "react";
import { getState, loadOlder, refreshLatest, removeClip, subscribe } from "../clipStore";

// 목록 상태는 clipStore에 있으므로 화면을 다시 열어도 그대로 유지됨
export default function useClip() {
  const { clips, hasMore } = useSyncExternalStore(subscribe, getState);
  return { clips, hasMore, loadOlder, refreshLatest, removeClip };
}
