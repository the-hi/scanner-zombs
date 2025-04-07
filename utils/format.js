const format = (number) => {
    return new Intl.NumberFormat("en-GB", {
        notation: "compact",
        compactDisplay: "short"
    }).format(number);
};
export { format };