import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd';
import { ChartService } from './chart.service';
import { ISystemLog, IArticleType, IArticleTag } from './model/chart.model';
import { Params } from '@utils/params.service';

const echarts = require('echarts/lib/echarts');
// 引入柱状图
require('echarts/lib/chart/bar');
require('echarts/lib/chart/line');
require('echarts/lib/chart/pie');
// 引入提示框和标题组件
require('echarts/lib/component/title');
require('echarts/lib/component/tooltip');
require('echarts/lib/component/toolbox');
require('echarts/lib/component/legend');
require('echarts/lib/component/legend/ScrollableLegendModel');
require('echarts/lib/component/legend/ScrollableLegendAction');
require('echarts/lib/component/legend/ScrollableLegendView');

@Component({
    selector: 'app-charts',
    templateUrl: './chart.html',
})
export class ChartComponent {
    // @ViewChild('form') private form: NgForm;
    @ViewChild('systemLog') public systemLog: ElementRef;
    @ViewChild('systemLogDate') public systemLogDate: ElementRef;
    @ViewChild('articleType') public articleType: ElementRef;
    @ViewChild('tag') public tag: ElementRef;
    @ViewChild('test') public testChart: ElementRef;

    public disable: boolean = false;
    public date: any = new Date();

    constructor (
        private http: HttpClient,
        private params: Params,
        private notification: NzNotificationService,
        private chartService: ChartService,
    ) {
    }

    public ngOnInit () {
        this.getData();
        setTimeout(() => this.testData());
    }

    public ngAfterContentInit () {
        // setTimeout(() => this.testData());
    }

    public ngDoCheck () {
        // console.log(this.date);
    }

    public changedDate (e: any) {
        this.disable = true;
        console.log(e);
        this.getSysLogDate();
    }

    public getData () {
        this.chartService.getSystemLog().subscribe((res: any) => {
            this.initSystemLogChart(res.data);
        }, (err) => {});

        this.getSysLogDate();

        this.chartService.getArticleType().subscribe((res: any) => {
            this.initArticleTypeChart(res.data);
        }, (err) => {});

        this.chartService.getArticleTag().subscribe((res: any) => {
            this.initArticleTagChart(res.data);
        }, (err) => {});
    }

    private getSysLogDate () {
        console.log('this.date:', this.date.toString());
        this.chartService.getSystemLogDate(this.date.toString())
        .finally(() => this.disable = false)
        .subscribe((res: any) => {
            this.initSystemLogDateChart(res.data);
        }, (err) => {});
    }

    // 系统日志统计
    private initSystemLogChart (list: object[]) {
        const sysLogChart = echarts.init(this.systemLog.nativeElement);
        const xAxis = list.map((m: ISystemLog) => m.date);
        const data = list.map((m: ISystemLog) => m.total);
        sysLogChart.setOption({
            title: {
                text: '系统日志',
                x: 'center',
            },
            tooltip: {},
            xAxis: {
                data: xAxis,
            },
            yAxis: {},
            series: [{
                name: '数量',
                type: 'bar',
                data,
            }],
        });
    }

    // 系统日志分时统计
    private initSystemLogDateChart (dataS: object) {
        const sysLogDateChart = echarts.init(this.systemLogDate.nativeElement);
        const keys = Object.keys(dataS);
        const xAxis = keys.filter((k: string) => k.match(/^\d{1,2}时$/));
        const data = xAxis.map((k: string) => dataS[k]);
        sysLogDateChart.setOption({
            title: {
                text: '系统日志分时统计',
                x: 'center',
            },
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    magicType: {show: true, type: ['line', 'bar']},
                    restore: {show: true},
                    saveAsImage: {show: true},
                },
            },
            tooltip : {
                trigger: 'axis',
                formatter (a: any, b: string) {
                    return `${a[0].seriesName} <br/>${a[0].name} : ${a[0].value} (次)`;
                },
            },
            xAxis: {
                type: 'category',
                data: xAxis,
                axisPointer: {
                    type: 'shadow',
                },
            },
            yAxis: {},
            series: [{
                name: '次数',
                type: 'bar',
                data,
                itemStyle: {
                    normal: {
                        color: '#0f375f',
                    },
                },
            }, {
                name: '次数',
                type: 'line',
                data,
                lineStyle: {
                    normal: {
                        color: '#60a0a8',
                    },
                },
            }],
        });
    }

    // 文章类型统计
    private initArticleTypeChart (list: object[]) {
        const articleTypeChart = echarts.init(this.articleType.nativeElement);
        const xAxis = list.map((m: IArticleType) => m.type_name);
        const data = list.map((m: IArticleType) => ({value: m.total, name: m.type_name}));
        articleTypeChart.setOption({
            title: {
                text: '文章类型',
                x: 'center',
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: xAxis,
            },
            tooltip : {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)',
            },
            series: [{
                name: '文章类型',
                type: 'pie',
                radius: '55%',
                center: ['50%', '60%'],
                data,
            }],
            color: ['#9aca61', '#0096BF', '#f6ab00', '#e44f6d', '#719fdb', '#001f4b', '#555555'],
        });
    }

    // 文章标签统计
    private initArticleTagChart (list: object[]) {
        const articleTagChart = echarts.init(this.tag.nativeElement);
        const xAxis = list.map((m: IArticleTag) => m.name);
        const data = list.map((m: IArticleTag) => ({value: m.total, name: m.name}));
        articleTagChart.setOption({
            title: {
                text: '文章标签',
                x: 'center',
            },
            tooltip : {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)',
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 20,
                bottom: 20,
                data: xAxis,
            },
            series : [
                {
                    name: '标签',
                    type: 'pie',
                    radius : '55%',
                    center: ['40%', '60%'],
                    data,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                },
            ],
        });
    }

    // 官方例子
    private testData () {
        const myChart = echarts.init(this.testChart.nativeElement);
        myChart.setOption({
            title: {
                text: '示例',
            },
            tooltip: {},
            xAxis: {
                data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子'],
            },
            yAxis: {},
            series: [{
                name: '销量',
                type: 'bar',
                data: [5, 20, 36, 10, 10, 20],
            }],
        });
    }

    public disabledDate (current: any) {
        return current && current.getTime() > Date.now();
    }
}