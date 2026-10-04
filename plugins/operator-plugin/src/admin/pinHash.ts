const textEncoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');

/** WebCrypto SHA-256 -- the PIN itself is never persisted, only this hash. */
export const hashPin = async (pin: string): Promise<string> => {
    const digest = await crypto.subtle.digest(
        'SHA-256',
        textEncoder.encode(pin),
    );
    return toHex(digest);
};

export const verifyPin = async (
    pin: string,
    storedHash: string,
): Promise<boolean> => (await hashPin(pin)) === storedHash;
