
import countries from '../../data/countries.geo.js';
import {lerp} from '../../utils/Utils';
import {range} from 'lodash';

let graticula;
let modelXYZ;
let modelXYZO;
let modelLatLon;
let countriesLatLng;
let countriesXYZ;
let countriesXYZO;
let paths;

const skip = 4;
const getXYZ = (coord, value = 1) => {
    const cosLat = Math.cos(coord[1] * Math.PI / 180.0);
    const sinLat = Math.sin(coord[1] * Math.PI / 180.0);
    const cosLon = Math.cos(coord[0] * Math.PI / 180.0);
    const sinLon = Math.sin(coord[0] * Math.PI / 180.0);

    const radius = 81;
    const x = radius * cosLat * cosLon * value;
    const y = radius * cosLat * sinLon * value;
    const z = radius * sinLat * value;
    return [x, z, y];
};
export default {
    before: ({svg, entity, camera, featureToModel}) => {
        camera.position = [0, 0, 22];
        modelLatLon = range(180).reduce((row, lat) => {
            return [...row, ...range(360).reduce((col, lon) => {
                return lon%skip === 0 && lat%skip === 0 ? [...col, [lon - 180, lat - 90, 0]] : [...col];
            }, [])];
        }, []).filter(val => val);
        modelXYZ = modelLatLon.map(coord => getXYZ(coord));
        modelXYZO = modelLatLon.map(coord => getXYZ(coord, Math.cos(coord[1] * Math.PI / 180.0)));

        countriesLatLng = countries.features.map((feature) => featureToModel(feature));
        countriesXYZ = countriesLatLng.map(country => country.map(coord =>  coord ? getXYZ([coord[0], coord[2]]) : null));
        countriesXYZO = countriesLatLng.map(country => country.map(coord =>  coord ? getXYZ([coord[0], coord[2]], Math.cos(coord[2] * Math.PI / 180.0)) : null));
        
        graticula = entity({svg, model: [...modelXYZ], scale: [0.1, 0.1, 0.1]});

        paths = countriesXYZ.map(country => {
            const path = entity({svg, model: country, scale: [0.1, 0.1, 0.1]});
            return path;
        });
    },
    loop: ({cameraMatix, camera, width, height, updateElement, getVertices, frame}) => {
        const {viewMat, projectionMat} = cameraMatix(camera, width, height);
        graticula.rotation[1] = graticula.rotation[1] + 1.0;
        graticula.model = graticula.model.map((coords, idx) => [
            lerp(coords[0], modelXYZO[idx][0], 0.02),
            lerp(coords[1], modelXYZO[idx][1], 0.02),
            lerp(coords[2], modelXYZO[idx][2], 0.02)
        ]);
        updateElement(graticula.path, {
            'd': getVertices(graticula, viewMat, projectionMat),
            'stroke': 'hsl(' + (150 + Math.abs(Math.sin(frame / 30)) * 50.0) + ', 75%, 75%)',
            'stroke-width': 0.5,
            'fill': 'none',
            'fill-opacity': 0.75
        });

        paths.forEach((path, jdx) => {
            path.rotation[1] = path.rotation[1] + 1.0;
            path.model = path.model.map((coords, idx) => coords ? [
                lerp(coords[0], countriesXYZO[jdx][idx][0], 0.02),
                lerp(coords[1], countriesXYZO[jdx][idx][1], 0.02),
                lerp(coords[2], countriesXYZO[jdx][idx][2], 0.02)
            ] : null);
            updateElement(path.path, {
                'd': getVertices(path, viewMat, projectionMat),
                'stroke': '#fff',
                'stroke-width': 1,
                'fill': '#aaff33',
                'fill-opacity': 0.5
            });
        });
    }
};
