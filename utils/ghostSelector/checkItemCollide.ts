export const useCheckFgItemCollide = () => {
    function getElOffset(el: Element) {
        if (!el) return;

        const rect = el.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft,
        };
    }

    function getElDim(el: Element) {
        if (!el) return;

        const style = getComputedStyle(el);
        return {
            height: parseInt(style.height),
            width: parseInt(style.width),
        };
    }

    function doCheckItemCollide(selector: HTMLElement, item: Element) {
        const selectorTop = getElOffset(selector)?.top;
        const selectorLeft = getElOffset(selector)?.left;
        const itemTop = getElOffset(item)?.top;
        const itemLeft = getElOffset(item)?.left;

        const itemDim = getElDim(item);
        const selectorDim = getElDim(selector);
        if (
            !itemDim ||
            !selectorDim ||
            !selectorTop ||
            !selectorLeft ||
            !itemTop ||
            !itemLeft
        )
            return false;
        return !(
            selectorTop + selectorDim.height < itemTop ||
            selectorTop > itemTop + itemDim.height ||
            selectorLeft + selectorDim.width < itemLeft ||
            selectorLeft > itemLeft + itemDim.width
        );
    }

    return { doCheckItemCollide };
};
