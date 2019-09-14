import lobby_map_path from '../asset/lobby_map.svg';

import * as d3 from 'd3';

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

window.addEventListener('DOMContentLoaded', e => {
    let map = d3.select<HTMLDivElement, any>('#map');
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
        let padded = padBBox(g.node().getBBox(), {
            left: 50,
            right: 50,
            top: 50,
            bottom: 50
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
    });

});