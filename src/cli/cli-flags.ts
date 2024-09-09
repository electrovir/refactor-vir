/** Default value for {@link CliFlags}. */
export const defaultCliFlags = {
    last: false,
};

/** Flags to controlling refactor-vir functionality across all commands. */
export type CliFlags = typeof defaultCliFlags;
