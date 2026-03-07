import 'maplibre-gl/dist/maplibre-gl.css';
import '../src/style.css';
import maplibregl from 'maplibre-gl';
import { LayoutExportControl } from '../src/index';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 20],
  zoom: 2,
});

map.addControl(new maplibregl.NavigationControl(), 'top-left');
map.addControl(new LayoutExportControl(), 'top-right');
