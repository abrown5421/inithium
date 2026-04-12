export const cn = (...inputs) => {
    return inputs
        .flat(Infinity)
        .filter(Boolean)
        .join(' ')
        .trim()
        .replace(/\s+/g, ' ');
};
