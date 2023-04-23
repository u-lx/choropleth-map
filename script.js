
let w = 1200;
let h = 700;
let padding = 50;

const svg = d3.select('#map')
  .attr('width', w)
  .attr('height', h)


const tooltip = d3.select('body')
  .append('div')
  .attr('id', 'tooltip')
  .style('visibility', 'hidden')


let lw = 200;
let lh = 40;
let lp = 20;
const legend = d3.select('#legend')
  .attr('width', lw)
  .attr('height', lh)

fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
  .then(resp => resp.json())
  .then(popData => dataMerge(popData))

function dataMerge(popData) {
  fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")
    .then(resp => resp.json())
    .then(geoData => {

      const counties = geoData.objects.counties.geometries;
      popData.forEach(elem => {
        let fips = elem.fips;

        for(let i=0; i<counties.length; i++) {
          let id = counties[i].id;
          if(id === fips) {
            counties[i] = Object.assign(counties[i], elem);
            break;
          }
        }
      })
      return geoData;
    })
    .then(geoData => svgGenerate(geoData))
}

function svgGenerate(data) {

  let geojson = topojson.feature(data, data.objects.counties);
  let statesjson = topojson.feature(data, data.objects.states)
  // let projection = d3.geoAlbers();
  const path = d3.geoPath();
  console.log(geojson);

  const canvas = svg.append('g')
    // .attr('padding', padding)
  canvas.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'county')
    .attr('transform', 'translate(160,30)')
    .attr('index', (d,i)=>i)
    .attr('data-fips', (d,i)=>data.objects.counties.geometries[i].fips)
    .attr('data-education', (d,i)=>data.objects.counties.geometries[i].bachelorsOrHigher)
    .attr('fill', (d,i) => {
      const percentage = data.objects.counties.geometries[i].bachelorsOrHigher
      if(percentage<10) return 'rgb(255, 255, 255)'
      else if(percentage<20) return 'rgb(223, 254, 240)'
      else if(percentage<30) return 'rgb(187, 255, 226)'
      else if(percentage<40) return 'rgb(131, 255, 202)'
      else if(percentage<50) return 'rgb(0, 255, 146)'
      else if(percentage<60) return 'rgb(5, 215, 126)'
      else if(percentage<70) return 'rgb(1, 99, 57)'
      else return 'black'
    })
    .on('mouseover', (e,d) => {
      let index = e.target.getAttribute('index')

      tooltip.style('visibility','visible')
        .style('left', event.pageX+'px')
        .style('bottom', h-event.pageY+300+'px')
        .html((d,i) => `${data.objects.counties.geometries[index].area_name}<br/>${data.objects.counties.geometries[index].bachelorsOrHigher}%`)
        .attr('data-education',(d,i)=>data.objects.counties.geometries[index].bachelorsOrHigher)
    })
    .on('mouseout', (e,d) => {
      tooltip.style('visibility','hidden')
    })

    const statesCanvas = svg.append('g')
    statesCanvas.selectAll('path')
      .data(statesjson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', 'state')
      .attr('stroke', 'black')
      .style('stroke-width', '1px')
      .attr('fill', 'rgba(0, 0, 0, 0)')
      .attr('transform', 'translate(160,30)')
      .attr('pointer-events','none')



}

// Generate Legend
const legendData = {
  colors: ['rgb(255, 255, 255)', 'rgb(223, 254, 240)', 'rgb(187, 255, 226)', 'rgb(131, 255, 202)', 'rgb(57, 249, 166)', 'rgb(0, 255, 146)', 'rgb(1, 99, 57)'],
  values: [10, 20, 30, 40, 50, 60, 70],
  integrated: [[10, 'rgb(255, 255, 255)'], [20, 'rgb(223, 254, 240)'], [30, 'rgb(187, 255, 226)'], [40, 'rgb(131, 255, 202)'], [50, 'rgb(0, 255, 146)'], [60, 'rgb(5, 215, 126)'], [70, 'rgb(1, 99, 57)']]
}

const legendScale = d3.scaleLinear()
  .domain([0,70])
  .range([lp, lw-lp])

legend.selectAll('rect')
  .data(legendData.integrated)
  .enter()
  .append('rect')
  .attr('width', (lw-lp*2)/7)
  .attr('height', lh-lp)
  .attr('x', d=>legendScale(d[0]-10))
  .attr('fill', d=>d[1])

const legendAxis = d3.axisBottom(legendScale)
  .ticks(8)

legend.append('g')
  .call(legendAxis)
  .attr('id','axis')
  .attr('transform', `translate(0,${lh-lp})`)
