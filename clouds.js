import { either } from './utils.js';

let clouds = [];
let clusters = [];

function SetUpClusters() {
    let initialCloudNum = int(random(1, 20));
    for (let i = 0; i < initialCloudNum; i++) {
        clouds.push({ x: random(-100, 300), y: random(0, 150), w: either(90, 80), h: either(30, 40), shape: either('round', 'ellipse')});
    }

    let cur_Cluster = [];
    let total_in_cluster = 0;
    let cluster_x = 0;
    let cluster_y = 0;

    // Set up clusters
    for (let i = 0; i < clouds.length; i++) {
        if (total_in_cluster < 5) {
            // Adjust cloud position within the cluster
            clouds[i].x = cluster_x + random(-50, 100);
            clouds[i].y = cluster_y + random(-10, 5);
            cur_Cluster.push(clouds[i]);
            total_in_cluster++;
        } else {
            clusters.push(cur_Cluster);
            cur_Cluster = [];
            total_in_cluster = 0;
            cluster_x = random(0, 400);
            cluster_y = random(0, 400);
        }
    }
}

function drawClouds() {
    for (let i = 0; i < clusters.length; i++) {
        for (let j = 0; j < clusters[i].length; j++) {
            let cloud = clusters[i][j];
            let depthFactor = map(cloud.y, 0, 400, 1, 0.5); // Adjust size based on depth
            let adjustedWidth = cloud.w * depthFactor;
            let adjustedHeight = cloud.h * depthFactor;
            let colorFactor = map(cloud.y, 0, 400, 255, 150); // Adjust color based on depth

            fill(colorFactor);

            cloud.x += random(0, 0.1); // Adjusting cloud speed

            if(cloud.shape === 'round') {
                drawRoundPolygon(cloud.x, cloud.y, adjustedWidth, adjustedHeight, 8)
            }else {
              drawRoundPolygon(cloud.x, cloud.y, adjustedWidth, adjustedHeight, 15)
            }
        }
    }
}

function checkBoundsClouds() {
    for (let i = 0; i < clouds.length; i++) {
        if (clouds[i].x > 400) {
            clouds[i].x = 0;
        }
        if (clouds[i].y > 400) {
            clouds[i].y = 0;
        }
    }
}

function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function drawRoundPolygon(x, y, w, h, sides) {
    beginShape();
    for (let i = 0; i < TWO_PI*2; i += TWO_PI / sides ) {
        let sx = x + cos(i) * w / 2;
        let sy = y + sin(i) * h / 2;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

export { clouds, SetUpClusters, drawClouds, clusters, checkBoundsClouds };