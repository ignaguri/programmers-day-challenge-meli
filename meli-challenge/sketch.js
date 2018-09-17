let img;
let partials = [];
let w = 1000;
let h = 1000;
const sides = {
  1: ['upperLeftColor', 'upperRightColor'], // top
  2: ['upperRightColor', 'lowerRightColor'], // right
  3: ['lowerLeftColor', 'lowerRightColor'], // bottom
  4: ['upperLeftColor', 'lowerLeftColor'] // left
};
let final = [];

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

const flatten = arr =>
  [].concat(...arr.map(v => (Array.isArray(v) ? flatten(v) : v)));

const colorMatch = (color1, color2) =>
  compareArrays(color1.levels, color2.levels);
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
      !colorMatch(square.upperLeftColor, color(0)),
      !colorMatch(square.upperRightColor, color(0)),
      !colorMatch(square.lowerLeftColor, color(0)),
      !colorMatch(square.lowerRightColor, color(0))
    ];
    return nonBlacks.filter(c => c).length === n;
  } else {
    const nonWhites = [
      !colorMatch(square.upperLeftColor, color(255)),
      !colorMatch(square.upperRightColor, color(255)),
      !colorMatch(square.lowerLeftColor, color(255)),
      !colorMatch(square.lowerRightColor, color(255))
    ];
    return nonWhites.filter(c => c).length === n;
  }
};

const getBorders = (square, side) => {
  return sides[side].every(sideColor => {
    return (
      colorMatch(square[sideColor], color(0)) ||
      colorMatch(square[sideColor], color(255))
    );
  });
};

const drawSquares = (squares, startingRow = 0, row = true) => {
  const flattenedSquares = flatten(squares);
  let index = 0;
  if (row) {
    for (let i = startingRow * 50; i < h; i += 50) {
      for (let j = 0; j < w; j += 50) {
        if (index < flattenedSquares.length) {
          image(flattenedSquares[index].square, j, i);
          index++;
        } else {
          return;
        }
      }
    }
  } else {
    for (let i = startingRow * 50; i < h; i += 50) {
      for (let j = 0; j < w; j += 50) {
        if (index < flattenedSquares.length) {
          image(flattenedSquares[index].square, i, j);
          index++;
        } else {
          return;
        }
      }
    }
  }
};

const matches = (square1, square2, side) => {
  const matchingSides = {
    1: [sides[1], sides[3]], // top
    2: [sides[2], sides[4]], // right
    3: [sides[3], sides[1]], // bottom
    4: [sides[4], sides[2]] // left
  };

  // console.log(
  //   `square1[${matchingSides[side][0][0]}]: ${
  //     square1[matchingSides[side][0][0]].levels
  //   } vs square2[${matchingSides[side][1][0]}]: ${
  //     square2[matchingSides[side][1][0]].levels
  //   }`
  // );
  // console.log(
  //   `square1[${matchingSides[side][0][1]}]: ${
  //     square1[matchingSides[side][0][1]].levels
  //   } vs square2[${matchingSides[side][1][1]}]: ${
  //     square2[matchingSides[side][1][1]].levels
  //   }`
  // );

  return (
    colorMatch(
      square1[matchingSides[side][0][0]],
      square2[matchingSides[side][1][0]]
    ) &&
    colorMatch(
      square1[matchingSides[side][0][1]],
      square2[matchingSides[side][1][1]]
    )
  );
};

const getNextToTop = (downSquare, squares) => {
  return squares.findIndex(square => matches(downSquare, square, 1));
};

const getNextToRight = (leftSquare, squares) => {
  return squares.findIndex(square => matches(leftSquare, square, 2));
};

const getNextToBottom = (upSquare, squares) => {
  return squares.findIndex(square => matches(upSquare, square, 3));
};

const getNextToLeft = (rightSquare, squares) => {
  return squares.findIndex(square => matches(rightSquare, square, 4));
};

const getTopRow = (leftCorner, squaresO, rightCorner) => {
  const squares = Array.from(squaresO);
  let topRow = [leftCorner];
  let index = 0;
  while (squares.length > 0) {
    if (index < topRow.length) {
      const next = squares.splice(getNextToRight(topRow[index], squares), 1)[0];
      topRow.push(next);
      index++;
    }
  }
  topRow.push(rightCorner);
  return topRow;
};

const getBottomRow = (leftCorner, squaresO) => {
  const squares = Array.from(squaresO);
  let bottomRow = [leftCorner];
  let index = 0;
  while (squares.length > 0) {
    if (index < bottomRow.length) {
      const next = squares.splice(
        getNextToRight(bottomRow[index], squares),
        1
      )[0];
      bottomRow.push(next);
      index++;
    }
  }
  return bottomRow;
};

const getColumn = (topSquare, squaresO) => {
  const squares = Array.from(squaresO);
  let column = [topSquare];
  let index = 0;
  while (squares.length > 0) {
    if (index < column.length) {
      const next = squares.splice(
        getNextToBottom(column[index], squares),
        1
      )[0];
      column.push(next);
      index++;
    }
  }
  return column;
};

const getRow = (firstSquare, squares) => {
  let row = [firstSquare];
  let index = 0;
  while (squares.length > 0 && index < 18) {
    if (index < row.length) {
      const next = squares.splice(getNextToRight(row[index], squares), 1)[0];
      row.push(next);
      index++;
    }
  }
  return row;
};

function setup() {
  createCanvas(1010, 1010);
  background(128);

  loadPartials();

  const squares = partials.map(analyzePartial);

  const corners = squares.filter(square => hasOnlyNCorners(square, 1));

  const topBorders = squares
    .filter(square => getBorders(square, 1))
    .filter(square => !hasOnlyNCorners(square, 1));
  // drawSquares(topBorders, 0);

  const rightBorders = squares
    .filter(square => getBorders(square, 2))
    .filter(square => !hasOnlyNCorners(square, 1));
  // drawSquares(rightBorders, 2);

  const bottomBorders = squares
    .filter(square => getBorders(square, 3))
    .filter(square => !hasOnlyNCorners(square, 1));
  // drawSquares(bottomBorders, 4);

  const leftBorders = squares
    .filter(square => getBorders(square, 4))
    .filter(square => !hasOnlyNCorners(square, 1));
  // drawSquares(leftBorders, 6);

  const innerSquares = squares.filter(
    square =>
      !topBorders.includes(square) &&
      !rightBorders.includes(square) &&
      !bottomBorders.includes(square) &&
      !leftBorders.includes(square)
  );

  const topRow = getTopRow(corners[0], topBorders, corners[2]);
  drawSquares(topRow, 0);

  final.push([topRow]);

  const firstCol = getColumn(corners[0], leftBorders); // firstCol[0] == corners[0]
  drawSquares(firstCol, 0, false);

  const lastCol = getBottomRow(corners[1], bottomBorders);
  drawSquares(lastCol, 19);

  // const secondRow = getRow(firstCol[1], innerSquares);
  // console.log(secondRow.length);
  // drawSquares(secondRow, 0, false);
  // drawSquares(final);
}
