import * as jose from 'jose'

const verifyBearerToken = async (accessToken, publicKey) => {
  const jwtAlgorithm = import.meta.env.VITE_JWT_ALGORITHM
  const jwtIssuer = import.meta.env.VITE_JWT_ISSUER

  try {
    const ecPublicKey = await jose.importSPKI(publicKey, jwtAlgorithm)
    const result = await jose.jwtVerify(accessToken, ecPublicKey, { issuer: jwtIssuer })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export { verifyBearerToken }
