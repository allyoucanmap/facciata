/* copyright 2018, stefano bovio @allyoucanmap. */

const requireViews = require.context('./views/', true, /\.js$/);
const views = requireViews.keys().reduce((view, key) => ({...view, [key.replace(/\.js|\.\//g, '')]: requireViews(key).default}), {});

export default views;