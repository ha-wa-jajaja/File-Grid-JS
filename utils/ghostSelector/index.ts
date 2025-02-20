import { useCheckFgItemCollide } from "./checkItemCollide";

export type GhostSelectorUtilsReturnType = {
    active: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
};

export const useFgGhostSelector = () => {
    let doingGhostSelect = false;
    let ghostSelectInitX = 0;
    let ghostSelectInitY = 0;

    function toggleFgGhostSelect(
        enable: boolean,
        e: MouseEvent
    ): GhostSelectorUtilsReturnType {
        doingGhostSelect = enable;

        const res: GhostSelectorUtilsReturnType = {
            active: enable,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };

        if (enable) {
            res.x = e.clientX;
            res.y = e.clientY;
            ghostSelectInitX = e.clientX;
            ghostSelectInitY = e.clientY;
        } else {
            res.width = 0;
            res.height = 0;
            res.x = 0;
            res.y = 0;
            ghostSelectInitX = 0;
            ghostSelectInitY = 0;
        }

        return res;
    }

    function endFgGhostSelect() {
        doingGhostSelect = false;
    }

    function updateFgGhostSelectFrame(x: number, y: number) {
        if (!doingGhostSelect) return;

        const res: GhostSelectorUtilsReturnType = {
            active: true,
            x: ghostSelectInitX,
            y: ghostSelectInitY,
            width: 0,
            height: 0,
        };

        const w = Math.abs(ghostSelectInitX - x);
        const h = Math.abs(ghostSelectInitY - y);

        res.width = w;
        res.height = h;

        if (x <= ghostSelectInitX && y >= ghostSelectInitY) {
            res.x = x;
        } else if (y <= ghostSelectInitY && x >= ghostSelectInitX) {
            res.y = y;
        } else if (y < ghostSelectInitY && x < ghostSelectInitX) {
            res.x = x;
            res.y = y;
        }

        return res;
    }

    const { doCheckItemCollide } = useCheckFgItemCollide();
    function checkFgCollidedItems(
        ghostSelector: HTMLElement,
        itemClassName: string,
        allIds: string[],
        selectedIds: Set<string>
    ) {
        const itemEls = document.querySelectorAll("." + itemClassName);
        const res = new Set<string>();

        Array.from(itemEls).forEach((item, index) => {
            if (!item) return;

            const collided = doCheckItemCollide(ghostSelector, item);

            const itemId = allIds[index];
            if (!itemId) throw new Error("Item id is not found");

            if (collided) {
                res.add(itemId);
            }
        });

        return res;
    }

    return {
        toggleFgGhostSelect,
        updateFgGhostSelectFrame,
        checkFgCollidedItems,
        endFgGhostSelect,
    };
};
