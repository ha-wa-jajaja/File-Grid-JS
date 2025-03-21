// import type { SelectedIdsModel } from "@/types/types";
// import type { Ref } from "vue";
import { SelectedModelActions } from "../../types";

export type FgSelectionArgsBase<T> = {
    targetId?: T;
    allIds: T[];
    selectedIds: Set<T>;
};

export const useFgSelection = <T>() => {
    function getUpdatedIdModel({
        action,
        targetId,
        allIds,
        selectedIds,
    }: FgSelectionArgsBase<T> & { action: SelectedModelActions }): Set<T> {
        const res = new Set(selectedIds);

        if (action === "clear") {
            return new Set();
        }

        if (!targetId) throw new Error("Missing ID for action " + action);

        switch (action) {
            case "select":
                return new Set([targetId]);

            case "add-multi":
                handleMultiSelection({
                    targetId,
                    allIds,
                    selectedIds: res,
                });

            case "append":
                res.add(targetId);
                break;

            case "delete":
                res.delete(targetId);
                break;
        }

        return res;
    }

    function handleMultiSelection({
        targetId,
        allIds,
        selectedIds,
    }: FgSelectionArgsBase<T>) {
        const selectedItemIndexes: number[] = [];
        let targetIdIdx = -1;
        let firstItemIdx = Infinity;
        let lastItemIdx = -1;

        allIds.forEach((id, idx) => {
            if (selectedIds.has(id)) {
                selectedItemIndexes.push(idx);
                firstItemIdx = Math.min(firstItemIdx, idx);
                lastItemIdx = Math.max(lastItemIdx, idx);
            }
            if (id === targetId) targetIdIdx = idx;
        });

        if ([firstItemIdx, lastItemIdx, targetIdIdx].some((n) => n < 0))
            throw new Error("Selected list has mismatch with allIds list");

        let itemsToAdd;
        if (targetIdIdx < firstItemIdx) {
            itemsToAdd = allIds.slice(targetIdIdx, lastItemIdx);
        } else {
            const startIdx =
                targetIdIdx < lastItemIdx ? targetIdIdx : lastItemIdx + 1;
            const endIdx =
                targetIdIdx < lastItemIdx ? lastItemIdx : targetIdIdx + 1;

            itemsToAdd = allIds.slice(startIdx, endIdx);
        }

        itemsToAdd.forEach((i) => selectedIds.add(i));
    }

    return { getUpdatedIdModel };
};
