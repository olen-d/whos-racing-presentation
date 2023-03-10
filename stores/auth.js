export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      apiBaseUrl: '',
      currentJWT: '',
      currentRefreshToken: '',
      doLogout: false,
      now: new Date(),
      bearerTokenPublicKey: '',
      refreshTokenPublicKey: ''
    }
  },

  getters: {
    jwtData (state) {
      return state.currentJWT ? JSON.parse(atob(state.currentJWT.split(".")[1])) : null
    },
    isAuthorized (state) {
      if (state.bearerTokenPublicKey && verifyBearerToken(state.currentJWT, state.bearerTokenPublicKey)) {
        return true
      } else {
        return false
      }
    },
    sub () {
      return this.jwtData ? this.jwtData.sub : null
    },
    role () {
      return this.jwtData ? this.jwtData.role : null
    }
  },

  actions: {
    checkBearerExpiration() {
      if (this.currentJWT) {
        const { exp } = decodeBearerToken(state.currentJWT)
        const now = new Date()

        const expTimestamp = exp * 1000
        const timestamp = now.getTime()

        const timeUntilExp = expTimestamp - timestamp

        if (timeUntilExp <= 300000) {
          // Refresh token
        }
      }
    },
    async fetchRefreshTokenPublicKey() {
      const endpoint = 'api/v1/auth/token/refresh/public-key'
      const errorMessage = 'fetch refresh token public key failed'

      const config = { apiBaseUrl : this.apiBaseUrl }
      const { error, isLoading, fetchResult } = await useFetchGet(null, config, errorMessage, endpoint)

    },
    async fetchNewTokens() {
      const refreshTokenValue = this.currentRefreshToken ? this.currentRefreshToken : 'none'
      const config = { apiBaseUrl : this.apiBaseUrl }
      const { error, isLoading, fetchResult } = await useFetchPost(null, config, { refreshToken: refreshTokenValue }, 'fetch grant type refresh token failed', 'api/v1/auth/token/grant-type/refresh-token')
      if (error) {
        return false
      } else {
        // Verify the tokens
      }
    },
    start() {
      this.now = new Date() + 1000 * 60
    }
  }
})

// try {

// const refreshTokenValue = state.currentRefreshToken ? state.currentRefreshToken : 'none'


// if (error) {
//   return false
// } else {
//   const { data: { accessToken, refreshToken, tokenType } } = fetchResult

//   if (tokenType === 'bearer') {
//     // TODO: Verify the tokens
//     state.currentJWT = accessToken
//     state.currentRefreshToken = refreshToken

//     const expiration = new Date()
//     expiration.setDate(expiration.getDate() +30)

//     const refreshTokenCookie = useCookie('refreshToken', { expires: expiration, httpOnly: true }) // , secure: true
//     refreshTokenCookie.value = refreshToken

//     return true
//   } else {
//     return false
//   }
// }
// }
// } catch (error) {
// throw new Error(`Auth Store Getters Is Authorized ${error}`)
// }
// },