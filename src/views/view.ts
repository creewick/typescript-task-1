﻿import { IObservable, IObserver } from '../utils/observable/types';
import { IMeasurement } from '../state/weather/types';
import { IArticle } from '../state/news/types';
import { WeatherState } from '../state/weather';
import { NewsState } from '../state/news';
import { IView } from './types';

export class View implements IObserver, IView {
    private readonly updateMethods: Array<(obserbable: IObservable) => boolean> = [
        arg => this.tryUpdateWeather(arg),
        arg => this.tryUpdateNews(arg)
    ];

    private readonly className: string;
    private readonly newsLimit: number;
    private readonly weatherLimit: number;
    private news: string[] = new Array();
    private weather: string[] = new Array();

    constructor(newsCount: number, weatherCount: number, className: string) {
        this.weatherLimit = weatherCount;
        this.newsLimit = newsCount;
        this.className = className;
    }

    public update(observable: IObservable) {
        for (const i in this.updateMethods) {
            if (this.updateMethods[i](observable)) {
                this.render();
                return;
            }
        }
    }

    public render() {
        const text: string = [`<div class="${this.className}">`]
            .concat(this.news)
            .concat(this.weather)
            .concat(['</div>'])
            .join('\n');

        console.log(text);
    }

    private articleToString(acticle: IArticle): string {
        return `[${acticle.time}] ${acticle.category} - ${acticle.title}`;
    }

    private measureToString(m: IMeasurement): string {
        return `[${m.time}] ${m.temperature} C, ${m.pressure} P, ${m.humidity} U`;
    }

    private tryUpdateWeather(observable: IObservable) {
        if (observable instanceof WeatherState) {
            const newItems = observable
                .getMeasurements()
                .slice(-this.weatherLimit)
                .map(this.measureToString);
            if (!this.areEquals(this.weather, newItems)) {
                this.weather = newItems;
                return true;
            }
        }
        return false;
    }

    private tryUpdateNews(observable: IObservable) {
        if (observable instanceof NewsState) {
            const newItems = observable
                .getArticles()
                .slice(-this.newsLimit)
                .map(this.articleToString);
            if (!this.areEquals(this.news, newItems)) {
                this.news = newItems;
                return true;
            }
        }
        return false;
    }

    private areEquals<T>(a: string[], b: string[]) {
        return a.length === b.length && a.every((_, i) => a[i] === b[i]);
    }
}
