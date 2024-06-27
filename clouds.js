import { either } from './utils.js';

let clouds = [];

let clusters = [];


function SetUpClusters(){

    let initialCloudNum = random(1, 50);
    for (let i = 0; i < initialCloudNum; i++) {
      clouds.push({ x: random(-100, 300), y: random(0, 250), w: either(90, 80), h: either(30, 40)});
    }
  
        let cur_Cluster = [];
        let total_in_cluster = 0;
        let cluser_x = 0;
        let cluser_y = 0;
        // set up clusters
        for (let i = 0; i < clouds.length; i++) {
          if (total_in_cluster < 5) {
            // make this a cluster through the x and y as well 
            clouds[i].x = cluser_x + random(-50, 100);
            clouds[i].y = cluser_y + random(-10, 5);
            cur_Cluster.push(clouds[i]);
            total_in_cluster++;
          } else {
            clusters.push(cur_Cluster);
            cur_Cluster = [];
            total_in_cluster = 0;
            cluser_x = random(0, 400);
            cluser_y = random(0, 400);
          }
        }
  }


  function drawClouds(){
    for (let i = 0; i < clusters.length; i++) {
        for (let j = 0; j < clusters[i].length; j++) {
          if (i > 0 ) {fill(220+i*2)} else { fill(255); }
          clusters[i][j].x += random(0, 0.1); // Adjusting cloud speed
          ellipse(clusters[i][j].x, clusters[i][j].y, clusters[i][j].h, clusters[i][j].w);
  
        }
        fill(200)
      }
  
  }
    export { clouds, SetUpClusters,drawClouds, clusters };