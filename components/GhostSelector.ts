import { utils } from "../utils";
import FileGridContainer from "./GridContainer";

class GhostSelector {
    private _el: HTMLElement;

    private _container: FileGridContainer;

    private _itemClass: string;

    constructor(root: HTMLElement | string) {
        const { getElement } = utils();

        // Assign the root element and add the class
        this._el = getElement(root);
        this._el.classList.add("file-grid-ghost-selector");
    }
}
