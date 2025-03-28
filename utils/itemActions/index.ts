import type { SelectedModelActions } from "../../types";

export type FgItemActions = ReturnType<typeof useFgItemActions>;

type FgItemClickActionsReturnType = SelectedModelActions | null;
export const useFgItemActions = <T>() => {
    let isMouseDownAction = false;

    function onFgItemMouseDown(
        e: MouseEvent,
        selected: boolean
    ): FgItemClickActionsReturnType {
        e.stopPropagation();
        if (selected) return null;

        isMouseDownAction = true;
        let action: SelectedModelActions = "select";

        if (e.ctrlKey || e.metaKey) {
            action = "append";
        }

        if (e.shiftKey) {
            action = "add-multi";
        }

        return action;
    }

    function onFgItemClick(): FgItemClickActionsReturnType {
        if (isMouseDownAction) {
            isMouseDownAction = false;
            return null;
        }

        return "select";
    }

    function onFgItemDragStart(
        event: DragEvent,
        selectedItems: Set<T>,
        multiSelectionBackboard: HTMLElement
    ) {
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (selectedItems.size > 1) {
            event.dataTransfer?.setDragImage(multiSelectionBackboard, 50, 50);
        }

        return { dragging: true };
    }

    function onFgItemDragEnd() {
        return { dragging: false };
    }

    return {
        onFgItemMouseDown,
        onFgItemClick,
        onFgItemDragStart,
        onFgItemDragEnd,
    };
};
