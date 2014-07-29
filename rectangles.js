// Generated by CoffeeScript 1.7.1
var Binary, Breeder, ImageMatcher, Rectangle, RectangleCollection, Scorer, go, imageMatcher, saveImage, start;

ImageMatcher = (function() {
  ImageMatcher.size = 256;

  function ImageMatcher(imageurl, numRectangles, numGenes) {
    var body, breeder, canvas, g, i, img, rectangleCollection, target, _i;
    body = document.getElementById("canvases");
    this.bestScoreField = document.getElementById("bestScore");
    this.iterationField = document.getElementById("iteration");
    target = document.getElementById("target").getContext("2d");
    img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageurl;
    img.onload = (function(_this) {
      return function() {
        target.drawImage(img, 0, 0);
        return _this.scorer = new Scorer(target);
      };
    })(this);
    this.canvases = [];
    this.scoredImages = [];
    this.rectangleCollections = [];
    for (i = _i = 1; 1 <= numGenes ? _i <= numGenes : _i >= numGenes; i = 1 <= numGenes ? ++_i : --_i) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("width", 255);
      canvas.setAttribute("height", 255);
      canvas.setAttribute("id", "canvas" + i);
      body.appendChild(canvas);
      this.canvases.push(canvas);
      g = canvas.getContext("2d");
      rectangleCollection = new RectangleCollection(Binary.random(numRectangles * Rectangle.bitCount), g);
      this.rectangleCollections.push(rectangleCollection);
      this.scoredImages.push([0, rectangleCollection]);
    }
    breeder = new Breeder;
    this.looseGraphics = [];
    this.iteration = 0;
  }

  ImageMatcher.prototype.run = function() {
    this.updateDisplays();
    this.recomputeScores();
    this.bestScoreField.innerText = this.findBestScore();
    this.iterationField.innerText = this.iteration;
    this.killWorst();
    this.killWorst();
    this.breedRandomTwo();
    this.mutateOne();
    return this.iteration++;
  };

  ImageMatcher.prototype.updateDisplays = function() {
    var scoreImagePair, _i, _len, _ref, _results;
    _ref = this.scoredImages;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      scoreImagePair = _ref[_i];
      _results.push(scoreImagePair[1].drawSelf());
    }
    return _results;
  };

  ImageMatcher.prototype.recomputeScores = function() {
    var rectangleCollection, _i, _len, _ref, _results;
    this.scoredImages = [];
    _ref = this.rectangleCollections;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      rectangleCollection = _ref[_i];
      _results.push(this.scoredImages.push([this.scorer.score(rectangleCollection.getGraphics()), rectangleCollection]));
    }
    return _results;
  };

  ImageMatcher.prototype.killWorst = function() {
    var i, pair, worstIndex, worstScore, _i, _len, _ref;
    worstIndex = 0;
    worstScore = 0;
    _ref = this.scoredImages;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      pair = _ref[i];
      if (pair[0] > worstScore) {
        worstScore = pair[0];
        worstIndex = i;
      }
    }
    this.scoredImages.splice(worstIndex, 1);
    this.looseGraphics.push(this.rectangleCollections[worstIndex].getGraphics());
    return this.rectangleCollections.splice(worstIndex, 1);
  };

  ImageMatcher.prototype.breedRandomTwo = function() {
    var child1, child2, index1, index2, parent1, parent2;
    index1 = index2 = Math.floor(Math.random() * this.scoredImages.length);
    while (index2 === index1) {
      index2 = Math.floor(Math.random() * this.scoredImages.length);
    }
    parent1 = this.rectangleCollections[index1];
    parent2 = this.rectangleCollections[index2];
    child1 = new RectangleCollection(Breeder.breed(parent1.getBinary(), parent2.getBinary()), this.looseGraphics.pop());
    child2 = new RectangleCollection(Breeder.breed(parent2.getBinary(), parent1.getBinary()), this.looseGraphics.pop());
    this.rectangleCollections.push(child1);
    this.rectangleCollections.push(child2);
    this.scoredImages.push([0, child1]);
    return this.scoredImages.push([0, child2]);
  };

  ImageMatcher.prototype.mutateOne = function() {
    var index, mutated, mutatee;
    index = Math.floor(Math.random() * this.scoredImages.length);
    mutatee = this.rectangleCollections[index];
    mutated = new RectangleCollection(Breeder.mutate(mutatee.getBinary()), mutatee.getGraphics());
    this.rectangleCollections[index] = mutated;
    return this.scoredImages[index] = [0, mutated];
  };

  ImageMatcher.prototype.findBestScore = function() {
    var bestScore, pair, _i, _len, _ref;
    bestScore = Number.MAX_VALUE;
    _ref = this.scoredImages;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pair = _ref[_i];
      if (pair[0] < bestScore) {
        bestScore = pair[0];
      }
    }
    return bestScore;
  };

  ImageMatcher.prototype.getBestRectangleCollectionIndex = function() {
    var bestIndex, bestScore, i, pair, _i, _len, _ref;
    bestIndex = 0;
    bestScore = Number.MAX_VALUE;
    _ref = this.scoredImages;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      pair = _ref[i];
      if (pair[0] < bestScore) {
        bestScore = pair[0];
        bestIndex = i;
      }
    }
    return bestIndex;
  };

  return ImageMatcher;

})();

Rectangle = (function() {
  var varBitCount;

  varBitCount = 8;

  Rectangle.bitCount = 8 * varBitCount;

  function Rectangle(binary) {
    var a;
    this.b = Binary.toInt(binary.slice(-varBitCount));
    binary = Binary.shiftRight(binary, varBitCount);
    this.g = Binary.toInt(binary.slice(-varBitCount));
    binary = Binary.shiftRight(binary, varBitCount);
    this.r = Binary.toInt(binary.slice(-varBitCount));
    binary = Binary.shiftRight(binary, varBitCount);
    a = Binary.toInt(binary.slice(-varBitCount));
    this.a = a / 255;
    binary = Binary.shiftRight(binary, varBitCount);
    this.ybar = Binary.toInt(binary.slice(-varBitCount));
    binary = Binary.shiftRight(binary, varBitCount);
    this.xbar = Binary.toInt(binary.slice(-varBitCount));
    binary = Binary.shiftRight(binary, varBitCount);
    this.y = Binary.toInt(binary.slice(-varBitCount));
    binary = Binary.shiftRight(binary, varBitCount);
    this.x = Binary.toInt(binary.slice(-varBitCount));
  }

  Rectangle.prototype.drawSelf = function(g) {
    var height, width;
    g.fillStyle = "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
    width = this.xbar - this.x;
    height = this.ybar - this.y;
    return g.fillRect(this.x, this.y, width, height);
  };

  Rectangle.prototype.printSelf = function() {
    console.log("x: " + this.x + ", y: " + this.y + ", xbar: " + this.xbar + ", ybar: " + this.ybar);
    return console.log("r: " + this.r + ", g: " + this.g + ", b: " + this.b + ", a: " + this.a + ", ");
  };

  return Rectangle;

})();

RectangleCollection = (function() {
  var magnitude, size;

  size = 256;

  magnitude = 0;

  function RectangleCollection(binary, g) {
    var rectangleBinary;
    this.binary = binary;
    this.g = g;
    binary = this.binary;
    this.rectangles = [];
    while (binary.length !== 0) {
      rectangleBinary = binary.slice(-Rectangle.bitCount);
      this.rectangles.push(new Rectangle(rectangleBinary));
      binary = Binary.shiftRight(binary, Rectangle.bitCount);
      magnitude++;
    }
    this.rectangles.reverse();
  }

  RectangleCollection.prototype.getGraphics = function() {
    return this.g;
  };

  RectangleCollection.prototype.getBinary = function() {
    return this.binary;
  };

  RectangleCollection.prototype.drawSelf = function() {
    var rectangle, _i, _len, _ref, _results;
    this.g.clearRect(0, 0, size, size);
    _ref = this.rectangles;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      rectangle = _ref[_i];
      _results.push(rectangle.drawSelf(this.g));
    }
    return _results;
  };

  RectangleCollection.prototype.printSelf = function() {
    var i, rectangle, _i, _len, _ref, _results;
    console.log("magnitude: " + magnitude);
    _ref = this.rectangles;
    _results = [];
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      rectangle = _ref[i];
      console.log("rectangle " + i);
      _results.push(rectangle.printSelf());
    }
    return _results;
  };

  return RectangleCollection;

})();

Scorer = (function() {
  function Scorer(base) {
    this.standardColors = (base.getImageData(0, 0, ImageMatcher.size, ImageMatcher.size)).data;
  }

  Scorer.prototype.score = function(graphics) {
    var i, imageColors, score, _i, _ref;
    imageColors = (graphics.getImageData(0, 0, ImageMatcher.size, ImageMatcher.size)).data;
    score = 0;
    for (i = _i = 0, _ref = imageColors.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (i % 4 !== 3) {
        score += Math.abs(imageColors[i] - this.standardColors[i]);
      }
    }
    return score;
  };

  return Scorer;

})();

Breeder = (function() {
  function Breeder() {}

  Breeder.breed = function(parent1, parent2) {
    var bitLength, splitPoint;
    bitLength = parent1.length;
    splitPoint = Math.floor(Math.random() * bitLength);
    return parent1.slice(0, splitPoint).concat(parent2.slice(splitPoint));
  };

  Breeder.mutate = function(gene) {
    var bit, bitLength, flipPoint;
    bitLength = gene.length;
    flipPoint = Math.floor(Math.random() * bitLength);
    bit = gene[flipPoint];
    gene[flipPoint] = bit === 1 ? 0 : 1;
    return gene;
  };

  return Breeder;

})();

Binary = (function() {
  function Binary() {}

  Binary.shiftLeft = function(b, num) {
    var i;
    return b.concat((function() {
      var _i, _results;
      _results = [];
      for (i = _i = 1; 1 <= num ? _i <= num : _i >= num; i = 1 <= num ? ++_i : --_i) {
        _results.push(0);
      }
      return _results;
    })());
  };

  Binary.shiftRight = function(b, num) {
    return b.slice(0, -num);
  };

  Binary.normalize = function(b1, b2) {
    var i;
    if (b1.length > b2.length) {
      b2 = ((function() {
        var _i, _ref, _ref1, _results;
        _results = [];
        for (i = _i = _ref = b2.length, _ref1 = b1.length; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
          _results.push(0);
        }
        return _results;
      })()).concat(b2);
    } else if (b2.length > b1.length) {
      b1 = ((function() {
        var _i, _ref, _ref1, _results;
        _results = [];
        for (i = _i = _ref = b1.length, _ref1 = b2.length; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
          _results.push(0);
        }
        return _results;
      })()).concat(b1);
    }
    return [b1, b2];
  };

  Binary.and = function(b1, b2) {
    var i, _i, _ref, _ref1, _results;
    _ref = this.normalize(b1, b2), b1 = _ref[0], b2 = _ref[1];
    _results = [];
    for (i = _i = 0, _ref1 = b1.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
      _results.push(b1[i] && b2[i]);
    }
    return _results;
  };

  Binary.or = function(b1, b2) {
    var i, _i, _ref, _ref1, _results;
    _ref = this.normalize(b1, b2), b1 = _ref[0], b2 = _ref[1];
    _results = [];
    for (i = _i = 0, _ref1 = b1.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
      _results.push(b1[i] || b2[i]);
    }
    return _results;
  };

  Binary.toInt = function(b) {
    return parseInt(b.join(""), 2);
  };

  Binary.random = function(numbits) {
    var i, _i, _results;
    _results = [];
    for (i = _i = 1; 1 <= numbits ? _i <= numbits : _i >= numbits; i = 1 <= numbits ? ++_i : --_i) {
      _results.push(Math.random() < .5 ? 1 : 0);
    }
    return _results;
  };

  return Binary;

})();

imageMatcher = null;

go = function() {
  var imageURL, numGenes, numRectangles;
  numRectangles = document.getElementById("numrectangles").value;
  numGenes = document.getElementById("numgenes").value;
  imageURL = document.getElementById("imageurl").value;
  imageMatcher = new ImageMatcher(imageURL, numRectangles, numGenes);
  document.getElementById("instantiation").hidden = "true";
  return setTimeout((function() {
    return start();
  }), 1000);
};

start = function() {
  return setInterval((function() {
    return imageMatcher.run();
  }), 0);
};

saveImage = function() {
  var dataURL, index;
  index = imageMatcher.getBestRectangleCollectionIndex() + 1;
  dataURL = document.getElementById("canvas" + index).toDataURL();
  return document.getElementById("snapshot").src = dataURL;
};

document.getElementById("save").onclick = (function() {
  return saveImage();
});

document.getElementById("go").onclick = (function() {
  return go();
});