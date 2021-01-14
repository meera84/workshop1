
import { Component, OnInit } from '@angular/core';

import { deleteSpac } from '../Models';
import { StocksService } from '../stocks.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

  watchlist=[];
  userid=""
  savedData:any;
  filteredData=[]
  merged=[];
  foundData = [];
  try1=[]
  totalWatchList: any;
  
  constructor(private stockSvc: StocksService) { }

  async ngOnInit() {
    this.userid = await this.stockSvc.userid;
    if (this.userid ||this.userid !=""){
      this.watchlist = await this.stockSvc.getWatchList(this.userid)
    console.log('w',this.watchlist)
    this.savedData = await this.stockSvc.sendStocklist()
    console.log('s', this.savedData)
    this.foundData = await this.getfiltereddata();
    console.log('f',this.try1)
    this.totalWatchList = await this.stockSvc.getTotalWatchList(this.userid);
    }
  }

     async getfiltereddata(){
        for (let i=0; i<this.watchlist.length; i++) {
          console.log('this.saveddata',this.savedData)
          console.log('this.watchlist',this.watchlist)
          const watchStock = this.watchlist[i]
          const theOne = this.savedData.find(v => v.symbol == watchStock.ticker)
            console.log('theOne',theOne)
          if (null == theOne)
            continue;

          // calculate 
          const newObject: any = {
            ticker: watchStock.ticker,
            fullname: theOne.name,
            volume: theOne.volume,
            closePrice: theOne.close,
            watchlistPrice: watchStock.open_price,
            difference: Math.round(((+theOne.close) - (+watchStock.open_price))*100)/100,
            loggedDate: watchStock.loggeddate,
            idwatchlist : watchStock.idwatchlist
        
          }
          this.filteredData.push(newObject)
        }
        
        return this.filteredData
      }

      async deleteWatchList(symbol,id){
        console.log(symbol,id)
        const data:deleteSpac = {
          userid : this.userid,
          id:id,
          ticker:  symbol
        }
       await this.stockSvc.delWatchList(data);
      //  window.location.reload();

      }

}
