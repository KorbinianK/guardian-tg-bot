
import debug from 'debug';

export const getLogger = (namespace: string) => {
    return debug(`guardian-bot:${namespace}`);
}
