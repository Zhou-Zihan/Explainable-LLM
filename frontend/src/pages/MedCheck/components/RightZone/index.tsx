import React, {FC, useEffect, useRef, useState} from 'react'
import { observer } from 'mobx-react'
import * as d3 from 'd3';
// import d3Tip from "d3-tip"
// d3.tip = d3Tip;
import { useStore } from '@/store/'
import './index.less'
import Card from '@/components/Card'
import { Table } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';


interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

interface DataType {
  candidateList: string;
  prediction: number;
  avg_distance: number;
  uuid: string;
}

const columns: ColumnsType<DataType> =[
  {
    title: 'Candidate List',
    dataIndex: 'candidateList',
  },
  {
    title: 'Prediction',
    dataIndex: 'prediction',
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.prediction - b.prediction,
    width: '20%',
  },
  {
    title: 'Average Distance',
    dataIndex: 'avg_distance',
    sorter: true,
    // defaultSortOrder: 'descend',
    // sorter: (a, b) => a.avg_distance - b.avg_distance,
    width: '20%',
  },
]

const getRandomuserParams = (params: TableParams) => ({
  results: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params,
});

const RightZone: FC = () => {
  const svgContainer = useRef(null);
  const {
    tsneData,
    curSourceDomain,
    chosenTargetDomain,
    rmdTarget,
    curTimeslice,
    selectedTarget,
    selectedSource
  } = useStore()

  const [tableData, setTableData] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 50,
    },
  });

  const originTime = new Date('2014/1/4').getTime()

  useEffect(()=>{
    if(chosenTargetDomain && rmdTarget){
      setLoading(true)
      var result = {}

      chosenTargetDomain.forEach((domain, i) => {
        var rmdList = rmdTarget[domain]
        result[domain] = []

        rmdList.forEach((value, idx) => {
          let dateString1 = new Date(originTime + idx*parseInt(curTimeslice)*60*60*1000).toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+) (AM|PM)/, '$3-$1-$2 $4:$5').replace("/20","/");
          let dateString2 = new Date(originTime + (idx+1)*parseInt(curTimeslice)*60*60*1000).toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+) (AM|PM)/, '$3-$1-$2 $4:$5').replace("/20","/");

          let temp: DataType = {
            candidateList: dateString1+" - "+ dateString2,
            prediction: Number(value.toFixed(2)),
            avg_distance: Number(Math.random().toFixed(2)),
            uuid: domain+"-"+idx
          }

          result[domain].push(temp)
        })
      })

      console.log(result)
      setTableData(result)
      setLoading(false)
    }

  },[chosenTargetDomain, rmdTarget])

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<DataType>,
  ) => {
    console.log('params', pagination, filters, sorter);
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    // if (pagination.pageSize !== tableParams.pagination?.pageSize) {
    //   setTableData(null);
    // }
  };

  useEffect(()=>{
    if(tsneData){
      // const targetData = tsneData.filter(d => d.domain != curSourceDomain)
      const sourceData = tsneData.filter(d => d.domain == curSourceDomain)

      var n = 100, m = 100
      const margin = { left: 10, top: 10, right: 10, bottom: 10 }

      const svg = d3.select(svgContainer.current)
      .attr("viewBox", [0, 0, 200, 200])
      .style("display", "block");

      svg.append('text')
        .text('TSNE-Projection')
        .attr('x',-20)
        .attr('y',12)
        .attr('font-size', 10)
        .attr('fill', 'rgba(69, 69, 69, 0.65)')


      const xDomain = d3.extent(tsneData.map(d => d.x))
      const xScale = d3.scaleLinear()
        .range([margin.left, 200 - margin.right])
        .domain(xDomain)

      const yDomain = d3.extent(tsneData.map(d => d.y))
      const yScale = d3.scaleLinear()
        .range([200 - margin.bottom, margin.top])
        .domain(yDomain)

      if(chosenTargetDomain){
        chosenTargetDomain.forEach((domain, idx)=>{
          const contours = d3.contourDensity()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .size([200, 200])
            .bandwidth(5)
            .thresholds(2)
          (tsneData.filter(d => d.domain == domain))

          svg.selectAll("#grid-"+domain).remove()
          svg.selectAll("#path-"+domain).remove()
          svg.selectAll("#g-"+domain).remove()


          var defs = svg.append("defs");
          var pattern = defs.append("pattern")
              .attr("id", "grid-"+domain)
              .attr("width", 5)
              .attr("height", 5)
              .attr("patternUnits", "userSpaceOnUse")
              .attr("patternTransform", "rotate(45)");

          pattern.append("path")
              .attr("id", "path-"+domain)
              .attr("d", "M 20 0 L 0 0 0 20")
              .attr("fill", "none")
              .attr("stroke", d3.schemeCategory10[idx])
              .attr("stroke-width", 1);

          svg.append("g")
              .attr("id", "g-"+domain)
              .attr("fill", "none")
              .attr("stroke", d3.schemeCategory10[idx])
              .attr("stroke-linejoin", "round")
            .selectAll("path")
            .data(contours)
            .join("path")
              .attr("stroke-width", 1)
              // .attr("fill", "url(#grid-"+domain+")")
            .attr("fill", d3.schemeCategory10[idx])
            .attr("opacity", 0.1)
              .attr("d", d3.geoPath());
        })
      }

      const contours = d3.contourDensity()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .size([200, 200])
        .bandwidth(2)
        .thresholds(2)
      (sourceData)

      console.log(contours)

      svg.selectAll("#grid-s").remove()
      svg.selectAll("#path-s").remove()
      svg.selectAll("#g-s").remove()

      var defs = svg.append("defs");
      var pattern = defs.append("pattern")
          .attr("id", "grid-s")
          .attr("width", 5)
          .attr("height", 5)
          .attr("patternUnits", "userSpaceOnUse")
          .attr("patternTransform", "rotate(45)");

      pattern.append("path")
          .attr("id", "path-s")
          .attr("d", "M 20 0 L 0 0 0 20")
          .attr("fill", "none")
          .attr("stroke", "#d16f5f")
          .attr("stroke-width", 1);

      svg.append("g")
          .attr("id", "g-s")
          .attr("fill", "none")
          .attr("stroke", "#d16f5f")
          .attr("stroke-linejoin", "round")
        .selectAll("path")
        .data([contours[0]])
        .join("path")
          .attr("stroke-width", 1)
          // .attr("fill", "url(#grid-s)")
        .attr("fill", "#d16f5f")
            .attr("opacity", 0.1)
          .attr("d", d3.geoPath());

      // const tooltip = d3.tip()
      //   .style('border', 'solid 1px black')
      //   .style('background-color', 'white')
      //   .style('border-radius', '10px')
      //   .style('float', 'left')
      //   .style('font-family', 'monospace')
      //   .html(d => `
      //     <div style='float: right'>
      //       Pokedex: ${d.pokedex_number} <br/>
      //       Name: ${d.name} <br/>
      //       Base Total: ${d.base_total} <br/>
      //       Types: ${d.type1} ${d.type2}
      //     </div>`)
      //
      // svg.call(tooltip)

      // const tars = svg.append('g')
      //   .selectAll('circle')
      //   .data(targetData)
      //   .enter()
      //   .append('circle')
      //   .attr('class', 'target')
      //     .attr('cx', d => xScale(d.x))
      //     .attr('cy', d => yScale(d.y))
      //     .attr('r', 1)
      //     .attr('opacity', 0.5)
      //     .attr('fill', '#bfbad0')

      if(selectedSource){
        svg.selectAll(".source").remove()
        const circles_group = svg.append("g")
          .attr("class", "source")

        sourceData.forEach((point,i) => {
          var t1 = new Date(point["start_time"]).getTime()
          var t0 = new Date('2014-01-04 0:00').getTime()

          if(selectedSource.includes((t1-t0)/parseInt(curTimeslice)/60/60/1000)){
            circles_group.append('circle')
              .attr('cx', xScale(point.x))
              .attr('cy', yScale(point.y))
              .attr('r', 1)
              .attr('opacity', 0.5)
              .attr('fill', "#d16f5f")
          }

        })
      }
        // .on('mouseover', tooltip.show)
        // .on('mouseout', tooltip.hide)

    }
  }, [tsneData, chosenTargetDomain, selectedSource])


  return (
    <div className="right-zone">
      <Card
        title="Comparison Panel"
        className="chart-view-card"
      >
        <div className="projection-view">
          <svg className="tsne"
            ref={svgContainer} />
        </div>
        <div className='dontknow'>

            {chosenTargetDomain && tableData?
              chosenTargetDomain.map((domain, i)=>{
                return <div className="indicator-view" key={i}>
                  <span className="domain-title">{domain}</span>
                  <Table
                    className='table'
                    columns={columns}
                    rowKey={(record) => record.uuid}
                    dataSource={tableData[domain]}
                    pagination={false}
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ y: 200 }}
                    size="small"
                  />
                </div>
              })
            :null}

        </div>
      </Card>
    </div>
  )
}

export default observer(RightZone)
