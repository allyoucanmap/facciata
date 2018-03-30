
import orbit from '../../data/orbit';
import countries from '../../data/countries.geo.js';
import {lerp} from '../../utils/Utils';

let orbitLatLng;
let orbitXYZ;
let path;
let paths;
let countriesLatLng;
let countriesXYZ;
let cnt = 0;

const getXYZ = coord => {
    const cosLat = Math.cos(coord[1] * Math.PI / 180.0);
    const sinLat = Math.sin(coord[1] * Math.PI / 180.0);
    const cosLon = Math.cos(coord[0] * Math.PI / 180.0);
    const sinLon = Math.sin(coord[0] * Math.PI / 180.0);
    const radius = 81;
    const x = radius * cosLat * cosLon;
    const y = radius * cosLat * sinLon;
    const z = radius * sinLat;
    return [x, z, y];
};

export default {
    before: ({svg, entity, camera, featureToModel}) => {
        camera.position = [0, 0, 35];
        
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

        orbitLatLng = orbit.map((pos) => [-parseFloat(pos.iss_position.longitude), parseFloat(pos.iss_position.latitude), 0]);
        orbitXYZ = orbitLatLng.map(pos => getXYZ(pos));
        path = entity({svg, model: [orbitXYZ[cnt]], scale: [0.1, 0.1, 0.1]});
        
    },
    loop: ({cameraMatix, camera, width, height, updateElement, getVertices, time}) => {

        const {viewMat, projectionMat} = cameraMatix(camera, width, height);
        if ( orbitXYZ[cnt]) {
            path.model = [...path.model, orbitXYZ[cnt]];
            path.rotation[1] = path.rotation[1] + 1.0;
            updateElement(path.path, {
                'd': getVertices(path, viewMat, projectionMat),
                'stroke': 'hsl(' + (Math.abs(Math.sin(time * 0.1)) * 100) + ', 100%, 75% )',
                'stroke-width': 10,
                'fill': 'none',
                'fill-opacity': 0.75
            });

            paths.forEach((path) => {
                path.rotation[1] = path.rotation[1] + 1.0;
                
                updateElement(path.path, {
                    'd': getVertices(path, viewMat, projectionMat),
                    'stroke': '#f2f2f2',
                    'stroke-width': 0.5,
                    'fill': 'none',
                    'fill-opacity': 0.75
                });
            });

            cnt += 20;
        } else {
            if (path.model.length !== orbitXYZ.length) {
                path.model = [...orbitXYZ];
            }
            path.model = path.model.map((coord, idx) => {
                return [
                    lerp(coord[0], -orbitLatLng[idx][0], 0.03),
                    lerp(coord[1], orbitLatLng[idx][1], 0.03),
                    lerp(coord[2], orbitLatLng[idx][2], 0.03)
                ];
            });
            path.rotation[1] = lerp(path.rotation[1], 0, 0.1);
            updateElement(path.path, {
                'd': getVertices(path, viewMat, projectionMat),
                'stroke': 'hsl(' + (Math.abs(Math.sin(time * 0.1)) * 100) + ', 100%, 75% )',
                'stroke-width': 2,
                'fill': 'none',
                'fill-opacity': 0.75
            });

            paths.forEach((path, idx) => {
                path.rotation[1] = lerp(path.rotation[1], 0, 0.1);
                path.model = path.model.map((coord, jdx) => {
                    if (!coord) {
                        return null;
                    }
                    return [
                        lerp(coord[0], -countriesLatLng[idx][jdx][0], 0.03),
                        lerp(coord[1], countriesLatLng[idx][jdx][2], 0.03),
                        lerp(coord[2], countriesLatLng[idx][jdx][1], 0.03)
                    ];
                });

                updateElement(path.path, {
                    'd': getVertices(path, viewMat, projectionMat),
                    'stroke': '#f2f2f2',
                    'stroke-width': 0.5,
                    'fill': 'none',
                    'fill-opacity': 0.75
                });
            });
        }
        
        
        

        

        
    }
};
