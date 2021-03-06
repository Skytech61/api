import { isValidRedirectURIValidation } from '../isValidRedirectURIValidation'

test('utils/validations/isValidRedirectURIValidation', async () => {
  expect(
    await isValidRedirectURIValidation('https://thream.divlo.fr/')
  ).toBeTruthy()
  await expect(async () => {
    await isValidRedirectURIValidation('https://google.com/')
  }).rejects.toThrowError('Untrusted URL redirection')
})
