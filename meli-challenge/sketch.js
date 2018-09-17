let img;
let partials = [];
let w = 1000;
let h = 1000;

function preload() {
  img = loadImage('../challenge.png');
}

/* UTILS */
const compareArrays = (array1, array2) => {
  return (
    array1.length === array2.length &&
    array1.sort().every(function(value, index) {
      return value === array2.sort()[index];
    })
  );
};

const equals = (a, b) => {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object'))
    return a === b;
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  if (a.prototype !== b.prototype) return false;
  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every(k => equals(a[k], b[k]));
};
/* END OF UTILS */

const loadPartials = () => {
  loadPixels();
  for (let i = 1; i <= w; i += 50) {
    for (let j = 1; j <= h; j += 50) {
      const partial = img.get(i, j, 49, 49);
      partials.push(partial);
      // image(partial, i, j);
    }
  }
};

const analyzePartial = partial => {
  upperLeft = partial.get(0, 0, 10, 10);
  upperRight = partial.get(39, 0, 10, 10);
  lowerLeft = partial.get(0, 39, 10, 10);
  lowerRight = partial.get(39, 39, 10, 10);

  let upperLeftColor = color(upperLeft.get(0, 0));
  let upperRightColor = color(upperRight.get(0, 0));
  let lowerLeftColor = color(lowerLeft.get(0, 0));
  let lowerRightColor = color(lowerRight.get(0, 0));

  return {
    square: partial,
    upperLeft,
    upperLeftColor,
    upperRight,
    upperRightColor,
    lowerLeft,
    lowerLeftColor,
    lowerRight,
    lowerRightColor
  };
};

const hasOnlyNCorners = (square, n, black = true) => {
  if (black) {
    const nonBlacks = [
      !compareArrays(square.upperLeftColor.levels, color(0).levels),
      !compareArrays(square.upperRightColor.levels, color(0).levels),
      !compareArrays(square.lowerLeftColor.levels, color(0).levels),
      !compareArrays(square.lowerRightColor.levels, color(0).levels)
    ];
    return nonBlacks.filter(c => c).length === n;
  } else {
    const nonWhites = [
      !compareArrays(square.upperLeftColor.levels, color(255).levels),
      !compareArrays(square.upperRightColor.levels, color(255).levels),
      !compareArrays(square.lowerLeftColor.levels, color(255).levels),
      !compareArrays(square.lowerRightColor.levels, color(255).levels)
    ];
    return nonWhites.filter(c => c).length === n;
  }
};

const getBorders = (square, side) => {
  const sides = {
    1: ['upperLeftColor', 'upperRightColor'], // top
    2: ['upperRightColor', 'lowerRightColor'], // right
    3: ['lowerLeftColor', 'lowerRightColor'], // bottom
    4: ['lowerLeftColor', 'upperLeftColor'] // left
  };

  return sides[side].every(sideColor => {
    return (
      compareArrays(square[sideColor].levels, color(0).levels) ||
      compareArrays(square[sideColor].levels, color(255).levels)
    );
  });
};

const drawSquares = squares => {
  let index = 0;
  for (let i = 0; i < h; i += 50) {
    for (let j = 0; j < w; j += 50) {
      if (index < squares.length) {
        image(squares[index].square, j, i);
        index++;
      } else {
        return;
      }
    }
  }
};

function setup() {
  createCanvas(1010, 1010);

  loadPartials();

  const squares = partials.map(analyzePartial);

  const corners = squares.filter(square => hasOnlyNCorners(square, 1));

  const topBorders = squares.filter(square => getBorders(square, 1));
  const rightBorders = squares.filter(square => getBorders(square, 2));
  const bottomBorders = squares.filter(square => getBorders(square, 3));
  const leftBorders = squares.filter(square => getBorders(square, 4));

  drawSquares(topBorders);
}
