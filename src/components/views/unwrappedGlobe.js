
import countries from '../../data/countries.geo.js';
import {lerp} from '../../utils/Utils';

let paths;
let countriesLatLng;
let countriesXYZ;

export default {
    before: ({featureToModel, entity, svg, camera}) => {

        camera.position = [18, 18, 18];

        countriesLatLng = countries.features.map((feature) => featureToModel(feature));
        countriesXYZ = countriesLatLng.map(country => country.map(coord => {
            if (!coord) {
                return null;
            }
            const cosLat = Math.cos(coord[2] * Math.PI / 180.0);
            const sinLat = Math.sin(coord[2] * Math.PI / 180.0);
            const cosLon = Math.cos(coord[0] * Math.PI / 180.0);
            const sinLon = Math.sin(coord[0] * Math.PI / 180.0);
            const radius = 80;
            const x = radius * cosLat * cosLon;
            const y = radius * cosLat * sinLon;
            const z = radius * sinLat;
            return [x, z, y];
        }));

        paths = countriesXYZ.map(country => {
            const path = entity({svg, model: country, scale: [0.1, 0.1, 0.1]});
            return path;
        });

    },
    loop: ({frame, getVertices, updateElement, cameraMatix, camera, width, height}) => {

        const {viewMat, projectionMat} = cameraMatix(camera, width, height);

        paths.forEach((path, idx) => {

            if (frame > 90) {
                if (Math.sin(frame / 30 * 0.4) > 0.3) {
                    path.model = path.model.map((coord, jdx) => {
                        if (!coord) {
                            return null;
                        }
                        return [
                            lerp(coord[0], -countriesLatLng[idx][jdx][0], 0.03),
                            lerp(coord[1], countriesLatLng[idx][jdx][1], 0.03),
                            lerp(coord[2], -countriesLatLng[idx][jdx][2], 0.03)
                        ];
                    });
                } else if (Math.sin(frame / 30 * 0.4) < -0.3) {
                    path.model = path.model.map((coord, jdx) => {
                        if (!coord) {
                            return null;
                        }
                        return [
                            lerp(coord[0], countriesXYZ[idx][jdx][0], 0.03),
                            lerp(coord[1], countriesXYZ[idx][jdx][1], 0.03),
                            lerp(coord[2], countriesXYZ[idx][jdx][2], 0.03)
                        ];
                    });
                }
            }
        
            path.rotation[1] = path.rotation[1] - 1.0;
            
            updateElement(path.path, {
                'd': getVertices(path, viewMat, projectionMat),
                'stroke': '#333',
                'stroke-width': 0.5,
                'fill': 'hsl(' + (Math.abs(Math.sin(frame / 30)) * 259.0 + idx) + ', 75%, 75%)',
                'fill-opacity': 0.75
            });
        });
    }
};