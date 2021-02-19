

const ThreeTwo = {};
const ThreeTwoExamples = {};
const EPS = 0.0001; // epsilon, just a really small value.



ThreeTwo.DrawStrokes = function(drawing, aspectRatio, callback){
  let points = ThreeTwo.ProjectPoints(drawing, aspectRatio);

  let camera = drawing.camera;
  let strokeStyles = drawing.strokeStyles;
  let strokes = drawing.strokes;

  for(let i=0; i<strokes.length; ++i){
    let stroke = strokes[i];
    let style = strokeStyles[stroke[0]];
    if(style == null){
      style = ["black", "1"];
    }
    let color = style[0]? style[0] : "black";
    let width = style[1]? style[1] : "2";
    let hasNullPoint = false;
    for(let j=0; j<stroke.length - 1; ++j){
      if(stroke[j+1] === null || points[stroke[j + 1]] === null){
        hasNullPoint = true;
      }
    }
    if(hasNullPoint) continue;
    for(let j=0; j<stroke.length - 1; ++j){
      let point = points[stroke[j + 1]];
      let x = point[0];
      let y = point[1];
      callback(color, width, x, y, i, j);
    }
  }
  callback(null, null, null, null, null, null);
}

ThreeTwo.DrawFills = function(drawing, aspectRatio, callback){
  let camera = drawing.camera;
  let points = drawing.points;
  let fillStyles = drawing.fillStyles;
  let fills = drawing.fills;
}

ThreeTwo.DrawPoints = function(drawing, aspectRatio, callback){
  let camera = drawing.camera;
  let points = drawing.points;
  let dist = camera.dist;
  let A = ThreeTwo.CameraMatrix(camera.lookRight, camera.lookUp);
  // console.log("Camera Matrix", A);

  let temp = [0,0,0];
  for(let i=0; i<points.length; ++i){
     let pt = points[i];
     ThreeTwo.Subtract(pt, camera.center, temp);

     let x = ThreeTwo.Dot(A[1], temp);
     let y = ThreeTwo.Dot(A[2], temp);
     let depth = ThreeTwo.Dot(A[0], temp);

     // center scene
     // the width is always from 0 to 1.
     let landscape = aspectRatio > 1;
     let w2 = landscape? 0.5 : 0.5 / aspectRatio;
     let h2 = landscape? 0.5 / aspectRatio : 0.5;
     // console.log("w2, h2", w2, h2);

     if(depth < -camera.dist + EPS) continue; // off screen

     let scale = camera.scale * camera.dist / (camera.dist + depth)
     // let scale = camera.scale;
     let xx = scale * x + w2;
     let yy = scale * y + h2;

     //let 
     callback(xx, yy, i);
  }
}

ThreeTwo.ProjectPoints = function(drawing, aspectRatio){
  let result = [];

  let camera = drawing.camera;
  let points = drawing.points;
  let center = camera.center;
  let dist = camera.dist;
  let A = ThreeTwo.CameraMatrix(camera.lookRight, camera.lookUp);
  // console.log("Camera Matrix", A);

  let temp = [0,0,0];
  for(let i=0; i<points.length; ++i){
     let pt = points[i];
     ThreeTwo.Subtract(pt, camera.center, temp);

     let x = ThreeTwo.Dot(A[1], temp);
     let y = ThreeTwo.Dot(A[2], temp);
     let depth = ThreeTwo.Dot(A[0], temp);

     // center scene
     // the width is always from 0 to 1.
     let landscape = aspectRatio > 1;
     let w2 = landscape? 0.5 : 0.5 / aspectRatio;
     let h2 = landscape? 0.5 / aspectRatio : 0.5;
     // console.log("w2, h2", w2, h2);

     if(depth < -camera.dist + EPS){ // off screen
       result.push(null);
       continue;
     }

     let scale = camera.scale * camera.dist / (camera.dist + depth)
     // let scale = camera.scale;
     let xx = scale * x + w2;
     let yy = scale * y + h2;

     //let 
     result.push([xx, yy]);
  }
  return result;
}

ThreeTwo.CameraMatrix = function(lookRight, lookUp){
  let s = -Math.PI * lookRight / 180;
  let t = Math.PI * lookUp / 180;
  let a = Math.cos(s);
  let b = Math.sin(s);
  let c = Math.cos(t);
  let d = Math.sin(t);
  return [
    [b*c, a*c, -d],
    [a, -b, 0],
    [b*d, a*d, c],
  ]
}

// operates on a in place.
ThreeTwo.Subtract = function(a, b, result){
  if(!result) result = [];
  for(let i=0; i<Math.min(a.length, b.length); ++i){
    result[i] = a[i] - b[i]; }
  return result;
}
ThreeTwo.Add = function(a, b, result){
  if(!result) result = [];
  for(let i=0; i<Math.min(a.length, b.length); ++i){
    result[i] = a[i] + b[i]; }
  return result;
}
ThreeTwo.Dot = function(a, b){
  let x = 0;
  for(let i=0; i<Math.min(a.length, b.length); ++i){
    x += a[i] * b[i]; }
  return x;
}
ThreeTwo.Scale = function(s, a, result){
  if(!result) result = [];
  for(let i=0; i < a.length; ++i){
    result[i] = a[i] * s; }
  return result;
}

ThreeTwo.Mult = function(A, x){
  return [
    ThreeTwo.Dot(A[0], x),
    ThreeTwo.Dot(A[1], x),
    ThreeTwo.Dot(A[2], x)
  ]
}

//
// Why you may want to use JSON for everything in javascript.
// Easy to save/load or send over the net.
// So many different object patterns.
//
// arrays, maps(json objects/dictionaries,
// tuples, tuple_arrays
//
// arrays have variable length, and should typically have the same type of thing in them.
// maps store items referenced by a variable name.
//
// tuples have a fixed length, and every position is a specific field.
// Every position can store a different type, but in a given position
// tuples are like maps stored in a list, where properties are accessed by number, an.
//
// , especially in the variable length
//
// a tuple 
ThreeTwoExamples.pyramid = {
   camera : {
    scale: 1/4,
    dist: 10,
    center: [0,0,0],
    lookRight: 90,
    lookUp: 45,
  },
  points: [
    [-1,-1, 0],
    [-1, 1, 0],
    [1, 0, 0],
    [0, 0, 1],
  ],
  strokeStyles:[
    ["rgba(0,0,0,0.1)", "2"] // ["color", "width"]
  ],
  strokes: [
    // stroke [styleIndex, point0, point1...]
    ["0", 0, 1, 2, 3, 0],
    ["0", 4, 5, 6, 7, 4],
    ["0", 0, 4],
    ["0", 1, 5],
    ["0", 2, 6],
    ["0", 3, 7],
  ],
  fillStyles: [
    "rgba(255, 0, 0, 0, 0.2]", // red
    "rgba(0, 255, 0, 0, 0.2]", // green
    "rgba(0, 0, 255, 0, 0.2]", // blue
  ],
  fills: [
    // ["styleIndex", point0, point1...]
    ["0", 0, 1, 2, 3], 
    ["1", 0, 1, 5, 4],
    ["2", 1, 2, 6, 5],
    /*
    ["0", 4, 5, 6, 7]
    ["1", 2, 3, ],
    ["2", ],
    */
    
  ], // TODO

}
ThreeTwoExamples.cube = {
   camera : {
    scale: 1/10,
    dist: 5,
    center: [0,-2,0],
    lookRight: 15,
    lookUp: -15,
  },

  points: [
    [-1,-1,-1],
    [-1,-1, 1],
    [-1, 1, 1],
    [-1, 1,-1],
    [ 1,-1,-1],
    [ 1,-1, 1],
    [ 1, 1, 1],
    [ 1, 1,-1],
    [0, -2, 0],
  ],
  strokeStyles:[
    ["rgba(0,0,0,0.1)", "2"] // ["color", "width"]
  ],
  strokes: [
    // stroke [styleIndex, point0, point1...]
    ["0", 0, 1, 2, 3, 0],
    ["0", 4, 5, 6, 7, 4],
    ["0", 0, 4],
    ["0", 1, 5],
    ["0", 2, 6],
    ["0", 3, 7],
  ],
  fillStyles: [
    "rgba(255, 0, 0, 0, 0.2]", // red
    "rgba(0, 255, 0, 0, 0.2]", // green
    "rgba(0, 0, 255, 0, 0.2]", // blue
  ],
  fills: [
    // ["styleIndex", point0, point1...]
    ["0", 0, 1, 2, 3], 
    ["1", 0, 1, 5, 4],
    ["2", 1, 2, 6, 5],
    /*
    ["0", 4, 5, 6, 7]
    ["1", 2, 3, ],
    ["2", ],*/
    
  ], // TODO
}
/*
*/
