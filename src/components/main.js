/* copyright 2018, stefano bovio @allyoucanmap. */

import {createElement, updateElement} from '../utils/SVGUtils';
import {modelViewProjectionMatrix, modelMatrix, viewMatrix, projectionMatrix} from '../utils/MatrixUtils';
import {transform} from '../utils/VectorUtils';
import {isString} from 'lodash';
import archive from './archive';

let timeout;
let animation;
let width = 0;
let height = 0;
let time = 0;
let frame = 0;
let fps = 0;

const camera = {
    type: 'perspective',
    position: [0, 0, 5],
    target: [0, 0, 0],
    up: [0, 1, 0],
    near: 3,
    far: 100,
    zoom: 50,
    fovy: 60
};

const loop = (draw = () => {}, options) => {
    let currentTime = Date.now();
    let lastTime = currentTime;
    let delta = 0;
    const start = () => {
        timeout = setTimeout(() => {
            animation = requestAnimationFrame(start);
        }, 1000 / (options.fps || 30));
        currentTime = Date.now();
        draw(time);
        delta = (currentTime - lastTime) / 1000;
        fps = Math.round(1 / delta);
        time += delta;
        lastTime = currentTime;
        frame++;
    };
    start();
};

const resize = (svg, bg, parent) => {
    width = parent.clientWidth;
    height = parent.clientHeight;
    updateElement(svg, { width, height }, { width: width + 'px', height: height + 'px'});
    updateElement(bg, { 'x': 0, 'y': 0, width, height });
};

const stop = () => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }
    if (animation) {
        cancelAnimationFrame(animation);
        animation = null;
    }
};

const entity = ({svg, model, scale, position}) => {
    const path = createElement('path');
    svg.appendChild(path);
    return {
        position: position ? position : [0, 0, 0],
        rotation: [0, 0, 0],
        scale: scale ? scale : [1.0, 1.0, 1.0],
        path,
        model: model || [
            [0.5, 0.5, -0.5],
            [-0.5, 0.5, -0.5],
            [-0.5, -0.5, -0.5],
            [0.5, -0.5, -0.5],
            [0.5, 0.5, -0.5]
        ]
    }
};

const cameraMatix = (camera, width, height) => {
    return {
        projectionMat: projectionMatrix({
            type: camera.type,
            left: -(width / 2) / camera.zoom,
            right: width / 2 / camera.zoom,
            bottom: -(height / 2) / camera.zoom,
            top: height / 2 / camera.zoom,
            fovy: camera.fovy * (Math.PI / 180.0),
            aspect: width / height,
            near: camera.near,
            far: camera.far
        }),
        viewMat: viewMatrix(camera.position, camera.target, camera.up)
    };
}

const reduceCoordinates = coordinates => {
    return coordinates.reduce((newCoordinates, coordinate) => {
        const h = Math.random() * 1;
        return [...newCoordinates, null, ...coordinate.reduce((newCoordinate, coord) => [...newCoordinate, [-coord[0], h, coord[1]]], [])];
    }, []);
};

const featureToModel = feature => {
    switch(feature.geometry.type) {
        case 'Polygon':
        return reduceCoordinates(feature.geometry.coordinates);
        case 'MultiPolygon':
        return feature.geometry.coordinates.reduce((newCoordinates, coordinate) => {
            return [...newCoordinates, ...reduceCoordinates(coordinate)];
        }, []);
        default:
        return [];
    }
};

const getVertices = (path, viewMat, projectionMat) => {
    const modelMat = modelMatrix(path);
    const mvp = modelViewProjectionMatrix(modelMat, viewMat, projectionMat);
    return path.model.reduce((str, vertex, idx) => {
        if (!vertex) {
            return str + ' M';
        }
        const tPosition = transform([...vertex, 1.0], mvp);
        const position = [tPosition[0] / tPosition[2], tPosition[1] / tPosition[2]];
        const left = ((position[0] + 1) / 2) * width;
        const top = ((1 - position[1]) / 2) * height;
        return str + (idx === 0 ? 'M' + left + ' ' + top : (!path.model[idx - 1] ? '' : ' L') + left + ' ' + top);
    }, '');
};

const getPositionFromModel = (path, vertex) => {
    const modelMat = modelMatrix(path);
    const tPosition = transform([...vertex, 1.0], modelMat);
    return [...tPosition];
};

const start = (id, options = {}) => {
    const parent = document.querySelector(id);

    if (!parent) { return null; }

    const view = isString(options.view) ? archive[options.view] || {} : options.view || {};

    width = parent.clientWidth;
    height = parent.clientHeight;
    const svg = createElement('svg', { width, height }, { width: width + 'px', height: height + 'px'});
    const bg = createElement('rect', { 'x': 0, 'y': 0, width, height, fill: '#333333' });
    svg.appendChild(bg);
    parent.appendChild(svg);

    const getData = () => ({
        parent,
        width,
        height,
        svg,
        bg,
        camera,
        entity,
        createElement,
        updateElement,
        cameraMatix,
        getVertices,
        getPositionFromModel,
        featureToModel,
        time,
        frame,
        fps
    });

    if (view.before) {
        view.before(getData());
    }

    if (view.loop) {
        loop(() => {
            view.loop(getData());
        }, options.fps || 30);
    }

    addEventListener('resize', () => {
        resize(svg, bg, parent);
        if (view.resize) {
            view.resize(getData());
        }
    }, false);

    addEventListener('beforeunload', () => {
        stop();
        if (view.after) { view.after(); } 
    }, false);

    addEventListener('unload', () => {
        stop();
    }, false);

};

export default {
    start
};