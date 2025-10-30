const { PayOS } = require('@payos/node');

const payos = new PayOS({
  clientId: '897adec7-c895-4c2d-946a-7f0fcb47f6fe',
  apiKey: 'a85e9c41-b9e2-4365-8a32-e256c0379e52',
  checksumKey: '8d6516d74df8209c562881a086ed3ec07c8c7b96de5b04af7270881fc562fdf0',
  // bạn có thể thêm các tuỳ chọn như partnerCode, baseURL ... nếu cần
});

console.log('✅ PayOS initialized', payos);
module.exports = payos;
