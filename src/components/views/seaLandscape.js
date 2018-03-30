
import {dist} from '../../utils/Utils';
import {range} from 'lodash';

const row = 30;
const col = 30;
let sun;
let waves;

export default {
    before: ({svg, entity, camera}) => {
        
        camera.position = [0, 7, 20];

        sun = entity({
            svg,
            position: [0, 10, -70],
            scale: [5.0, 5.0, 5.0],
            model: range(200).map(() => {
                const va = [Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0];
                return dist(va, [0.0, 0.0, 0.0]) <= 1.0 ? va : null;
            }
        ).filter(val => val)});

        waves = range(row).reduce((arr, ydx) => {
            return [...arr, ...range(col).map((idx) => {
                const path = entity({
                    svg,
                    model: [
                        [0.5, 0.5, -0.5],
                        [-0.5, 0.5, -0.5],
                        [-0.5, -0.5, -0.5],
                        [0.5, -0.5, -0.5],
                        [0.5, 0.5, -0.5],
                        null,
                        [0.5, 0.5, 0.5],
                        [-0.5, 0.5, 0.5],
                        [-0.5, -0.5, 0.5],
                        [0.5, -0.5, 0.5],
                        [0.5, 0.5, 0.5],
                        null,
                        [0.5, -0.5, 0.5],
                        [-0.5, -0.5, 0.5],
                        [-0.5, -0.5, -0.5],
                        [0.5, -0.5, -0.5],
                        [0.5, -0.5, 0.5],
                        null,
                        [0.5, 0.5, 0.5],
                        [-0.5, 0.5, 0.5],
                        [-0.5, 0.5, -0.5],
                        [0.5, 0.5, -0.5],
                        [0.5, 0.5, 0.5]
                    ],
                    scale: [1.0, 0.2, 2.0],
                    position: [-col / 2 + idx * 1.1, 0.0, 5-ydx * 2.0]
                });
                return path;
            })];
        }, []);
    },
    loop: ({updateElement, time, camera, width, cameraMatix, height, getVertices}) => {

        const {viewMat, projectionMat} = cameraMatix(camera, width, height);

        waves.forEach((path, idx) => {
            const y = Math.floor(idx / col) + 1;
            path.position[1] = Math.abs(Math.cos(time + y * 0.2));
            path.position[2] = path.position[2] + Math.sin(time) * 0.1;
            updateElement(path.path, {
                'd': getVertices(path, viewMat, projectionMat),
                'stroke': 'hsl(' + (150 + y * 5) + ', 75%, 75%)',
                'stroke-width': 0.5,
                'fill': 'none',
                'fill-opacity': 1.0
            });
        });

        sun.rotation[2] = sun.rotation[2] + 1.0;
        sun.position[1] = sun.position[1] + Math.cos(time) * 0.1;
        updateElement(sun.path, {
            'd': getVertices(sun, viewMat, projectionMat),
            'stroke': 'hsl(' + (Math.abs(Math.sin(time)) * 50.0) + ', 75%, 75%)',
            'stroke-width': 0.5,
            'fill': 'none',
            'fill-opacity': 1.0
        });
    }
};
