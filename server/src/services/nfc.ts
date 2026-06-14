import crypto from 'crypto'

export const nfcService = {
  generateChallenge(jobId: string, customerSecret: string, counter: number) {
    const data = `${jobId}:${customerSecret}:${counter}`
    return crypto.createHash('sha256').update(data).digest('hex')
  },

  validateChallenge(challenge: string, jobId: string, customerSecret: string, counter: number) {
    const expected = this.generateChallenge(jobId, customerSecret, counter)
    return challenge === expected
  }
}
