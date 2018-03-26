/* copyright 2018, stefano bovio @allyoucanmap. */

import main from './components/main';
import css from './css/style.css';

const style = document.createElement('style');
style.innerHTML = css.toString();
document.head.appendChild(style);

window.facciata = main;
