var Immutable, {Seq} = require('immutable');

//very inspired from http://stackoverflow.com/questions/30738972/lazy-concat-in-immutable-js
//may have to implement the lazy version.
export default function flatten(item) {
  item = item.mergeDeep(this.settings);
  if(item.has('children') && item.get('children')) {
    return Seq([item])
      .concat(
        item
          .get('children')
          /* return a composed settings item or just settings */
          .flatMap(flatten, this.hasOwnProperty('factory') ? { ...this, settings: this.factory(this.settings, item) } : this.settings)
      );
  }
  return Seq([item]);
}