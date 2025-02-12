// import { utils } from "..";

// import MultiSelectionBackboard from "../../components/MultiSelectionBoard";

// type UseVFgItemDragChainProps = {
//     selectedItemsCount: Ref<number>;
//     internalDragSetter: ((bool: boolean) => void) | null;
//     multiSelectionBackboard: Ref<HTMLElement | null>;
//     scroller: Ref<VFgAutoScrollEl>;
//     scrollConfig: VFgAutoScrollConfig;
// };

// export const useFgItemDragChain = ({
//     selectedItemsCount,
//     internalDragSetter,
//     multiSelectionBackboard,
//     scroller,
//     scrollConfig,
// }: UseVFgItemDragChainProps) => {
//     const { clamp } = utils();

//     function onFgItemDragStart(
//         event: DragEvent,
//         selectedItems: Set<string>,
//         multiSelectionBackboard: MultiSelectionBackboard
//     ) {
//         event.stopPropagation();
//         event.stopImmediatePropagation();

//         if (selectedItems.size > 1) {
//             event.dataTransfer?.setDragImage(
//                 multiSelectionBackboard.el,
//                 50,
//                 50
//             );
//         }

//         // TODO: Apply internal dragging at the place that calls this function
//         return { dragging: true };
//     }

//     function onDragEnd() {
//         isDragging.value = false;
//         if (internalDragSetter) internalDragSetter(false);
//         clearMoveDragAnim();
//     }

//     return { onFgItemDragStart, onDragEnd };
// };
