import { useCheckFgItemCollide } from "./checkItemCollide";
import FileGridItem from "../../src/components/Item";

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
    function checkFgCollidedItems<T>(
        ghostSelector: HTMLElement,
        items: Array<FileGridItem<T> | HTMLElement>,
        allIds: T[]
    ) {
        const res = new Set<T>();

        Array.from(items).forEach((item, index) => {
            if (!item) return;

            const el = item instanceof FileGridItem ? item.el : item;

            const collided = doCheckItemCollide(ghostSelector, el);

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
