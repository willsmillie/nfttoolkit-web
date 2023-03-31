const hex = /0x[a-fA-F0-9]{40}/;
const emojis =
  /(\u00a9\u00ae\u2000-\u3300\ud83c\ud000-\udfff\ud83d\ud000-\udfff\ud83e\ud000-\udfff\ufe0f)?/;
const ens = new RegExp(`(?:[\\w\\-\\.${emojis}]+[^#?\\s])(?:\\.eth)`);
const ethAddressRegex = new RegExp(ens.source + '|' + hex.source);

export default ethAddressRegex;
