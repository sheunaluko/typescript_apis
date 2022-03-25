
const {
  createHmac
} = await import('crypto');

export type HmacParams = {
    'algorithm' : string,
    'secret' :  any,
    'data' : string,
    'digest' : string
}

/**
 * Computes hmac 
 * ```typescript
 * let hex = hmac({algorithm: "sha256", secret : 'my secret', data : 'my data', digest : 'hex'}) 
 * ```
 */
export function hmac(params : HmacParams) {
    let {
	algorithm, secret, data , digest
    } = params
    const hmac = createHmac(algorithm, secret);
    hmac.update(data) ;
    return hmac.digest(digest as any) ; 
} 

