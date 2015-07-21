// Based on the origin underscore _.pick function
// Credit: https://github.com/jashkenas/underscore/blob/master/underscore.js
export default function powerPick (object, keys) {
  var result = {}, obj = object, iteratee;
  iteratee = function(key, obj) { return key in obj; };

  obj = Object(obj);

  for (var i = 0, length = keys.length; i < length; i++) {
    var key = keys[i];
    if (iteratee(key, obj)) result[key] = getPath(obj, key);
  }

  return result;
}