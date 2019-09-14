import lobby_map_path from '../asset/lobby_map.svg';

import { Station } from  '../../cashew-common/common';

import * as d3 from 'd3';
import { min } from 'd3';

function padBBox(bbox: SVGRect, padding: any) : SVGRect {
    let padded = { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
    padded.x -= padding.left;
    padded.y -= padding.right;
    padded.width += (padding.left + padding.right);
    padded.height += (padding.top + padding.bottom);
    return <SVGRect>padded;
  }

function scaleToFit(padded: any, width: number, height: number) : any {
    let scaleX = width / padded.width;
    let scaleY = height / padded.height;
    //take the smallest factor so we don't cut off the larger axis
    let scale = Math.min(scaleX, scaleY);
    return { scale: scale, x: -padded.x, y: -padded.y};
}

function initSvg(map: d3.Selection<HTMLDivElement, any, any, any>, path: string) {
    let rect = map.node().getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;
    d3.xml(lobby_map_path).then(svgData => {
        map.node().append(svgData.documentElement);
        let svg = map.select<SVGElement>('svg');
        let g = map.select<SVGGElement>('g');
        svg.attr('width', width);
        svg.attr('height', height);
        svg.style('pointer-events', 'all');
        svg.attr('viewBox', `0 0 ${width} ${height}`);
        let radialGradient = svg.append('defs')
            .append('radialGradient')
            .attr('id', 'radial-gradient')
        radialGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', 'red')
        radialGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#fff")
            .attr('stop-opacity', 0);
        svg.append('clipPath')
            .attr('id', 'clipPath')
            .append('use')
            .attr('href', '#path826');
        let padded = padBBox(g.node().getBBox(), {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        });
        let initTransform = scaleToFit(padded, width, height)
        let zoom = d3.zoom()
            .on('zoom', function() {
                g.attr('transform', d3.event.transform)
            })
            .translateExtent([[padded.x, padded.y], 
                [padded.x + padded.width, padded.y + padded.height]])
            .scaleExtent([initTransform.scale, initTransform.scale * 5])
        svg
            .call(zoom)
            .call(zoom.translateTo, initTransform.x, initTransform.y)
            .call(zoom.scaleTo, initTransform.scale)
        setInterval(() => {
            getAllStations().then(stations => {
                //we are getting null values from firebase
                //whatever
                stations = stations.filter(station => station != null);
                mapUpdate(g, stations);
            })
        }, 1000);
    });
}

const serverUrl = 'https://cashew-2dd75.firebaseapp.com';

function getAllStations(): Promise<Station[]> {
    return d3.json(serverUrl + '/getAllStations').then(json => {
        return new Promise((resolve, reject) => {
            resolve(<Station[]>json);
        })
    });
}

function mapUpdate(g: d3.Selection<SVGGElement, any, any, any>, stations: Station[]) {

    let selection = g.selectAll('g.station-g')
        .data(stations, (d: Station) => d.id.toString());
    selection.exit()
        .remove();
    selection.selectAll('circle.sound-gradient')
        .data(stations, (d: Station) => d.id.toString())
        .transition()
        .attr('r', (d: Station) => d.sound_level ** 0.6);
    
    let enter = selection.enter()
        .append('g')
        .lower()
        .attr('class', 'station-g');
    enter.append('circle')
        .attr('class', 'sound-gradient')
        .attr('cx', (d: Station) => d.location.x)
        .attr('cy', (d: Station) => d.location.y)
        .attr('r', (d: Station) => d.sound_level ** 0.6);
    enter.append('circle')
        .attr('class','station')
        .attr('cx', (d: Station) => d.location.x)
        .attr('cy', (d: Station) => d.location.y)
        .attr('r', 1);
}


window.addEventListener('DOMContentLoaded', e => {
    let map = d3.select<HTMLDivElement, any>('#map');
    initSvg(map, lobby_map_path);
});