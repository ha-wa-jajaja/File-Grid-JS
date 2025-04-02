/**
 * Determines if auto-scrolling should be triggered based on mouse position
 *
 * @param currentMouseY - Current Y position of the mouse in the element
 * @param scrollerHeight - Height of the scrolling container
 * @param scrollThreshold - Threshold percentage to trigger scrolling
 * @returns An object with shouldScroll and direction properties
 */
export function checkShouldTriggerScroll(
    currentMouseY: number,
    scrollerHeight: number,
    scrollThreshold: number
): {
    shouldScroll: boolean;
    direction: "up" | "down" | null;
    inTopRegion: boolean;
    inBottomRegion: boolean;
} {
    // Calculate threshold boundaries
    const topThreshold = scrollerHeight * scrollThreshold;
    const bottomThreshold = scrollerHeight * (1 - scrollThreshold);

    // Check if mouse is in the scroll trigger regions
    const inTopRegion = currentMouseY >= 0 && currentMouseY <= topThreshold;
    const inBottomRegion =
        currentMouseY >= bottomThreshold && currentMouseY <= scrollerHeight;

    // Determine if scrolling should happen
    const shouldScroll = inTopRegion || inBottomRegion;

    // Determine direction of scroll
    let direction: "up" | "down" | null = null;
    if (inTopRegion) direction = "up";
    if (inBottomRegion) direction = "down";

    return {
        shouldScroll,
        direction,
        inTopRegion,
        inBottomRegion,
    };
}

/**
 * Calculates the scroll amount based on direction and speed
 *
 * @param direction - Direction to scroll ('up' or 'down')
 * @param speed - Speed factor for scrolling
 * @returns The amount to scroll
 */
export function calculateScrollAmount(
    direction: "up" | "down" | null,
    speed: number
): number {
    if (!direction) return 0;
    return direction === "up" ? -speed : speed;
}
