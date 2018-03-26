import {range} from 'lodash';

const mapValue = (val, v1, v2, v3, v4) => v3 + (v4 - v3) * ((val - v1) / (v2 - v1));
const lerp = (a, b, am) =>  a + (b - a) * am;
const inside = (p, a) => {
  let ins = false;
  for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
    if (a[i][1] > p[1] !== a[j][1] > p[1] && p[0] < (a[j][0] - a[i][0]) * (p[1] - a[i][1]) / (a[j][1] - a[i][1]) + a[i][0]) {
      ins = !ins;
    }
  }
  return ins;
};

const diamond = (seed, delta, row, col) => {

  const data = range(row + 1).map(() => range(col + 1).map(x => x));

  data[0][0] = seed + (Math.random() * 2 * delta) - delta;
  data[0][col] = seed + (Math.random() * 2 * delta) - delta;
  data[row][col] = seed + (Math.random() * 2 * delta) - delta;
  data[row][0] = seed + (Math.random() * 2 * delta) - delta;

  for (let lenghtS = col; lenghtS >= 2; lenghtS /=2, delta/= 2.0){

      let halfLenghtS = lenghtS/2;

      for(let y = 0; y < row; y += lenghtS){

          for(let x =0;x< col; x += lenghtS){

              let average = data[y][x] + data[y][x+lenghtS] + data[y+lenghtS][x] + data[y+lenghtS][x+lenghtS];

              average /= 4.0;

              average = average + (Math.random()*2*delta) - delta;

              data[y+halfLenghtS][x+halfLenghtS] =  average;
          }
      }

      for(let y = 0; y <= row; y += halfLenghtS){

          for(let x = (y+halfLenghtS)%lenghtS; x <= col; x += lenghtS){

              let average = 0;

              if(x > 0 && x < col && y > 0 && y < row){

                  average = data[y][(x-halfLenghtS)] + data[y][(x+halfLenghtS)] + data[(y+halfLenghtS)][x] + data[(y-halfLenghtS)][x];
                  average /= 4.0;

              }else{

                  if(y == 0){
                      average = data[y][(x-halfLenghtS)] + data[y][(x+halfLenghtS)] + data[(y+halfLenghtS)][x] ;
                  }

                  if(x == 0){
                      average = data[y][(x+halfLenghtS)] + data[(y+halfLenghtS)][x]+ data[(y-halfLenghtS)][x];
                  }

                  if(x == col){
                      average = data[y][(x-halfLenghtS)] + data[(y+halfLenghtS)][x] + data[(y-halfLenghtS)][x];
                  }

                  if(y == row){
                      average = data[y][(x-halfLenghtS)] + data[y][(x+halfLenghtS)] + data[(y-halfLenghtS)][x];
                  }

                  average /= 3.0;
              }

              average = average + (Math.random()*2*delta) - delta;

              data[y][x] = average;
          }
      }
  }

  return data;
}

const dist = (pointA, pointB) => {
    return Math.sqrt(Math.pow(Math.abs(pointA[0] - pointB[0]), 2) + Math.pow(Math.abs(pointA[1] - pointB[1]), 2));
};

export {
  lerp,
  mapValue,
  inside,
  diamond,
  dist
};
