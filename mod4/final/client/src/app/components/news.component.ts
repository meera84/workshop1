import { Component, OnInit } from '@angular/core';
import { StocksService } from '../stocks.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  news=[];
  
  constructor(private stockSvc:StocksService) { }

  ngOnInit(){

    this.stockSvc.getNews()
    .then (r=>
      { console.log(r);
        this.news = r['articles']
      }

    );
  }

}
