import type { SelectedModelActions } from "../../types";

type FgItemClickActionsReturnType = SelectedModelActions | null;
export const useFgItemClickChain = () => {
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

    return { onFgItemMouseDown, onFgItemClick };
};
