export declare enum status {
    TIMEOUT = 0
}
export declare function wait_until(f: () => boolean, timeout?: number, rate?: number): Promise<unknown>;
export declare function wait(t: number): Promise<unknown>;
