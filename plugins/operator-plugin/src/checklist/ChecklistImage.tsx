type ChecklistImageProps = {
    src?: string;
    label: string;
};

/**
 * No real illustrations exist yet (separate task). Shows a plain dashed box
 * until an item gets a real `imageSrc` -- swapping that in is the entire
 * integration, no change needed here.
 */
const ChecklistImage = ({ src, label }: ChecklistImageProps) => {
    if (src) {
        return (
            <img
                src={src}
                alt={label}
                className="h-16 w-16 flex-shrink-0 rounded object-cover"
            />
        );
    }
    return (
        <div
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded border border-dashed border-gray-300 text-[10px] text-gray-400 dark:border-gray-700"
            aria-hidden="true"
        >
            image
        </div>
    );
};

export default ChecklistImage;
