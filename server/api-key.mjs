export function selectApiKey(userKey, serverKey) {
  if (userKey === undefined || userKey === '') return serverKey || '';
  if (typeof userKey !== 'string' || userKey.length > 256 || !userKey.trim() || /[\r\n\x00-\x1f\x7f]/.test(userKey)) {
    throw new Error('DeepSeek API Key 格式不正确');
  }
  return userKey.trim();
}
