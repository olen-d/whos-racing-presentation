export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      apiBaseUrl: '',
      currentJWT: '',
      currentRefreshToken: '',
      doLogout: false,
      now: new Date(),
      bearerTokenPublicKey: '',
      refreshTokenPublicKey: '',
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
    async checkBearerExpiration() {
      if (this.currentJWT) {
        const { exp } = decodeBearerToken(this.currentJWT)
        const now = new Date()

        const expTimestamp = exp * 1000
        const timestamp = now.getTime()

        const timeUntilExp = expTimestamp - timestamp

        if (timeUntilExp <= 300000) {
          await this.fetchNewTokens()
        }
      } else {
        await this.fetchNewTokens()
      }
    },
    async fetchBearerTokenPublicKey() {
      try {
        const endpoint = 'api/v1/auth/token/bearer/public-key'
        const errorMessage = 'fetch bearer token public key failed'
  
        const config = { apiBaseUrl : this.apiBaseUrl }
        const { error, isLoading, fetchResult } = await useFetchGet(null, config, errorMessage, endpoint)
        if (error) {
          return false
        } else {
          const { value: { data: { publicKey }, }, } = fetchResult
          this.bearerTokenPublicKey = publicKey
        }
      } catch (error) {
        throw new Error(`Auth Store Actions Fetch Bearer Token Public Key ${error}`)
      }
    },
    async fetchRefreshTokenPublicKey() {
      try {
        const endpoint = 'api/v1/auth/token/refresh/public-key'
        const errorMessage = 'fetch refresh token public key failed'
  
        const config = { apiBaseUrl : this.apiBaseUrl }
        const { error, isLoading, fetchResult } = await useFetchGet(null, config, errorMessage, endpoint)
        if (error) {
          return false
        } else {
          const { value: { data: { publicKey }, }, } = fetchResult
          this.refreshTokenPublicKey = publicKey
        }
      } catch (error) {
        throw new Error(`Auth Store Actions Fetch Refresh Token Public Key ${error}`)
      }
    },
    async fetchNewTokens() {
      try {
        this.fetchBearerTokenPublicKey
        this.fetchRefreshTokenPublicKey

        const refreshTokenValue = this.currentRefreshToken ? this.currentRefreshToken : 'none'
        const config = { apiBaseUrl : this.apiBaseUrl }
        const { error, isLoading, fetchResult } = await useFetchPost(null, config, { refreshToken: refreshTokenValue }, 'fetch grant type refresh token failed', 'api/v1/auth/token/grant-type/refresh-token')
        if (error) {
          return false
        } else {
          const { value: { data: { accessToken, newRefreshToken }, }, } = fetchResult
          this.currentJWT = verifyBearerToken(accessToken, this.bearerTokenPublicKey) ? accessToken : ''
          this.currentRefreshToken = verifyRefreshToken(newRefreshToken, this.refreshTokenPublicKey) ? newRefreshToken : ''
        }
      } catch (error) {
        throw new Error(`Auth Store Actions Fetch New Tokens ${error}`)
      }
    },
    start() {
      this.now = new Date() + 1000 * 60
    }
  }
})
