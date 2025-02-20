import type { SelectedModelActions } from "../../types";
import MultiSelectionBackboard from "../../components/MultiSelectionBoard";

export type FgItemActions = ReturnType<typeof useFgItemActions>;

type FgItemClickActionsReturnType = SelectedModelActions | null;
export const useFgItemActions = () => {
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
        selectedItems: Set<string>,
        multiSelectionBackboard: MultiSelectionBackboard
    ) {
        event.stopPropagation();
        event.stopImmediatePropagation();

        console.log(selectedItems.size);

        if (selectedItems.size > 1) {
            event.dataTransfer?.setDragImage(
                multiSelectionBackboard.el,
                50,
                50
            );
        }

        // TODO: Apply internal dragging at the place that calls this function
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
