import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StocksService } from '../stocks.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  symbol="";
  s: any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private stockSvc: StocksService) { }

  async ngOnInit() {
    this.symbol = this.activatedRoute.snapshot.params['symbol']
    console.log(this.symbol)
    this.s = await this.stockSvc.getStockDetail(this.symbol)
    
  }

}
