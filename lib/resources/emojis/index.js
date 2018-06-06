let instance = null;

class EmojiResource {
  static getInstance() {
    if (!instance) {
      instance = new EmojiResource();
    }
    return instance;
  }

  constructor() {
    const emojis = require('./emojis.json');
    this.emojis = emojis.reduce((acc, obj) => ({ ...acc, [obj.code.toLowerCase()]: obj }), {});
  }

  get(name) {
    return this.emojis[name];
  }
}

export default EmojiResource.getInstance();
